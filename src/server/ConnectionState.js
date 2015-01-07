var NetworkChannel = require('./../shared/NetworkChannel');
var EventEmitter = require('events').EventEmitter;
var ot = require('ot');
var _ = require('../shared/underscore');
var uuid = require('node-uuid');
var services = require('./serviceManager');
var documentServerManager = require('./documentServerManager');

function ConnectionState(stream) {
    var clientConnectionThis = this;
    EventEmitter.call(this);

    this.uuid = uuid.v4();

    clientConnectionThis.boundDocumentOperationTransmitter = clientConnectionThis._transmitDocumentOperation.bind(clientConnectionThis);
    clientConnectionThis.boundDocumentSelectionTransmitter = clientConnectionThis._transmitDocumentCursor.bind(clientConnectionThis);

    this.channel = new NetworkChannel(stream, {
        handshake: function(callback) {
            callback(clientConnectionThis.uuid);
        },
        initDocumentChannel: function(id, callback) {
            var document = documentServerManager.getDocumentServer(id);

            document.on("operation", clientConnectionThis.boundDocumentOperationTransmitter);
            document.on("selection", clientConnectionThis.boundDocumentSelectionTransmitter);

            var multi = services.redisClient.redisConnection.multi();

            multi.get(document.propertyNames['document']);
            multi.llen(document.propertyNames['operations']);

            multi.exec(function(err, results) {
                if (document) {
                    var documentText = results[0] || "";
                    callback(true, results[1], documentText);
                } else {
                    callback(false);
                }
            });
        },
        disconnectDocument: function(documentId) {
            var document = documentServerManager.getDocumentServer(documentId);

            document.removeListener("operation", clientConnectionThis.boundDocumentOperationTransmitter);
            document.removeListener("selection", clientConnectionThis.boundDocumentSelectionTransmitter)
        },
        documentOperation: function(documentId, revision, operation) {
            var document = documentServerManager.getDocumentServer(documentId);
            document.receiveOperation({
                id: documentId,
                revision: revision,
                senderUUID: clientConnectionThis.uuid,
                operation: operation
            });
        },
        documentSelection: function(documentId, selection) {
            var document = documentServerManager.getDocumentServer(documentId);
            document.receiveSelection({
                id: documentId,
                senderUUID: clientConnectionThis.uuid,
                selection: selection
            });
        }
    });

    // Confirmed connection
    this.channel.on('remote', function(remote) {
        console.log("connected");
    });
}
_.extend(ConnectionState.prototype, EventEmitter.prototype);

ConnectionState.prototype._transmitDocumentOperation = function(id, revision, userID, operation) {
    this.channel.rpcRemote.documentOperation(id, userID, revision, operation);
};

ConnectionState.prototype._transmitDocumentCursor = function(id, userID, selection) {
    this.channel.rpcRemote.documentSelection(id, userID, selection);
};

module.exports = ConnectionState;