var DocumentServer = require('./DocumentServer');
var NetworkChannel = require('./../shared/NetworkChannel');
var ot = require('ot');
var uuid = require('node-uuid');
var services = require('./serviceManager');
var eventAliases = require('./../shared/eventAliases');
var eventDataWrappers = require('./../shared/eventDataWrappers');

var tempDocuments = {
    testDocument: new DocumentServer("testDocumentWoo5")
};

function ServerStateManager(stream) {
    var clientConnectionThis = this;

    this.debugLog = function() {
        console.log.apply(console.log, ["ClientContext", clientConnectionThis.uuid, ":"].concat(arguments))
    };

    this.uuid = uuid.v4();

    this.channel = new NetworkChannel(stream, {
        handshake: function(callback) {
            callback(clientConnectionThis.uuid);
        },
        initDocumentChannel: function(id, callback) {
            var document = ServerStateManager.getDocumentServer(id);

            document.documentWrapper.subscribe(function(operation) {
                clientConnectionThis.channel.pubsub.publish(eventAliases.documentOperation, eventDataWrappers.operationDataWrapper.packObject({
                    documentId: id,
                    userId: operation.senderUUID,
                    documentRevision: operation.revision,
                    operation: operation.operation
                }));
            });
            document.documentWrapper.subscribeSelection(function(selection) {
                clientConnectionThis.channel.pubsub.publish(eventAliases.documentCursor, eventDataWrappers.selectionDataWrapper.packObject({
                    documentId: id,
                    userId: selection.userId,
                    selection: selection.selection
                }));
            });

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
        clientConnectionThis.debugLog("Connected");

        clientConnectionThis.channel.pubsub.on(eventAliases.documentOperation, function(rawRepr) {//id, revision, rawOperation) { // OT operation receive
            var operationInfo = eventDataWrappers.operationDataWrapper.unpack(rawRepr);

            var document = ServerStateManager.getDocumentServer(operationInfo.documentId);
            var operation = ot.TextOperation.fromJSON(operationInfo.operation);

            document.receiveOperation({
                id: operationInfo.documentId,
                revision: operationInfo.documentRevision,
                senderUUID: clientConnectionThis.uuid,
                operation: operation
            });
        });
        clientConnectionThis.channel.pubsub.on(eventAliases.documentCursor, function(rawRepr) {
            var selectionInfo = eventDataWrappers.selectionDataWrapper.unpack(rawRepr);

            var document = ServerStateManager.getDocumentServer(selectionInfo.documentId);

            document.receiveSelection({
                id: selectionInfo.documentId,
                senderUUID: clientConnectionThis.uuid,
                selection: selectionInfo.selection
            });
            console.log(JSON.stringify(selectionInfo));
        });
    });
}

ServerStateManager.getDocumentServer = function(documentId) {
    var document = tempDocuments[documentId];
    if (!document) {
        document = new DocumentServer(documentId);
        tempDocuments[documentId] = document;
    }
    return document;
};

module.exports = ServerStateManager;