var NetworkChannel = require('../../shared/NetworkChannel');
var DocumentClientManager = require('./DocumentClientManager');
var EventEmitter = require('events').EventEmitter;
var shoe = require('shoe');
var thisify = require('../../shared/thisify');
var _ = require('../../shared/underscore');
var ot = require('ot');

function rewireEvent(source, type, destination, destinationType) {
    destinationType = destinationType || type;
    source.on(type, function() {
        destination.emit.apply(destination, [destinationType].concat(arguments))
    });
}

/**
 * This class is tasked with managing all state of the client, including connection, document, login, more.
 * Notable properties are:
 * * documentClientManager - manages and provides DocumentClients
 * @constructor
 */
function ClientState() {
    var clientStateThis = this;

    this.userId = undefined;

    EventEmitter.call(this);

    this.documentClientManager = new DocumentClientManager(this);

    this.sock = shoe('/endpoint');
    this.networkChannel = new NetworkChannel(this.sock, {
        // RPC
        documentMessage: function(message) {
            clientStateThis.documentClientManager.incomingServerDocumentMessage(message);
        }
    });

    rewireEvent(this.networkChannel, 'connected', this, 'networkConnected');
    rewireEvent(this.networkChannel, 'disconnected', this, 'networkDisconnected');

    this.on('networkConnected', thisify(this._onNetworkConnected, this));
    this.on('networkReady', thisify(this._onNetworkReady, this));
    this.on('networkDisconnected', thisify(this._onNetworkDisconnected, this));
}
_.extend(ClientState.prototype, EventEmitter.prototype);

/**
 * Called on the networkConnected event.
 * When this event is fired, we have a fully functional socket to the server, however we haven't performed handshake
 * yet.
 */
ClientState.prototype._onNetworkConnected = function() {
    console.log('connect');

    this.networkChannel.rpcRemote.handshake(thisify(this.handshakeCallback, this));
};

/**
 * Used as a callback for the server, response to the handshake.
 * @param userId
 */
ClientState.prototype.handshakeCallback = function(userId) {
    this.emit('networkReady');

    this.userId = userId;
};

/**
 * Called on the networkReady event.
 * When this event is fired, we have finished the handshake with the server, and have a lot of delicious state
 * available.
 * When this is called, you should probably start preparing for normal operation.
 */
ClientState.prototype._onNetworkReady = function() {
    console.log('ready');
};

/**
 * Called on the networkDisconnected event.
 * Should prepare to receive a new onConnected event.
 */
ClientState.prototype._onNetworkDisconnected = function() {
    console.log('disconnect');
};

module.exports = ClientState;