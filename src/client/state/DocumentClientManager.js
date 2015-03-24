var _ = require('../../shared/underscore');
var DocumentClient = require('./DocumentClient');
var ot = require('ot');
var thisify = require('../../shared/thisify');


/**
 * Provides glue logic between a NetworkChannel and several DocumentClients.
 * It's fine to request a DocumentClient before we have been connected to the server, but you should probably wait
 * before actually doing anything.
 * @constructor
 */
function DocumentClientManager(stateManager) {
    this.clients = {};
    this.clientReferences = {};

    this.stateManager = stateManager;
    this.connected = false;

    this.stateManager.on('networkReady', thisify(this._networkConnected, this));
    this.stateManager.on('networkDisconnected', thisify(this._networkDisconnected, this));
}

function getClient(manager, documentId) {
    var client = manager.clients[documentId];
    if (!client) {
        console.error("received event for nonexistent document: ", documentId);
    }
    return client;
}

DocumentClientManager.prototype.incomingServerDocumentMessage = function(message) {
    var documentId = message.id;
    console.log(message);
    var client = getClient(this, documentId);
    client.inMessage.emit(message);
};

/**
 * Called by the onReady event on the stateManager.
 * @private
 */
DocumentClientManager.prototype._networkConnected = function() {
    this.connected = true;

    _.forIn(this.clients, function(value) {
        value.onConnected();
    }, this);
};

/**
 * Called by the onDisconnected event on the stateManager.
 * @private
 */
DocumentClientManager.prototype._networkDisconnected = function() {
    this.connected = false;

    _.forIn(this.clients, function(value) {
        value.onDisconnected();
    }, this);
};

DocumentClientManager.prototype.isConnected = function() {
    return this.connected;
};

/**
 * Fetches/makes the DocumentClient for the supplied id.
 * Make sure to always call destroyClient when you are done with it.
 * When all owners have destroyed their clients, the DocumentClient might be destroyed (for real, disconnected, bye bye).
 * @param owner A unique object that will be treated as the owner of the DocumentClient. Used for reference tracking,
 * you will need to supply the same instance when you are done with the DocumentCLient.
 * @param id the document id
 * @returns DocumentClient
 */
DocumentClientManager.prototype.requestClient = function(owner, id) {
    console.log(id);

    if (_.has(this.clients, id)) {
        if (_.indexOf(owner) == -1) {
            this.clientReferences[id].push(owner);
        }
        return this.clients[id];
    }

    var client = new DocumentClient(this.stateManager, this, id);
    if (this.isConnected()) {
        client.onConnected();
    }

    this.clients[id] = client;

    if (!this.clientReferences[id]) {
        this.clientReferences[id] = [];
    }
    if (_.indexOf(owner) == -1) {
        this.clientReferences[id].push(owner);
    }

    return client;
};

/**
 * Call this when you are done with a client instance and don't need it anymore.
 * @param owner The exact same object as you supplied when requesting a instance with requestClient. Used for
 * reference counting, there are no requirements of properties of the object.
 * @param client The client returned by requestClient that you want to destroy.
 */
DocumentClientManager.prototype.destroyClient = function(owner, client) {
    var documentId = client.id;

    // We want to be able to call this even though we might not have called requestClient yet
    if (owner == undefined || this.clientReferences[documentId] == undefined) {
        return;
    }

    // Remove the owner object from the reference count
    _.remove(this.clientReferences[documentId], function(value) {
        return value === owner;
    });

    // If there are no owners left, close the DocumentClient
    if (this.clientReferences[documentId].length == 0) {
        // TODO: Make a delay before unloading (10s?), we don't really want to unload the document when changing views
        console.log("unload ", client.id);

        client.destroyDocument();
        delete this.clients[documentId];
        delete this.clientReferences[documentId];
    }
};

module.exports = DocumentClientManager;
