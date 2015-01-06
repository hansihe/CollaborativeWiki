var DocumentServer = require('./DocumentServer');
var NetworkChannel = require('./../shared/NetworkChannel');
var ot = require('ot');
var uuid = require('node-uuid');
var services = require('./serviceManager');
var eventAliases = require('./../shared/eventAliases');
var eventDataWrappers = require('./../shared/eventDataWrappers');
var CommunicationHelper = require('../shared/DocumentCommunicationHelper');

function ServerStateManager(stream) {
    var clientConnectionThis = this;

    this.uuid = uuid.v4();

    this.channel = new NetworkChannel(stream, {
        handshake: function(callback) {
            callback(clientConnectionThis.uuid);
        },
        initDocumentChannel: function(id, callback) {
            var document = ServerStateManager.getDocumentServer(id);

            document.documentWrapper.subscribe(clientConnectionThis._transmitDocumentOperation.bind(clientConnectionThis, id));
            document.documentWrapper.subscribeSelection(clientConnectionThis._transmitDocumentCursor.bind(clientConnectionThis, id));

            var multi = services.redisClient.redisConnection.multi();

            multi.get(document.documentWrapper.propertyNames['document']);
            multi.llen(document.documentWrapper.propertyNames['operations']);

            multi.exec(function(err, results) {
                if (document) {
                    var documentText = results[0] || "";
                    callback(true, results[1], documentText);
                } else {
                    callback(false);
                }
            });
        },
        documentOperation: function(documentId, revision, operation) {
            var document = ServerStateManager.getDocumentServer(documentId);


            document.receiveOperation({
                id: documentId,
                revision: revision,
                senderUUID: clientConnectionThis.uuid,
                operation: operation
            });
        },
        documentSelection: function(documentId, selection) {
            var document = ServerStateManager.getDocumentServer(documentId);
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

        //clientConnectionThis.channel.pubsub.on(eventAliases.documentCursor, clientConnectionThis._receiveDocumentCursor.bind(clientConnectionThis));
        //clientConnectionThis.channel.pubsub.on('p', clientConnectionThis._receiveMessage.bind(clientConnectionThis));
    });
}

ServerStateManager.prototype._transmitDocumentOperation = function(id, operation) {
    this.channel.rpcRemote.documentOperation(id, operation.senderUUID, operation.revision, operation.operation);
};

ServerStateManager.prototype._transmitDocumentCursor = function(id, selection) {
    this.channel.rpcRemote.documentSelection(id, selection.userId, selection.selection);
};

var tempDocuments = {};

ServerStateManager.getDocumentServer = function(documentId) {
    var document = tempDocuments[documentId];
    if (!document) {
        document = new DocumentServer(documentId);
        tempDocuments[documentId] = document;
    }
    return document;
};

module.exports = ServerStateManager;