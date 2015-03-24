var bluebird = require('bluebird');
var _ = require('../../shared/underscore');

function t() {
    throw "Not implemented";
}

class ProjectionEndpoint {
    constructor(dal, documentId) {
        this.dal = dal;
        this.documentId = documentId;
        this.listeners = [];

        var this_ = this;
        this._receive = function(event) {
            _.map(this_.listeners, listener => listener(event));
        };
    }

    on(listener) {
        if (this.listeners.length === 0) {
            this.dal.subscribeDocumentEvent(this.documentId, this._receive);
        }
        this.listeners.push(listener);
    }

    off(listener) {
        _.remove(this.listeners, mlistener => mlistener === listener);
        if (this.listeners.length === 0) {
            this.dal.unsubscribeDocumentEvent(this.documentId, this._receive);
        }
    }

    emit(event) {
        this.dal.publishDocumentEvent(this.documentId, event);
    }
}

/**
 * After a document event is transformed and added to the document store, we publish
 * the event via this interface. All incoming operations from the event bus are published
 * to the clients that need it. There should be no need to fool around with locks here,
 * as the client should be capable of buffering events that arrive out of order.
 */
class DALEventBusInterface {

    subscribeDocumentEvent(documentId, listener) {t()}
    unsubscribeDocumentEvent(documentId, listener) {t()}
    publishDocumentEvent(documentId, event) {t()}

}

/**
 * Responsible for storing and maintaining a complete list of document operations, as
 * well as the complete document text.
 */
class DALDocumentStoreInterface {

    applyOperation(documentId, revision, operation, author, data) {t()} // The last data param should be removed
    applySelection(documentId, data) {t()}

}

/**
 * Responsible for storing and maintaining user document sessions.
 */
class DALSessionStoreInterface {

    userEditingVisit(documentId, userId) {t()}
    endUserEditingVisit(documentId, userId) {t()}
    timeoutUserEditingVisits(documentId) {t()}

}

class DALInterface {

    getDocumentEventEndpoint(documentId) {
        return new ProjectionEndpoint(this, documentId);
    }

    subscribeDocumentEvent(documentId, listener) {t()}
    unsubscribeDocumentEvent(documentId, listener) {t()}
    publishDocumentEvent(documentId, event) {t()}

    applyOperation(documentId, revision, operation, author, data) {t()} // The last data param should be removed
    applySelection(documentId, data) {t()}

    userEditingVisit(documentId, userId) {t()}
    endUserEditingVisit(documentId, userId) {t()}
    timeoutUserEditingVisits(documentId) {t()}

    getInitialDocumentData(documentId) {t()}

}

module.exports = DALInterface;
