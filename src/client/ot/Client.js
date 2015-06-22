var { BaseExtension, BaseDocumentSync, makeEvents } = require('./Base');

export class ClientExtension extends BaseExtension {
    constructor(base) {
        super(base);
    }
    sendMessage(type, message, documentId) {
        let packet = {
            type: [this.name, type],
            msg: message
        };
        this.dispatch(this.allEvents.base.SEND_MESSAGE, packet, documentId);
    }
    bindMessage(type, method) {
        this.bindEvent(this.allEvents.base.RECV_MESSAGE, (data, documentId) => {
            let [typeExt, typeName] = data.type;
            if (typeExt == this.name && typeName == type) {
                method.call(this, data.msg, documentId);
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

export class ClientDocumentSync extends BaseDocumentSync {
    constructor(extensions) {
        super();
        this.events.base = makeEvents('base', [
            'SEND_MESSAGE',
            'RECV_MESSAGE',
            'CONNECTION_ESTABLISHED',
            'CONNECTION_LOST',
            'INIT_DOCUMENT_STATE'
        ]);
        this.registerExtensions(extensions);

        this.onEvent(this.events.base.SEND_MESSAGE, (packet, documentId) => {
            packet.id = documentId;
            this.sendMessage(packet);
        });
    }

    getDocumentState(id) {}
    getNewDocumentState(id) {}
    getDocuments() {}

    sendMessage(message) {}
    recvMessage({type, msg, id}) {
        this.dispatch(this.events.base.RECV_MESSAGE, {
            type: type, 
            msg: msg
        }, id);
    }

    connectionEstablished() {
        this.dispatch(this.events.base.CONNECTION_ESTABLISHED);
    }
    connectionLost() {
        this.dispatch(this.events.base.CONNECTION_LOST);
    }

    connectDocument(id) {
        this.getNewDocumentState(id);
        this.dispatch(this.events.base.INIT_DOCUMENT_STATE, {}, id);
        this.sendMessage({
            type: ['base', 'DOCUMENT_CONNECT'],
            id: id
        });
    }
    disconnectDocument(id) {

    }
}
