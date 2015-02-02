var _ = require('./../shared/underscore');
var services = require('./serviceManager');
var ot = require('ot');
import Dal from './dal/Redis';

function OTServer(documentId) {
    this.documentId = documentId;

    this.localClients = [];

    this.dal = new Dal();
    this.documentEvent = this.dal.getDocumentEventEndpoint(this.documentId);

    /*setInterval(function() {
        //console.log(otServerThis.localClients);
        for (var i = 0; i < otServerThis.localClients.length; i++) {
            otServerThis.userEditingVisit(otServerThis.localClients[i]);
        }
        otServerThis.removeTimedoutEditingVisits();
    }, 5000);*/
}

OTServer.prototype.incomingUserDocumentMessage = function(message) {
    var documentServerThis = this;

    switch (message.type) {
        // TODO: Validate schema for messages.
        /* Standard fields:
        {
            'type': "Message type"
        }
         */
        case 'operation': {
            /*
            {
                'sender': "Unique user id",
                'operation': "The operation the user wants to apply to the document.",
                'revision': "The document revision the operation applies to."
            }
             */
            documentServerThis.processLocalUserOperation(message);
            break;
        }
        case 'selection': {
            /*
            {
                'sender': "Unique user id",
                'selections': "Updated user selection."
            }
             */
            documentServerThis.processLocalUserSelection(message);
            break;
        }
    }
};

OTServer.prototype.processLocalUserOperation = function (data) {
    var operation = ot.TextOperation.fromJSON(data.operation);
    var revision = data.revision;
    var sender = data.sender;

    this.dal.applyOperation(this.documentId, revision, operation, sender, data);
};

OTServer.prototype.localUserJoin = function(userId) {
    if (_.indexOf(this.localClients, userId) == -1) {
        this.localClients.push(userId);
    }
    this.userEditingVisit(userId);
};
OTServer.prototype.localUserLeave = function(userId) {
    _.remove(this.localClients, userId);
    this.endUserEditingVisit(userId);
};

OTServer.prototype.userEditingVisit = function(userId) {
    this.dal.userEditingVisit(this.documentId, userId);
};
OTServer.prototype.removeTimedoutEditingVisits = function() {
    this.dal.removeTimedoutEditingVisits(this.documentId);
};
OTServer.prototype.endUserEditingVisit = function(userId) {
    this.dal.endUserEditingVisit(this.documentId, userId)
};

OTServer.prototype.processLocalUserSelection = function(data) {
    this.dal.applySelection(this.documentId, data);
};

module.exports = OTServer;