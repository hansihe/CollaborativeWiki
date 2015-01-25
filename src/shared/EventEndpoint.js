/**
 * A helper class which wraps events of a certain type to and from the parents event emitter.
 * @param parentObject
 * @param eventName
 * @constructor
 */
function Endpoint(parentObject, eventName) {
    this.parent = parentObject;
    this.name = eventName;
}

Endpoint.prototype.on = function(listener) {
    this.parent.addListener(this.name, listener);
};

Endpoint.prototype.off = function(listener) {
    this.parent.removeListener(this.name, listener);
};

Endpoint.prototype.emit = function() {
    this.parent.emit.apply(this.parent, [this.name].concat(Array.prototype.slice.call(arguments)));
};

Endpoint.prototype.chainFrom = function(src) {
    src.on(this.emit);
    return this;
};

/**
 * Should be thought of as the same as Endpoint, except distributed. Several servers can emit and listen to each others
 * events.
 * @param redisClient
 * @param eventName
 * @constructor
 */
function RedisEndpoint(redisClient, eventName) {
    this.client = redisClient;
    this.name = eventName;
}

RedisEndpoint.prototype.on = function(listener) {
    this.client.subscribe(this.name, listener);
};

RedisEndpoint.prototype.off = function(listener) {
    this.client.unSubscribe(this.name, listener);
};

RedisEndpoint.prototype.transaction = function(redisTransaction) {
    return new TransactionBoundRedisEndpoint(this, redisTransaction);
};

RedisEndpoint.prototype.emit = function(message) {
    if (this.transaction) {
        this.transaction.publish(this.name, JSON.stringify(message));
    } else {
        this.client.publish(this.name, message);
    }
};

function TransactionBoundRedisEndpoint(redisEndpoint, transaction) {
    this.client = redisEndpoint.client;
    this.name = redisEndpoint.name;
    this.transaction = transaction;
}
TransactionBoundRedisEndpoint.prototype = RedisEndpoint.prototype;

module.exports = {
    Endpoint: Endpoint,
    RedisEndpoint: RedisEndpoint
};