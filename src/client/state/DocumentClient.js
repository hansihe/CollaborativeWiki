var ot = require('ot');
var _ = require('../../shared/underscore');
var thisify = require('../../shared/thisify');
var EventEmitter = require('events').EventEmitter;
var EventEndpoint = require('../../shared/EventEndpoint').Endpoint;

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

    this.id = id;

    this.text = null;
    this.users = {};

    this.stateManager = stateManager;
    this.manager = documentClientManager;

    // Fired when there is a change in the document on the client side (unconfirmed)
    this.clientOperationEvent = new EventEndpoint(this, 'clientDocumentChange');
    // Fired when there is a change in the document from the server (confirmed)
    this.serverOperationEvent = new EventEndpoint(this, 'serverDocumentChange');

    // Fired when there is any change at all in the document data
    this.documentChangeEvent = new EventEndpoint(this, 'documentChange');

    this.usersChangeEvent = new EventEndpoint(this, 'usersChange');
    this.selectionsChangeEvent = new EventEndpoint(this, 'selectionsChange');

    this.outMessage = new EventEndpoint(this, 'outMessage');
    this.inMessage = new EventEndpoint(this, 'inMessage');

    this.outMessage.on(this.handleOutMessage.bind(this));
    this.inMessage.on(this.handleInMessage.bind(this));
}
_.extend(DocumentClient.prototype, EventEmitter.prototype, ot.Client.prototype);

DocumentClient.prototype.handleInMessage = function(message) {
    var type = message.type;
    switch (type) {
        case 'operation': {
            var operation = ot.TextOperation.fromJSON(message.operation);
            if (message.sender == this.stateManager.userId) {
                this.serverAck(operation);
            } else {
                this.applyServer(operation);
            }
            break;
        }
        case 'selection': {
            console.log(message);
            this.users[message.sender] = {
                selections: message.selections
            };
            this.selectionsChangeEvent.emit();
            break;
        }
        case 'user_join': {
            this.users[message.user] = {
                selections: []
            };
            this.usersChangeEvent.emit();
            break;
        }
        case 'user_leave': {
            delete this.users[message.user];
            this.usersChangeEvent.emit();
            break;
        }
    }
};

DocumentClient.prototype.handleOutMessage = function(message) {
    message.id = this.id;
    this.stateManager.networkChannel.rpcRemote.documentMessage(message);
};

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
 * Disconnects/destroys this DocumentClient.
 * Please note that although it might not get disconnected immediately, it is unsafe to use this DocumentClient once
 * this has been called.
 * Should NOT be called by anything other than DocumentClientManager.destroyClient under normal circumstances.
 */
DocumentClient.prototype.destroyDocument = function() {
    this.stateManager.networkChannel.rpcRemote.disconnectDocument(this.id);
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
    this.outMessage.emit({
        'type': 'selection',
        'selections': selection
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
DocumentClient.prototype.channelInitCallback = function(success, revision, document, users) {
    console.log("DocumentClient init success: ", success, " Revision: ", revision);

    this.revision = revision;
    this.document = document;
    this.handshaken = true;
    this.users = _.reduce(users, function(result, user) {
        result[user] = {
            selections: []
        };
        return result;
    }, {});

    this.text = document;

    this.emit('remote');
    this.emit('documentReplace', document);
    this.documentChangeEvent.emit();
    this.emit('initialState', this);
};

/**
 * Called by ot.Client when we should transmit a operation to the server.
 */
DocumentClient.prototype.sendOperation = function(revision, operation) {
    this.text = operation.apply(this.text);
    this.documentChangeEvent.emit();

    this.outMessage.emit({
        'type': 'operation',
        'operation': operation,
        'revision': revision
    });
};

/**
 * Called by ot.Client when we should apply a operation to the editor.
 * Gets published on the DocumentClient's event bus, 'applyOperation'.
 */
DocumentClient.prototype.applyOperation = function(operation) {
    this.text = operation.apply(this.text);

    this.serverOperationEvent.emit(operation);
    this.documentChangeEvent.emit();
};

module.exports = DocumentClient;