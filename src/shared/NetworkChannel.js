var dnode = require('dnode');
var PubSub = require('./PubSub');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('./underscore');

function Stream(stream, rpcMethods) {
    var streamThis = this;

    this.pubsub = new PubSub();

    this.rpc = dnode(_.assign(rpcMethods, {
        e: function(type, data) {
            streamThis.pubsub.incoming(type, data);
        }
    }));

    this._outQueue = [];
    this.pubsub.outgoing = function(type, data) {
        if(streamThis.rpcRemote) {
            streamThis.rpcRemote.e(type, data);
        } else {
            streamThis._outQueue.push({'t': type, 'd': data});
        }
    };

    this.rpc.on('remote', function(remote) {
        streamThis.rpcRemote = remote;

        streamThis._outQueue.forEach(function(item) {
            streamThis.pubsub.outgoing(item['t'], item['d']);
        });
        streamThis._outQueue = [];

        streamThis.emit('remote', remote);
        streamThis.emit('connected', streamThis);
    });

    this.rpc.on('end', function() {
        streamThis.emit('end');
        streamThis.emit('disconnected');
    });

    this.rpc.pipe(stream).pipe(this.rpc);
}

util.inherits(Stream, EventEmitter);

module.exports = Stream;