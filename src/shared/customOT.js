var util = require('util');
var otOrig = require('ot');
var EventEmitter = require('events').EventEmitter;
var _ = require('./underscore');
var DocumentWrapper = require('../redisDocumentWrapper');
var r = require('../redisClient');
var ot = require('ot');

function OTServer(name) {
    this.name = name;

    this.documentWrapper = new DocumentWrapper(name);

    EventEmitter.call(this);
}
_.extend(OTServer.prototype, EventEmitter.prototype);

OTServer.prototype.receiveOperation = function (revision, operation, additionalData) {
    var otThis = this;

    this.documentWrapper.lock(function(releaseLock) {
        var multiRead = r.redisConnection.multi();

        multiRead.get(otThis.documentWrapper.propertyNames.document);
        multiRead.llen(otThis.documentWrapper.propertyNames.operations);
        multiRead.lrange(otThis.documentWrapper.propertyNames.operations, revision, -1);

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

            var multiWrite = r.redisConnection.multi();
            multiWrite.set(otThis.documentWrapper.propertyNames.document, document);
            multiWrite.rpush(otThis.documentWrapper.propertyNames.operations, operation.toJSON());

            var message = additionalData || {};
            message['operation'] = operation.toJSON();
            message['revision'] = operationsLength + 1;
            multiWrite.publish(otThis.documentWrapper.propertyNames.stream, JSON.stringify(message));

            multiWrite.exec(function(err, results) {
                console.log("Processed: ", operationsLength + 1);
                // Release lock
                releaseLock();
            });
        });
    });
};

function OTClient() {
    otOrig.Client.call(this);
}
util.inherits(OTClient, otOrig.Client);

module.exports = {
    Server: OTServer,
    Client: OTClient
};