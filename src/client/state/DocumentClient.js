var ot = require('ot');
var _ = require('../../shared/underscore');
var thisify = require('../../shared/thisify');
var EventEmitter = require('events').EventEmitter;
var EventEndpoint = require('../../shared/EventEndpoint').Endpoint;
import OTClient from '../ot/OTClient';
import ClientSelectionHelper from '../ot/ClientSelectionHelper';
var Rx = require('rx');

/**
 * The responsibility of the DocumentClient is to manage the state of a given Document.
 * There should generally only be a single instance of DocumentClient per document id, if there are more, syncing
 * issues will pop up.
 * Mainly called by DocumentClientManager, use DocumentClientManager.requestClient to get an instance unless you know
 * what you are doing.
 * @constructor
 */
function DocumentClient(state, documentClientManager, id) {
    this.state = state;
    
    this.handshaken = false;
    this.id = id;

    this.destroyObservable = new Rx.Observable();

    this.otClient = new OTClient();
    this.otClient.sendOperation = (revision, operation) => {
        this.outMessage.onNext({
            'type': 'operation',
            'operation': operation,
            'revision': revision
        });
    };

    this.otClient.applyOperation = operation => this.clientOperation.onNext(operation);
    // When a operation should be applied to the client text
    this.clientOperation = new Rx.Subject();
    this.clientOperation.subscribe(this.textOperationApply);

    // When we have a new document body and should replace it without jerking around with operations
    this.textReplace = new Rx.Subject();
    this.textReplace.subscribe(text => this.text.onNext(text));

    this.text = new Rx.BehaviorSubject("");
    this.usersO = new Rx.BehaviorSubject({});
    this.usersO.map(users => _.omit(users, this.state.connectionId.getValue())).subscribe(this.otherUsers);
    this.otherUsers = new Rx.BehaviorSubject({});

    // When a operation should be applied to the text
    this.textOperationApply = new Rx.Subject();
    this.textOperationApply.map(operation => operation.apply(this.text.getValue())).subscribe(this.text);
    this.textOperationApply.subscribe(operation => this.transformSelections(operation));

    this.initialState = new Rx.ReplaySubject(1);

    this.outMessage = new Rx.Subject(); // Messages out to server
    this.state.documentMessageStreamSubject.subscribe(
            stream => this.outMessage.takeUntil(this.state.documentMessageStreamSubject).subscribe(
                message => {message.id = this.id; stream.onNext(message);}));

    this.inMessageO = new Rx.Subject(); // Messages in from the server

    var inOperations = this.inMessageO.filter(m => m.type == 'operation');
    inOperations.subscribe(message => {
        var operation = ot.TextOperation.fromJSON(message.operation);
        if (message.sender == this.state.connectionId.getValue()) {
            this.otClient.serverAck(operation);
        } else {
            this.otClient.applyServer(operation);
        }
    });

    var inSelections = this.inMessageO.filter(m => m.type == 'selection');
    inSelections.subscribe(message => {
        let selections = message.selections;

        if (this.outstanding) {
            selections = ClientSelectionHelper.transformRanges(message.selections, this.outstanding);}
        if (this.buffer) {
            selections = ClientSelectionHelper.transformRanges(message.selections, this.buffer);}

        var users = this.usersO.getValue();
        users[message.sender].selections = selections;
        this.usersO.onNext(users);
    });

    var userJoins = this.inMessageO.filter(m => m.type == 'user_join');
    userJoins.subscribe(message => {
        var users = this.usersO.getValue();
        users[message.user] = {
            selections: []
        };
        this.usersO.onNext(users);
    });

    var userLeaves = this.inMessageO.filter(m => m.type == 'user_leave');
    userLeaves.subscribe(message => {
        this.usersO.onNext(_.omit(this.usersO.getValue(), message.user));
    });
}
//_.extend(DocumentClient.prototype, EventEmitter.prototype);

/**
 * Called by the server as a callback from the RPC performed in DocumentClient.onConnected.
 * Contains failure state/information needed for the DocumentClient to start.
 */
DocumentClient.prototype.channelInitCallback = function(success, revision, document, users) {
    console.log("DocumentClient init success: ", success, " Revision: ", revision);

    this.otClient.revision = revision;
    this.handshaken = true;
    
    var tUsers = _.reduce(users, function(result, user) {
        result[user] = {
            selections: []
        };
        return result;
    }, {});
    this.usersO.onNext(tUsers);

    this.textReplace.onNext(document);

    //this.emit('remote');
    //this.emit('documentReplace', document);
    //this.documentChangeEvent.emit();
    //this.emit('initialState', this);
    this.initialState.onNext(this);
};

DocumentClient.prototype.handleOutMessage = function(message) {
    message.id = this.id;
    this.rpc.documentMessage(message);
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
        return function() {};
    } else {
        var endS = new Rx.Subject();
        this.initialState.takeUntil(endS).first().subscribe(callback);
        return () => endS.onNext();
    }
};

/**
 * Disconnects/destroys this DocumentClient.
 * Please note that although it might not get disconnected immediately, it is unsafe to use this DocumentClient once
 * this has been called.
 * Should NOT be called by anything other than DocumentClientManager.destroyClient under normal circumstances.
 */
DocumentClient.prototype.destroyDocument = function() {
    this.rpc.disconnectDocument(this.id);
};

/**
 * Called by an editor when an edit is performed.
 * Updates the document, performs various OT magics, and transmits to the server.
 */
DocumentClient.prototype.performClientOperation = function(operation) {
    this.textOperationApply.onNext(operation);
    this.otClient.applyClient(operation);
};

/**
 * Called by an editor when the selection(s)/cursor(s) change.
 * Transmits the new state to the server.
 */
DocumentClient.prototype.performSelection = function(selection) {
    this.outMessage.onNext({
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
    //this.emit('end');
    // TODO
};

/**
 * Called by DocumentClientManager when we have a confirmed connection.
 * Performs a RPC with callback DocumentClient.channelInitCallback asking for information needed to start
 * the DocumentClient.
 */
DocumentClient.prototype.onConnected = function(rpc) {
    this.rpc = rpc;
    rpc.initDocumentChannel(this.id, thisify(this.channelInitCallback, this));
};

DocumentClient.prototype.transformSelections = function(operation) {
    //_.map(this.usersO.getValue(), function(value, key, object) {
    //    object[key].selections = ClientSelectionHelper.transformRanges(value.selections, operation);
    //});
    //this.selectionsChangeEvent.emit();
    // TODO
};

module.exports = DocumentClient;
