var redisModule = require('redis');
var redisLockModule = require('redis-lock');
var EventEmitter = require('events').EventEmitter;

function RedisClient() {
    var redisClientThis = this;

    this.redisConnection = redisModule.createClient();
    this.redisLock = redisLockModule(this.redisConnection);

    this.subscriptionRedisConnection = redisModule.createClient();

    this.subBus = new EventEmitter();
    this.subscriptionRedisConnection.on('message', function(channel, message) {
        redisClientThis.subBus.emit(channel, JSON.parse(message));
    });
}

RedisClient.prototype.subscribe = function(channel, listener) {
    if (this.subBus.listeners(channel).length == 0) {
        this.subscriptionRedisConnection.subscribe(channel, function() {
            //console.log(arguments);
        });
    }
    this.subBus.addListener(channel, listener);
};
RedisClient.prototype.unSubscribe = function(channel, listener) {
    this.subBus.removeListener(channel, listener);
    if (this.subBus.listeners(channel).length == 0) {
        this.subscriptionRedisConnection.unsubscribe(channel);
    }
};

RedisClient.prototype.publish = function(channel, message) {
    this.redisConnection.publish(channel, JSON.stringify(message));
};

RedisClient.prototype.lock = function(lockName, task) {
    this.redisLock(lockName, task);
};

module.exports = RedisClient;