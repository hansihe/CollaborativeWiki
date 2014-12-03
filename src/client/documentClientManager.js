var _ = require('../shared/underscore');
var eventAliases = require('../shared/eventAliases');
var DocumentClient = require('./documentClient');
var ot = require('ot');


function DocumentClientManager() {
    this.clients = {};
    this.remote = null;
}

DocumentClientManager.prototype.serverConnected = function(remote) {
    var documentClientManagerThis = this;

    this.remote = remote;

    this.remote.pubsub.on(eventAliases.documentOperation, function(id, ack, revision, rawOperation) {
        var client = documentClientManagerThis.clients[id];
        if (!client) {
            return;
        }

        var operation = ot.TextOperation.fromJSON(rawOperation);
        client.incomingServerOperation(ack, revision, operation);
    });

    _.forIn(this.clients, function(value) {
        value.onConnected();
    }, this);
};

DocumentClientManager.prototype.serverDisconnected = function() {
    this.remote = null;

    _.forIn(this.clients, function(value) {
        value.onDisconnected();
    }, this);
};

DocumentClientManager.prototype.isConnected = function() {
    return this.remote != null;
};

DocumentClientManager.prototype.requestClient = function(id) {
    console.log(id);

    if (_.has(this.clients, id)) {
        return this.clients[id];
    }

    var client = new DocumentClient(this, id);
    if (this.isConnected()) {
        client.onConnected();
    }

    this.clients[id] = client;
    return client;
};

module.exports = DocumentClientManager;