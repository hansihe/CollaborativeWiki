var NetworkChannel = require('./ServerNetworkChannel');
var EventEmitter = require('events').EventEmitter;
var ot = require('ot');
var _ = require('../shared/underscore');
var uuid = require('node-uuid');
var services = require('./serviceManager');
var documentServerManager = require('./documentServerManager');
var dnode = require('dnode');
var util = require('../shared/util');
var Rx = require('rx');
require('rx-react');

function ConnectionState(stream) {
    var streamEndObservable = Rx.Observable.fromEvent(stream, 'end');

    var clientConnectionThis = this;
    EventEmitter.call(this);

    this.uuid = uuid.v4();
    console.log("create connection state", this.uuid);

    this.joinedDocuments = [];

    clientConnectionThis.boundDocumentEventTransmitter = clientConnectionThis._documentEventTransmitter.bind(clientConnectionThis);

    var rpc = dnode({
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

            document.dal.getInitialDocumentData(id).done(function(data) {
                callback(true, data.revision, data.document, data.currentUsers);
            }, function() {
                callback(false);
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
        }
    });

    var rpcRemoteSubject = new Rx.BehaviorSubject();
    Rx.Observable.fromEvent(rpc, 'remote').subscribe(rpcRemoteSubject);

    var rpcStream = stream.substream('d');
    util.dPipe(rpc, rpcStream);

    this.documentMessageStream = stream.substream('dm');
    this.documentMessageStream.on('data', function(message) {
        var documentId = message.id;
        var document = documentServerManager.getDocumentServer(documentId);
        message.sender = clientConnectionThis.uuid;
        document.incomingUserDocumentMessage(message);
    });

    var this_ = this;
    this.dm2 = stream.substream('dm2');

    async function dm2InData(message) {
        console.log("InMessage", message);

        let ext = message.type[0];
        let endpoint = message.type[1];

        let id = message.id;

        switch (ext) {
            case "base": {
                switch (endpoint) {
                    case "DOCUMENT_CONNECT": {
                        var document = documentServerManager.getDocumentServer(id);

                        document.documentEvent.on(message => {
                            console.log(message);
                            this_.dm2.write(message);
                        });

                        var initialState = await document.dal.getInitialDocumentData(id);
                        this_.dm2.write({
                            type: ["initialState", "INITIAL_STATE"],
                            msg: {
                                revision: initialState.revision,
                                text: initialState.document
                            },
                            id: id
                        });
                        break;
                    }
                }
                break;
            }
        }
    }

    this.dm2.on('data', function(message) {
        dm2InData(message).catch(err => console.error(err));
    });
    
    stream.on('end', function() {
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
    this.documentMessageStream.write(message);
};

module.exports = ConnectionState;
