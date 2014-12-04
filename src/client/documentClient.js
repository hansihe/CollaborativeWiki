var ot = require('ot');
var _ = require('../shared/underscore');
var thisify = require('../shared/thisify');
var EventEmitter = require('events').EventEmitter;
var eventAliases = require('../shared/eventAliases');


function DocumentClient(manager, id) {
    EventEmitter.call(this);

    ot.Client.call(this);
    this.handshaken = false;

    this.id = id;
    this.manager = manager;
}
_.extend(DocumentClient.prototype, EventEmitter.prototype, ot.Client.prototype);

DocumentClient.prototype.applyChange = function(operation) {
    this.applyClient(operation);
};

DocumentClient.prototype.applySelection = function(selection) {
    this.manager.remote.publish(eventAliases.documentCursor, this.id, selection);
};

DocumentClient.prototype.onDisconnected = function() {
    this.handshaken = false;
    this.emit('end');
    // TODO
};

DocumentClient.prototype.onConnected = function() {
    var documentClientThis = this;

    documentClientThis.manager.remote.rpcRemote.initDocumentChannel(documentClientThis.id, thisify(this.channelInitCallback, this));
};

DocumentClient.prototype.isConnected = function() {
    return this.handshaken;
};

DocumentClient.prototype.channelInitCallback = function(success, revision, document) {
    console.log("DocumentClient init success: ", success, " Revision: ", revision);

    this.revision = revision;
    this.document = document;
    this.handshaken = true;

    this.applyOperation = function(operation) {
        this.emit('applyOperation', operation);
    };
    this.sendOperation = function(revision, operation) {
        var jsonOperation = operation.toJSON();
        this.manager.remote.pubsub.publish(eventAliases.documentOperation, this.id, revision, jsonOperation);
        console.log("S <- C: ", this.id, revision, operation);
    };

    this.emit('remote');
    this.emit('documentReplace', document);
};

DocumentClient.prototype.incomingServerOperation = function(ack, revision, operation) {
    if (ack) {
        this.serverAck(operation);
    } else {
        this.applyServer(operation);
    }
    console.log("C <- S: ", this.id, ack, revision, operation);
};

module.exports = DocumentClient;