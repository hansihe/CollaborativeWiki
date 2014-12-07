var _ = require('./../shared/underscore');
var services = require('./serviceManager');

function RedisDocumentWrapper(name) {
    var redisDocumentWrapperThis = this;

    this.documentName = name;

    this.propertyNames = _.reduce({
        document: 'documentText',
        operations: 'operations',
        lock: 'lock',
        stream: 'operationStream',
        selectionStream: 'selectionStream'
    },
    function(result, value, key) {
        result[key] = redisDocumentWrapperThis.getPropertyName(value);
        return result;
    }, {});

    console.log(this.propertyNames);
}
RedisDocumentWrapper.prototype.getPropertyName = function(property) {
    return this.documentName + "_" + property;
};
RedisDocumentWrapper.prototype.lock = function(task) {
    services.redisClient.lock(this.getPropertyName('lock'), task);
};
RedisDocumentWrapper.prototype.subscribe = function(listener) {
    services.redisClient.subscribe(this.propertyNames.stream, listener);
};
RedisDocumentWrapper.prototype.subscribeSelection = function(listener) {
    services.redisClient.subscribe(this.propertyNames.selectionStream, listener);
};

module.exports = RedisDocumentWrapper;