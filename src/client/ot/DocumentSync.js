var _ = require('lodash');

var { BaseExtension, BaseDocumentSync } = require('./Base');
export var BaseDocumentSync;
export var BaseExtension;

var { ClientDocumentSync, ClientExtension } = require('./Client');
export var ClientDocumentSync;
export var ClientExtension;

export class InternalStateClientDocumentSync extends ClientDocumentSync {
    constructor(extensions) {
        super(extensions);

        this.documentStates = {};
    }

    getDocumentState(id) {
        return documentStates[id];
    }
    getNewDocumentState(id) {
        let state = {};
        documentStates[id] = state;
        return state;
    }
}
