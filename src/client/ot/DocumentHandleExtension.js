const { ClientExtension } = require('./Client');
const _ = require('lodash');

class DocumentHandle {
    constructor(documentHandleExtension, id) {
        this.active = true;

        this.documentHandleExtension = documentHandleExtension;
        this.id = id;

        this.documentHandleExtension.incrementReference(this.id);

        this.listeners = [];
    }

    activeCheck() {
        if (!this.active) {
            throw "Cannot do anything with a released handle";
        }
    }

    release() {
        this.activeCheck();

        _.forEach(this.listeners, (listenerId) => {
            this.documentHandleExtension.offEvent(listenerId);
        });
        this.documentHandleExtension.decrementReference(this.id);
    }
    bindEvent(event, handler) {
        this.activeCheck();

        let listenerId = this.documentHandleExtension.bindEvent(event, (data, documentId) => {
            if (documentId == this.id) {
                handler(data);
            }
        });
        this.listeners.push(listenerId);
        return listenerId;
    }

    getState() {
        return this.documentHandleExtension.getDocumentState(this.id);
    }
}

export class DocumentHandleExtension extends ClientExtension {
    static getName() {
        return 'documentHandle';
    }
    static getEvents() {
        return [];
    }

    constructor(base) {
        super(base);
        this.methods = {
            getHandle: (id) => {
                return this.getHandle(id);
            }
        };
        this.bindEvent(this.allEvents.base.INIT_DOCUMENT_STATE,
                this.initDocumentState);
    }

    getHandle(id) {
        return new DocumentHandle(this, id);
    }

    incrementReference(id) {
        if (!this.getDocumentState(id)) {
            this.base.connectDocument(id);
        }

        let state = this.getDocumentState(id);
        state.refCount += 1;
    }
    decrementReference(id) {
        let state = this.getDocumentState(id);
        state.refCount -= 1;

        if (state.refCount === 0) {
            this.base.disconnectDocument(id);
        }
    }

    initDocumentState(data, id) {
        let state = this.getDocumentState(id);
        console.log(state);
        state.refCount = 0;
    }
}
