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
    console.log("create connection state", this.uuid);

    this.joinedDocuments = [];

    clientConnectionThis.boundDocumentEventTransmitter = clientConnectionThis._documentEventTransmitter.bind(clientConnectionThis);

    this.channel = new NetworkChannel(stream, {
        handshake: function(callback) {
            callback(clientConnectionThis.uuid);
        },
        initDocumentChannel: function(id, callback) {
            var document = documentServerManager.getDocumentServer(id);

            if (_.indexOf(clientConnectionThis.joinedDocuments, document) != -1) {
                throw "Document already joined";
                // TODO: Handle error case
            }

            document.documentEvent.on(clientConnectionThis.boundDocumentEventTransmitter);

            var multi = services.redisClient.redisConnection.multi();

            multi.get(document.propertyNames['document']);
            multi.llen(document.propertyNames['operations']);
            multi.zrange(document.propertyNames['editingUsers'], 0, -1);

            multi.exec(function(err, results) {
                if (document) {
                    var documentText = results[0] || "";
                    callback(true, results[1], documentText, results[2]);
                } else {
                    callback(false);
                }
            });

            clientConnectionThis.joinedDocuments.push(document);
            document.localUserJoin(clientConnectionThis.uuid);
        },
        disconnectDocument: function(documentId) {
            var document = documentServerManager.getDocumentServer(documentId);

            if (_.indexOf(clientConnectionThis.joinedDocuments, document) == -1) {
                throw "Can't leave unjoined document.";
            }

            document.documentEvent.off(clientConnectionThis.boundDocumentEventTransmitter);

            _.remove(clientConnectionThis.joinedDocuments, function(value) {
                return value === document;
            });
            document.localUserLeave(clientConnectionThis.uuid);
        },
        documentMessage: function(message) {
            var documentId = message.id;
            var document = documentServerManager.getDocumentServer(documentId);
            message['sender'] = clientConnectionThis.uuid;
            document.incomingUserDocumentMessage(message);
        }
    });

    // Confirmed connection
    this.channel.on('remote', function(remote) {
        console.log("connected");

    });

    this.channel.on('end', function() {
        console.log("disconnect");
        for (var i = 0; i < clientConnectionThis.joinedDocuments; i++) {
            var document = clientConnectionThis.joinedDocuments[i];
            document.localUserLeave(clientConnectionThis.uuid);
        }
        clientConnectionThis.joinedDocuments = [];
    });
}
_.extend(ConnectionState.prototype, EventEmitter.prototype);

ConnectionState.prototype._documentEventTransmitter = function(message) {
    this.channel.rpcRemote.documentMessage(message);
};

module.exports = ConnectionState;