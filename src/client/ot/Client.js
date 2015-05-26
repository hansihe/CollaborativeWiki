var { BaseExtension, BaseDocumentSync, makeEvents } = require('./Base');

export class ClientExtension extends BaseExtension {
    sendMessage(type, message, documentId) {
        let packet = {
            type: [this.name, type],
            msg: message,
            id: documentId
        };
        this.dispatch(this.allEvents.base.SEND_MESSAGE, packet);
    }
    bindMessage(type, method) {
        this.bindEvent(this.allEvents.base.RECV_MESSAGE,
                ([ext, t], msg, id) => {
                    if (ext === this.name && t === type) {
                        method.call(this, msg, id);
                    }
                });
    }
    getDocumentState(id) {
        return this.base.getDocumentState(id);
    }
    getDocuments() {
        return this.base.getDocuments();
    }
}

class DocumentHandle {
    constructor(documentSync, id) {

    }

    release() {

    }
}

export class ClientDocumentSync extends BaseDocumentSync {
    constructor(extensions) {
        super();
        this.events.base = makeEvents('base', [
            'SEND_MESSAGE',
            'RECV_MESSAGE',
            'CONNECTION_ESTABLISHED',
            'CONNECTION_LOST'
        ]);
        this.registerExtensions(extensions);

        this.eventHub.on(this.events.base.SEND_MESSAGE,
                ([packet]) => this.sendMessage(packet));
    }

    getDocumentState(id) {}
    getNewDocumentState(id) {}
    getDocuments() {}

    sendMessage(message) {}
    recvMessage({type, msg, id}) {
        this.dispatch(this.events.base.RECV_MESSAGE, [type, msg, id]);
    }

    connectionEstablished() {
        this.dispatch(this.events.base.CONNECTION_ESTABLISHED, []);
    }
    connectionLost() {
        this.dispatch(this.events.base.CONNECTION_LOST, []);
    }

    connectDocument(id) {

    }
    disconnectDocument(id) {

    }

    getDocumentHandle(id) {
        return new DocumentHandle(this, id);
    }
}
