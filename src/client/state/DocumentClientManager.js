var _ = require('../../shared/underscore');
var eventAliases = require('../../shared/eventAliases');
var DocumentClient = require('./DocumentClient');
var ot = require('ot');
var eventDataWrappers = require('../../shared/eventDataWrappers');
var thisify = require('../../shared/thisify');


/**
 * Provides glue logic between a NetworkChannel and several DocumentClients.
 * It's fine to request a DocumentClient before we have been connected to the server, but you should probably wait
 * before actually doing anything.
 * @constructor
 */
function DocumentClientManager(stateManager) {
    this.clients = {};
    this.stateManager = stateManager;
    this.connected = false;

    this.stateManager.on('networkReady', thisify(this._networkConnected, this));
    this.stateManager.on('networkDisconnected', thisify(this._networkDisconnected, this));

    this.stateManager.networkChannel.pubsub.on(eventAliases.documentOperation, thisify(this._onDocumentOperation, this));
    this.stateManager.networkChannel.pubsub.on(eventAliases.documentCursor, thisify(this._onDocumentSelection, this));
}

/**
 * Called with the raw data when a operation event is received over the network.
 * @private
 */
DocumentClientManager.prototype._onDocumentOperation = function(repr) {
    var operationInfo = eventDataWrappers.operationDataWrapper.unpack(repr);

    var client = this.clients[operationInfo.documentId];
    if (!client) {
        return;
    }

    var operation = ot.TextOperation.fromJSON(operationInfo.operation);
    client.incomingServerOperation(operationInfo.userId === this.stateManager.userId, operationInfo.documentRevision, operation);
};

/**
 * Called with the raw data when a selection is received over the network.
 * @private
 */
DocumentClientManager.prototype._onDocumentSelection = function(repr) {
    var selectionInfo = eventDataWrappers.selectionDataWrapper.unpack(repr);

    var client = this.clients[selectionInfo.documentId];
    if (!client) {
        return;
    }

    var selection = ot.Selection.fromJSON(selectionInfo.selection);
    client.incomingServerSelection(selectionInfo.userId, selection);
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
 * This is pretty much the only method you should call in normal usage.
 * @param id the document id
 * @returns DocumentClient
 */
DocumentClientManager.prototype.requestClient = function(id) {
    console.log(id);

    if (_.has(this.clients, id)) {
        return this.clients[id];
    }

    var client = new DocumentClient(this.stateManager, this, id);
    if (this.isConnected()) {
        client.onConnected();
    }

    this.clients[id] = client;
    return client;
};

module.exports = DocumentClientManager;