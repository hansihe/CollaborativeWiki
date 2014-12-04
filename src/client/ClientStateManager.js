var NetworkChannel = require('../shared/NetworkChannel');
var DocumentClientManager = require('./DocumentClientManager');
var EventEmitter = require('events').EventEmitter;
var shoe = require('shoe');
var thisify = require('../shared/thisify');
var _ = require('../shared/underscore');

function rewireEvent(source, type, destination, destinationType) {
    destinationType = destinationType || type;
    source.on(type, function() {
        destination.emit.apply(destination, [destinationType].concat(arguments))
    });
}

function ClientStateManager() {
    this.userId = undefined;

    EventEmitter.call(this);

    this.sock = shoe('/endpoint');
    this.networkChannel = new NetworkChannel(this.sock, {
        // RPC
    });

    rewireEvent(this.networkChannel, 'connected', this, 'networkConnected');
    rewireEvent(this.networkChannel, 'disconnected', this, 'networkDisconnected');

    this.documentClientManager = new DocumentClientManager(this);

    this.on('networkConnected', thisify(this.onNetworkConnected, this));
    this.on('networkReady', thisify(this.onNetworkReady, this));
    this.on('networkDisconnected', thisify(this.onNetworkDisconnected, this));
}
_.extend(ClientStateManager.prototype, EventEmitter.prototype);

ClientStateManager.prototype.onNetworkConnected = function() {
    console.log('connect');

    this.networkChannel.rpcRemote.handshake(thisify(this.handshakeCallback, this));
};

ClientStateManager.prototype.handshakeCallback = function(userId) {
    this.emit('networkReady');

    this.userId = userId;
};

ClientStateManager.prototype.onNetworkReady = function() {
    console.log('ready');
};

ClientStateManager.prototype.onNetworkDisconnected = function() {
    console.log('disconnect');
};

module.exports = ClientStateManager;