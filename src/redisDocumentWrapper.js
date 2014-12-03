var _ = require('./shared/underscore');
var r = require('./redisClient');

function RedisDocumentWrapper(name) {
    var redisDocumentWrapperThis = this;

    this.documentName = name;

    this.propertyNames = _.reduce({
        document: 'documentText',
        operations: 'operations',
        lock: 'lock',
        stream: 'operationStream'
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
    r.lock(this.getPropertyName('lock'), task);
};
RedisDocumentWrapper.prototype.subscribe = function(listener) {
    r.subscribe(this.propertyNames.stream, listener);
};

module.exports = RedisDocumentWrapper;