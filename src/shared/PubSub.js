var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('./underscore');

function PubSub() {
    var pubSubThis = this;

    this.incoming = function(type, data) {
        pubSubThis.emit.apply(pubSubThis, [type].concat(data));
    };
    this.outgoing = function(type, data) {
        throw "No handler set for outgoing.";
    };
    this.publish = function() {
        pubSubThis.outgoing(arguments[0], _.rest(arguments));
    };
}

util.inherits(PubSub, EventEmitter);

module.exports = PubSub;