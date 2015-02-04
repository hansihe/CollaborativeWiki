var dnode = require('dnode');
var shoe = require('shoe');
var PubSub = require('./PubSub');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('./underscore');

class NetworkChannel extends EventEmitter {

    constructor(rpcMethods) {
        super();

        var this_ = this;
        this.rpcMethods = rpcMethods;

        this.pubsub = new PubSub();

        this._outQueue = [];
        this.pubsub.outgoing = function(type, data) {
            if(this_.rpcRemote) {
                this_.rpcRemote.e(type, data);
            } else {
                this_._outQueue.push({'t': type, 'd': data});
            }
        };

    }

    newStream(stream) {
        this.stream = stream;

        this.rpc = this.makeRpc();
        this.rpcRemote = null;

        this.rpc.pipe(stream).pipe(this.rpc);

    }

    makeRpc() {
        var this_ = this;

        let rpc = dnode(_.assign(this_.rpcMethods, {
            e: function(type, data) {
                this_.pubsub.incoming(type, data);
            }
        }));

        rpc.on('remote', function(remote) {
            this_.rpcRemote = remote;

            this_._outQueue.forEach(function(item) {
                this_.pubsub.outgoing(item['t'], item['d']);
            });
            this_._outQueue = [];

            this_.emit('remote', remote);
            this_.emit('connected', this_);
        });

        rpc.on('end', function() {
            this_.emit('end');
            this_.emit('disconnected');
        });

        return rpc;
    }

}

module.exports = NetworkChannel;