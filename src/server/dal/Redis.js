var Promise = require('bluebird');
var services = require('../serviceManager');
var _ = require('../../shared/underscore');
var ot = require('ot');
var DALInterface = require('./Interface');

class Redis extends DALInterface {
    constructor() {
        super();

        this.client = services.redisClient;

        this.propertyNames = {
            document: 'documentText',
            operations: 'operations',
            lock: 'operationsLock',

            editingUsers: 'editingUsers',
            editingUsersLock: 'editingUsersLock',

            userCursors: 'userCursors',

            documentStream: 'documentStream'
        };
    }

    getKeyName(property, documentId) {
        return documentId + "_" + this.propertyNames[property];
    }

    subscribeDocumentEvent(documentId, listener) {
        this.client.subscribe(this.getKeyName('documentStream', documentId), listener);
    }

    unsubscribeDocumentEvent(documentId, listener) {
        this.client.unSubscribe(this.getKeyName('documentStream', documentId), listener);
    }

    publishDocumentEvent(documentId, event) {
        this.client.publish(this.getKeyName('documentStream', documentId), event);
    }

    publishDocumentEventOnTransaction(transaction, documentId, event) {
        transaction.publish(this.getKeyName('documentStream', documentId), JSON.stringify(event));
    }

    lock(task, type='lock') {
        services.redisClient.lock(this.propertyNames[type], task);
    };

    applyOperation(documentId, revision, operation, author, data) { // The last data param should be removed
        var this_ = this;

        // Obtain lock on document
        this.lock(function(releaseLock) {

            var multiRead = this_.client.redisConnection.multi();

            multiRead.get(this_.getKeyName('document', documentId));
            multiRead.llen(this_.getKeyName('operations', documentId));
            multiRead.lrange(this_.getKeyName('operations', documentId), revision, -1);

            // Fetch data necessary for transformation
            multiRead.exec(function(err, results) {
                var document = results[0] || "";
                var operationsLength = results[1];

                if (revision < 0 || operationsLength < revision) {
                    releaseLock();
                    throw new Error("operation revision not in history");
                }
                // Find all operations that the client didn't know of when it sent the
                // operation ...
                var concurrentOperations = results[2];

                // ... and transform the operation against all these operations ...
                var transform = ot.TextOperation.transform;
                for (var i = 0; i < concurrentOperations.length; i++) {
                    operation = transform(operation, ot.TextOperation.fromJSON(JSON.parse(concurrentOperations[i])))[0];
                }

                // ... and apply that on the document.
                document = operation.apply(document);
                // Store operation in history.
                //otThis.operations.push(operation.toJSON());

                var multiWrite = this_.client.redisConnection.multi();
                multiWrite.set(this_.getKeyName('document', documentId), document);
                multiWrite.rpush(this_.getKeyName('operations', documentId), JSON.stringify(operation.toJSON()));

                var message = data || {};
                message['operation'] = operation.toJSON();
                message['revision'] = operationsLength + 1;
                //multiWrite.publish(otThis.propertyNames.operationStream, JSON.stringify(message));
                //this_.documentEvent.transaction(multiWrite).emit(message);
                this_.publishDocumentEventOnTransaction(multiWrite, documentId, message);

                // Write results back to db
                multiWrite.exec(function(err, results) {
                    if (err) {
                        /* TODO: At this point the client's state is messed up.
                         * This SHOULD never really happen, but if it does, we want to tell the client do a complete state
                         * reload from the server.
                         */
                        releaseLock();
                        console.error("Applying operation to document failed! ", err, results);
                        throw "User editing checkin failed!";
                    }

                    console.log("Processed operation: ", operationsLength + 1);
                    // ... and release lock
                    releaseLock();
                });
            });
        });
    }

    applySelection(documentId, data) {
        var multiWrite = this.client.redisConnection.multi();

        this.publishDocumentEventOnTransaction(multiWrite, documentId, data);
        multiWrite.hset(this.getKeyName('userCursors', documentId), data.sender, JSON.stringify({
            selection: data.selections
        }));

        multiWrite.exec(function(err, results) {
            //console.log("Published selection.");
        });
    }

    userEditingVisit(documentId, userId) {
        var this_ = this;

        this.lock(function(releaseLock) {
            var currentDate = Math.floor(new Date() / 1000);

            var multi = services.redisClient.redisConnection.multi();
            multi.zscore(this_.getKeyName('editingUsers', documentId), userId); // Get the last checkin timestamp of the user id, returns null if nonexistent
            multi.zadd(this_.getKeyName('editingUsers', documentId), currentDate, userId); // Add the user with the current timestamp

            multi.exec(function(err, results) {
                var lastClientCheckin = results[0];
                if (!lastClientCheckin) {
                    var multi = services.redisClient.redisConnection.multi();
                    this_.publishDocumentEventOnTransaction(multi, documentId, {
                        id: documentId,
                        type: 'user_join',
                        user: userId
                    });
                    multi.exec(function() {
                        releaseLock();
                    });
                }
            });
        }, 'editingUsersLock');
    }

    timeoutUserEditingVisits(documentId) {
        var this_ = this;
        services.redisClient.lock(this_.propertyNames.editingUsersLock, function(releaseLock) {
            var currentDate = Math.floor(new Date() / 1000);

            var multi = services.redisClient.redisConnection.multi();
            multi.zrangebyscore(this_.getKeyName('editingUsers', documentId), 0, currentDate - 10);   // Get all users which have timed out...
            multi.zremrangebyscore(this_.getKeyName('editingUsers', documentId), 0, currentDate - 10); // and remove them

            multi.exec(function(err, results) {
                var usersTimedOut = results[0];

                var multi = services.redisClient.redisConnection.multi();
                for (var i = 0; i < usersTimedOut.length; i++) {
                    this_.publishDocumentEventOnTransaction(multi, documentId, {
                        id: documentId,
                        type: 'user_leave',
                        user: usersTimedOut[i]
                    });

                    console.log("timeout", usersTimedOut[i]);
                }
                multi.exec(function(err, results) {
                    releaseLock();
                });
            });
        });
    }

    endUserEditingVisit(documentId, userId) {
        var this_ = this;
        services.redisClient.lock(this_.propertyNames.editingUsersLock, function(releaseLock) {
            services.redisClient.redisConnection.zrem([this_.getKeyName('editingUsers', documentId), userId], function(err) {
                var multi = services.redisClient.redisConnection.multi();
                this_.publishDocumentEventOnTransaction(multi, documentId, {
                    id: documentId,
                    type: 'user_leave',
                    user: userId
                });
                multi.exec(function() {
                    releaseLock();
                });
            });
        });
    }

    getInitialDocumentData(documentId) {
        var this_ = this;
        return new Promise(function(fulfill, reject) {
            var multi = services.redisClient.redisConnection.multi();

            multi.get(this_.getKeyName('document', documentId));
            multi.llen(this_.getKeyName('operations', documentId));
            multi.zrange(this_.getKeyName('editingUsers', documentId), 0, -1);

            multi.exec(function(err, results) {
                if (err) {
                    reject();
                }
                fulfill({
                    document: results[0] || "",
                    revision: results[1],
                    currentUsers: results[2]
                })
            });
        });
    }
}

module.exports = Redis;
