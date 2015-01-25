var EventEmitter = require('events').EventEmitter;
var _ = require('./../shared/underscore');
var services = require('./serviceManager');
var ot = require('ot');
var EventEndpoint = require('../shared/EventEndpoint');

var USER_DOCUMENT_TIMEOUT_DELAY = 10; // seconds

function OTServer(name) {
    var otServerThis = this;
    EventEmitter.call(this);

    this.name = name;

    this.propertyNames = _.reduce(
        {
            document: 'documentText',
            documentStream: 'documentStream',
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

    this.localClients = [];

    this.documentEvent = new EventEndpoint.RedisEndpoint(services.redisClient, this.propertyNames.documentStream);

    setInterval(function() {
        //console.log(otServerThis.localClients);
        for (var i = 0; i < otServerThis.localClients.length; i++) {
            otServerThis.userEditingVisit(otServerThis.localClients[i]);
        }
        otServerThis.removeTimedoutEditingVisits();
    }, 5000);
}
_.extend(OTServer.prototype, EventEmitter.prototype);

OTServer.prototype.incomingUserDocumentMessage = function(message) {
    var documentServerThis = this;

    switch (message.type) {
        // TODO: Validate schema for messages.
        /* Standard fields:
        {
            'type': "Message type",
            'sender': "Unique user id"
        }
         */
        case 'operation': {
            /*
            {
                'operation': "The operation the user wants to apply to the document.",
                'revision': "The document revision the operation applies to."
            }
             */
            documentServerThis.processLocalUserOperation(message);
            break;
        }
        case 'selection': {
            /*
            {
                'selection': "Updated user selection."
            }
             */
            documentServerThis.processLocalUserSelection(message);
            break;
        }
    }
};

OTServer.prototype.processLocalUserOperation = function (data) {
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
            //multiWrite.publish(otThis.propertyNames.operationStream, JSON.stringify(message));
            otThis.documentEvent.transaction(multiWrite).emit(message);

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

OTServer.prototype.localUserJoin = function(userID) {
    if (_.indexOf(this.localClients, userID) == -1) {
        this.localClients.push(userID);
    }
    this.userEditingVisit(userID);
};
OTServer.prototype.localUserLeave = function(userID) {
    _.remove(this.localClients, function(value) {
        return value == userID;
    });
    this.endUserEditingVisit(userID);
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
                console.log("timeout", usersTimedOut[i]);
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

OTServer.prototype.processLocalUserSelection = function(data) {
    var otThis = this;

    var multiWrite = services.redisClient.redisConnection.multi();

    var message = data || {};
    otThis.documentEvent.transaction(multiWrite).emit(message);
    //multiWrite.publish(otThis.propertyNames.selectionStream, JSON.stringify(message));

    multiWrite.exec(function(err, results) {
        console.log("Published selection.");
    });
};

OTServer.prototype.lock = function(task) {
    services.redisClient.lock(this.propertyNames['lock'], task);
};

module.exports = OTServer;