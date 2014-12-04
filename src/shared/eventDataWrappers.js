var _ = require('../shared/underscore');

function DataWrapper(fields) {
    this.fields = fields || [];
}

BaseDataWrapper.prototype.toJSON = function() {
    var dataWrapperThis = this;

    var result = [];
    _.forEach(this.fields, function(name) {
        result.push(dataWrapperThis[name]);
    });

    return result;
};

BaseDataWrapper.fromJSON = function() {
    var dataWrapperThis = this;

};

function makeDataWrapper() {

}