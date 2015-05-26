const { ClientExtension } = require('./Client');
const _ = require('lodash');

class DocumentHandle {
    constructor(documentHandleExtension, id) {
        this.documentHandleExtension = documentHandleExtension;
        this.id = id;

        this.documentHandleExtension.incrementReference(this.id);
    }
    release() {
        this.documentHandleExtension.decrementReference(this.id);
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
        this.bindEvent(this.allEvents.base.INIT_DOCUMENT_STATE,
                this.initDocumentState);
    }

    getHandle(id) {
        return new DocumentHandle(this, id);
    }

    incrementReference(id) {
        let state = this.getDocumentState(id);
        state.refCount += 1;
    }
    decrementReference(id) {
        let state = this.getDocumentState(id);
        state.refCount -= 1;
    }

    initDocumentState(id) {
        let state = this.getDocumentState(id);
        state.refCount = 0;
    }
}
