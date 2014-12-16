var util = require('util');
var otOrig = require('ot');
var EventEmitter = require('events').EventEmitter;
var _ = require('./../shared/underscore');
var DocumentWrapper = require('./RedisDocumentWrapper');
var services = require('./serviceManager');
var ot = require('ot');

function OTServer(name) {
    this.name = name;

    this.documentWrapper = new DocumentWrapper(name);

    EventEmitter.call(this);
}
_.extend(OTServer.prototype, EventEmitter.prototype);

OTServer.prototype.receiveOperation = function (data) {
    var otThis = this;
    var operation = data.operation;
    var revision = data.revision;

    // Obtain lock on document
    this.documentWrapper.lock(function(releaseLock) {

        var multiRead = services.redisClient.redisConnection.multi();

        multiRead.get(otThis.documentWrapper.propertyNames.document);
        multiRead.llen(otThis.documentWrapper.propertyNames.operations);
        multiRead.lrange(otThis.documentWrapper.propertyNames.operations, revision, -1);

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
            multiWrite.set(otThis.documentWrapper.propertyNames.document, document);
            multiWrite.rpush(otThis.documentWrapper.propertyNames.operations, operation.toJSON());

            var message = data || {};
            message['operation'] = operation.toJSON();
            message['revision'] = operationsLength + 1;
            multiWrite.publish(otThis.documentWrapper.propertyNames.stream, JSON.stringify(message));

            // Write results back to db
            multiWrite.exec(function(err, results) {
                console.log("Processed operation: ", operationsLength + 1);
                // ... and release lock
                releaseLock();
            });
        });
    });
};

OTServer.prototype.receiveSelection = function(data) {
    var otThis = this;

    var multiWrite = services.redisClient.redisConnection.multi();

    var message = data || {};
    multiWrite.publish(otThis.documentWrapper.propertyNames.selectionStream, JSON.stringify(message));

    multiWrite.exec(function(err, results) {
        console.log("Published selection.");
    });
};

module.exports = OTServer;