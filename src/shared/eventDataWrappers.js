var _ = require('../shared/underscore');

function DataWrapper(fields) {
    this.fields = fields;
}

DataWrapper.prototype.pack = function() {
    var result = [];

    _.forEach(this.fields, function(name, index) {
        result.push(arguments[index]);
    });

    return result;
};

DataWrapper.prototype.packObject = function(object) {
    var result = [];

    _.forEach(this.fields, function(name) {
        result.push(object[name]);
    });

    return result;
};

DataWrapper.prototype.unpack = function(repr) {
    var result = {};

    _.forEach(this.fields, function(name, index) {
        result[name] = repr[index];
    });

    return result;
};

var operationDataWrapper = new DataWrapper(['documentId', 'userId', 'documentRevision', 'operation']);
var selectionDataWrapper = new DataWrapper(['documentId', 'userId', 'selection']);

module.exports = {
    DataWrapper: DataWrapper,
    operationDataWrapper: operationDataWrapper,
    selectionDataWrapper: selectionDataWrapper
};