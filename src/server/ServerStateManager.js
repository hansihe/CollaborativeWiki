var DocumentServer = require('./DocumentServer');
var NetworkChannel = require('./../shared/NetworkChannel');
var ot = require('ot');
var uuid = require('node-uuid');
var services = require('./serviceManager');
var eventAliases = require('./../shared/eventAliases');
var eventDataWrappers = require('./../shared/eventDataWrappers');

var tempDocuments = {};

function ServerStateManager(stream) {
    var clientConnectionThis = this;

    this.uuid = uuid.v4();

    this.channel = new NetworkChannel(stream, {
        handshake: function(callback) {
            callback(clientConnectionThis.uuid);
        },
        initDocumentChannel: function(id, callback) {
            var document = ServerStateManager.getDocumentServer(id);

            document.documentWrapper.subscribe(clientConnectionThis._transmitDocumentOperation.bind(clientConnectionThis));
            document.documentWrapper.subscribeSelection(clientConnectionThis._transmitDocumentCursor.bind(clientConnectionThis));

            var multi = services.redisClient.redisConnection.multi();

            multi.get(document.documentWrapper.propertyNames['document']);
            multi.llen(document.documentWrapper.propertyNames['operations']);

            multi.exec(function(err, results) {
                if (document) {
                    var documentText = results[0] || "";
                    console.log(results);
                    callback(true, results[1], documentText);
                } else {
                    callback(false);
                }
            });
        }
    });

    // Confirmed connection
    this.channel.on('remote', function(remote) {
        console.log("connected");

        clientConnectionThis.channel.pubsub.on(eventAliases.documentOperation, clientConnectionThis._receiveDocumentOperation.bind(clientConnectionThis));
        clientConnectionThis.channel.pubsub.on(eventAliases.documentCursor, clientConnectionThis._receiveDocumentCursor.bind(clientConnectionThis));
    });
}

ServerStateManager.prototype._receiveDocumentOperation = function(rawRepr) {//id, revision, rawOperation) { // OT operation receive
    var operationInfo = eventDataWrappers.operationDataWrapper.unpack(rawRepr);

    var document = ServerStateManager.getDocumentServer(operationInfo.documentId);
    var operation = ot.TextOperation.fromJSON(operationInfo.operation);

    document.receiveOperation({
        id: operationInfo.documentId,
        revision: operationInfo.documentRevision,
        senderUUID: this.uuid,
        operation: operation
    });
};

ServerStateManager.prototype._transmitDocumentOperation = function(operation) {
    this.channel.pubsub.publish(eventAliases.documentOperation, eventDataWrappers.operationDataWrapper.packObject({
        documentId: id,
        userId: operation.senderUUID,
        documentRevision: operation.revision,
        operation: operation.operation
    }));
};

ServerStateManager.prototype._receiveDocumentCursor = function(rawRepr) {
    var selectionInfo = eventDataWrappers.selectionDataWrapper.unpack(rawRepr);

    var document = ServerStateManager.getDocumentServer(selectionInfo.documentId);

    document.receiveSelection({
        id: selectionInfo.documentId,
        senderUUID: this.uuid,
        selection: selectionInfo.selection
    });
    console.log(JSON.stringify(selectionInfo));
};

ServerStateManager.prototype._transmitDocumentCursor = function(selection) {
    this.channel.pubsub.publish(eventAliases.documentCursor, eventDataWrappers.selectionDataWrapper.packObject({
        documentId: id,
        userId: selection.userId,
        selection: selection.selection
    }));
};

ServerStateManager.getDocumentServer = function(documentId) {
    var document = tempDocuments[documentId];
    if (!document) {
        document = new DocumentServer(documentId);
        tempDocuments[documentId] = document;
    }
    return document;
};

module.exports = ServerStateManager;