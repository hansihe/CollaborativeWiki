var ot = require('ot');
var _ = require('../../shared/underscore');
var thisify = require('../../shared/thisify');
var EventEmitter = require('events').EventEmitter;
var eventAliases = require('../../shared/eventAliases');
var eventDataWrappers = require('../../shared/eventDataWrappers');


/**
 * The responsibility of the DocumentClient is to manage the state of a given Document.
 * There should generally only be a single instance of DocumentClient per document id, if there are more, syncing
 * issues will pop up.
 * Mainly called by DocumentClientManager, use DocumentClientManager.requestClient to get an instance unless you know
 * what you are doing.
 * @constructor
 */
function DocumentClient(stateManager, documentClientManager, id) {
    EventEmitter.call(this);

    ot.Client.call(this);
    this.handshaken = false;

    this.text = null;

    this.id = id;

    this.stateManager = stateManager;
    this.manager = documentClientManager;
}
_.extend(DocumentClient.prototype, EventEmitter.prototype, ot.Client.prototype);

/**
 * Registers a callback for when the document receives initial state from the server.
 * If the document is already initialized, it returns immediately.
 * @param callback
 */
DocumentClient.prototype.getInitialState = function(callback) {
    var documentClientThis = this;
    if (this.isConnected()) {
        callback(this);
        return function() {}
    } else {
        this.once('initialState', callback);
        return function() {
            documentClientThis.removeListener('initialState', callback);
        }
    }
};

/**
 * Called by an editor when an edit is performed.
 * Updates the document, performs various OT magics, and transmits to the server.
 */
DocumentClient.prototype.performClientOperation = function(operation) {
    this.applyClient(operation);
};

/**
 * Called by an editor when the selection(s)/cursor(s) change.
 * Transmits the new state to the server.
 */
DocumentClient.prototype.performSelection = function(selection) {
    this.manager.sendMessage({
        type: 'userSelection',
        documentId: this.id,
        userId: null, // No reason to transmit this, the server ignores it.
        selection: selection
    });
};

DocumentClient.prototype.isConnected = function() {
    return this.handshaken;
};

/**
 * Called by DocumentClientManager when our connection is gone.
 * Should reset state and prepare for receiving a new DocumentClient.onConnected call.
 */
DocumentClient.prototype.onDisconnected = function() {
    this.handshaken = false;
    this.emit('end');
    // TODO
};

/**
 * Called by DocumentClientManager when we have a confirmed connection.
 * Performs a RPC with callback DocumentClient.channelInitCallback asking for information needed to start
 * the DocumentClient.
 */
DocumentClient.prototype.onConnected = function() {
    this.stateManager.networkChannel.rpcRemote.initDocumentChannel(this.id, thisify(this.channelInitCallback, this));
};

/**
 * Called by the server as a callback from the RPC performed in DocumentClient.onConnected.
 * Contains failure state/information needed for the DocumentClient to start.
 */
DocumentClient.prototype.channelInitCallback = function(success, revision, document) {
    console.log("DocumentClient init success: ", success, " Revision: ", revision);

    this.revision = revision;
    this.document = document;
    this.handshaken = true;

    /* this.applyOperation = function(operation) {
        this.emit('applyOperation', operation);
    }; */

    this.text = document;

    this.emit('remote');
    this.emit('documentReplace', document);
    this.emit('initialState', this);
};

/**
 * Called by ot.Client when we should transmit a operation to the server.
 */
DocumentClient.prototype.sendOperation = function(revision, operation) {
    this.text = operation.apply(this.text);
    this.emit('documentChange');

    this.manager.sendMessage({
        type: 'documentOperation',
        documentId: this.id,
        userId: null,
        documentRevision: revision,
        operation: operation
    });
};

/**
 * Called by ot.Client when we should apply a operation to the editor.
 * Gets published on the DocumentClient's event bus, 'applyOperation'.
 */
DocumentClient.prototype.applyOperation = function(operation) {
    this.text = operation.apply(this.text);
    this.emit('applyOperation', operation);
    this.emit('documentChange');
};

/**
 * Called by the DocumentClientManager when a operation is received from the server.
 */
DocumentClient.prototype.incomingServerOperation = function(ack, revision, operation) {
    if (ack) {
        this.serverAck(operation);
    } else {
        this.applyServer(operation);
    }
};

DocumentClient.prototype.incomingServerSelection = function(data) {
    this.emit('selection', data);
};

module.exports = DocumentClient;