var _ = require('../shared/underscore');
var eventAliases = require('../shared/eventAliases');
var DocumentClient = require('./DocumentClient');
var ot = require('ot');
var eventDataWrappers = require('../shared/eventDataWrappers');
var thisify = require('../shared/thisify');


/**
 * Provides glue logic between a NetworkChannel and several DocumentClients.
 * It's fine to request a DocumentClient before we have been connected to the server, but you should probably wait
 * before actually doing anything.
 * @constructor
 */
function DocumentClientManager(stateManager) {
    var documentClientManagerThis = this;

    this.clients = {};
    this.stateManager = stateManager;
    this.connected = false;

    this.stateManager.on('networkReady', thisify(documentClientManagerThis.networkConnected, this));
    this.stateManager.on('networkDisconnected', thisify(documentClientManagerThis.networkDisconnected, this));

    this.stateManager.networkChannel.pubsub.on(eventAliases.documentOperation, function(repr) {//id, ack, revision, rawOperation) {
        var operationInfo = eventDataWrappers.operationDataWrapper.unpack(repr);

        var client = documentClientManagerThis.clients[operationInfo.documentId];
        if (!client) {
            return;
        }

        var operation = ot.TextOperation.fromJSON(operationInfo.operation);
        client.incomingServerOperation(operationInfo.userId === documentClientManagerThis.stateManager.userId, operationInfo.documentRevision, operation);
    });
    this.stateManager.networkChannel.pubsub.on(eventAliases.documentCursor, function(repr) {
        var selectionInfo = eventDataWrappers.selectionDataWrapper.unpack(repr);

        var client = documentClientManagerThis.clients[selectionInfo.documentId];
        if (!client) {
            return;
        }

        console.log(selectionInfo);

        var selection = ot.Selection.fromJSON(selectionInfo.selection);
        client.incomingServerSelection(selectionInfo.userId, selection);
    });
}

/**
 * Called by the onReady event on the stateManager.
 */
DocumentClientManager.prototype.networkConnected = function() {
    this.connected = true;

    _.forIn(this.clients, function(value) {
        value.onConnected();
    }, this);
};

/**
 * Called by the onDisconnected event on the stateManager.
 */
DocumentClientManager.prototype.networkDisconnected = function() {
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