
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

module.exports = Endpoint;