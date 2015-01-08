var EventEmitter = require('events').EventEmitter;
var _ = require('./../shared/underscore');
var services = require('./serviceManager');
var ot = require('ot');

var USER_DOCUMENT_TIMEOUT_DELAY = 10; // seconds

function OTServer(name) {
    var otServerThis = this;
    EventEmitter.call(this);

    this.name = name;

    this.propertyNames = _.reduce(
        {
            document: 'documentText',
            operations: 'operations',
            lock: 'operationsLock',

            editingUsers: 'editingUsers',
            editingUsersLock: 'editingUsersLock',

            operationStream: 'operationStream',
            selectionStream: 'selectionStream',
            userStream: 'userStream'
        },
        function(result, value, key) {
            result[key] = otServerThis.name + "_" + value;
            return result;
        },
        {}
    );

    services.redisClient.subscribe(this.propertyNames.operationStream, this._receiveOperation.bind(this));
    services.redisClient.subscribe(this.propertyNames.selectionStream, this._receiveSelection.bind(this));

    setInterval(function() {
        otServerThis.removeTimedoutEditingVisits();
    }, 5000);
}
_.extend(OTServer.prototype, EventEmitter.prototype);

OTServer.prototype.receiveOperation = function (data) {
    var otThis = this;
    var operation = ot.TextOperation.fromJSON(data.operation);
    var revision = data.revision;

    // Obtain lock on document
    this.lock(function(releaseLock) {

        var multiRead = services.redisClient.redisConnection.multi();

        multiRead.get(otThis.propertyNames.document);
        multiRead.llen(otThis.propertyNames.operations);
        multiRead.lrange(otThis.propertyNames.operations, revision, -1);

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
                operation = transform(operation, concurrentOperations[i])[0];
            }

            // ... and apply that on the document.
            document = operation.apply(document);
            // Store operation in history.
            //otThis.operations.push(operation.toJSON());

            var multiWrite = services.redisClient.redisConnection.multi();
            multiWrite.set(otThis.propertyNames.document, document);
            multiWrite.rpush(otThis.propertyNames.operations, operation.toJSON());

            var message = data || {};
            message['operation'] = operation.toJSON();
            message['revision'] = operationsLength + 1;
            multiWrite.publish(otThis.propertyNames.operationStream, JSON.stringify(message));

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
};

OTServer.prototype.userEditingVisit = function(userID) {
    var otServerThis = this;

    services.redisClient.lock(otServerThis.propertyNames.editingUsersLock, function(releaseLock) {
        var currentDate = Math.floor(new Date() / 1000);

        var multi = services.redisClient.redisConnection.multi();
        multi.zscore(otServerThis.propertyNames.editingUsers, userID); // Get the last checkin timestamp of the user id, returns null if nonexistent
        multi.zadd(otServerThis.propertyNames.editingUsers, currentDate, userID); // Add the user with the current timestamp

        multi.exec(function (err, results) {
            var lastClientCheckin = results[0];
            if (!lastClientCheckin) {
                services.redisClient.redisConnection.publish([otServerThis.propertyNames.userStream, JSON.stringify({
                    'action': 'join',
                    'userID': userID
                })], function() {
                    releaseLock();
                });
            }
        });
    });
};
OTServer.prototype.removeTimedoutEditingVisits = function() {
    var otServerThis = this;

    services.redisClient.lock(otServerThis.propertyNames.editingUsersLock, function(releaseLock) {
        var currentDate = Math.floor(new Date() / 1000);

        var multi = services.redisClient.redisConnection.multi();
        multi.zrangebyscore(otServerThis.propertyNames.editingUsers, 0, currentDate - USER_DOCUMENT_TIMEOUT_DELAY);   // Get all users which have timed out...
        multi.zremrangebyscore(otServerThis.propertyNames.editingUsers, 0, currentDate - USER_DOCUMENT_TIMEOUT_DELAY); // and remove them

        multi.exec(function(err, results) {
            var usersTimedOut = results[0];

            var multi = services.redisClient.redisConnection.multi();
            for (var i = 0; i < usersTimedOut.length; i++) {
                multi.publish(otServerThis.propertyNames.userStream, JSON.stringify({
                    'action': 'leave',
                    'userID': usersTimedOut[i]
                }));
            }
            multi.exec(function(err, results) {
                releaseLock();
            });
        });
    });
};
OTServer.prototype.endUserEditingVisit = function(userID) {
    var otServerThis = this;
    services.redisClient.lock(otServerThis.propertyNames.editingUsersLock, function(releaseLock) {
        services.redisClient.redisConnection.zrem([otServerThis.propertyNames.editingUsers, userID], function(err) {
            services.redisClient.redisConnection.publish([otServerThis.propertyNames.userStream, JSON.stringify({
                'action': 'leave',
                'userID': userID
            })], function() {
                releaseLock();
            });
        });
    });
};

OTServer.prototype.receiveSelection = function(data) {
    var otThis = this;

    var multiWrite = services.redisClient.redisConnection.multi();

    var message = data || {};
    multiWrite.publish(otThis.propertyNames.selectionStream, JSON.stringify(message));

    multiWrite.exec(function(err, results) {
        console.log("Published selection.");
    });
};

OTServer.prototype._receiveOperation = function(data) {
    this.emit("operation", data.id, data.revision, data.senderUUID, data.operation);
};
OTServer.prototype._receiveSelection = function(data) {
    this.emit("selection", data.id, data.senderUUID, data.selection);
};

OTServer.prototype.lock = function(task) {
    services.redisClient.lock(this.propertyNames['lock'], task);
};

module.exports = OTServer;