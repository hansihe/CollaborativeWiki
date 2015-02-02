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
        _.remove(this.listeners, listener);
        if (this.listeners.length === 0) {
            this.dal.unsubscribeDocumentEvent(this.documentId, this._receive);
        }
    }

    emit(event) {
        this.dal.publishDocumentEvent(this.documentId, event);
    }
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