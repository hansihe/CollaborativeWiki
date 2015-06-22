var Marty = require('marty');
var _ = require('lodash');
var Rx = require('rx');

var OTClient = require('../ot/OTClient');

var Constants = require('../Constants');
var ConnectionStore = require('./ConnectionStore');
var SocketStateSource = require('../SocketStateSource');

var { ClientExtension, ClientDocumentSync } = require('../ot/Client');
var { InitialStateExtension } = require('../ot/InitialStateExtension');
var { DocumentHandleExtension } = require('../ot/DocumentHandleExtension');
var { OTExtension } = require('../ot/OTExtension');

class DocumentSyncManager extends ClientDocumentSync {
    constructor(store) {
        super([InitialStateExtension, DocumentHandleExtension, OTExtension]);
        this.store = store;
    }

    sendMessage(message) {
        console.log("OutDocMessage", message);
        this.store.app.socketSource.sendDocumentMessage(message);
    }

    getDocumentState(id) {
        return this.store.state.documents[id];
    }
    getNewDocumentState(id) {
        this.store.state.documents[id] = {};
        return this.store.state.documents[id];
    }
    getDocuments() {
        return _.keys(this.store.state.documents);
    }
}

class DocumentStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {
            documents: {}
        };
        this.handlers = {
            recvMessage: Constants.RECV_DOCUMENT_MESSAGE,
            onConnected: Constants.RPC_REMOTE,
            onDisconnected: Constants.SOCKET_CLOSE
        };
        
        this.documentSync = new DocumentSyncManager(this);
        console.log(this.documentSync);

        var test = this.documentSync.methods.documentHandle.getHandle("test");
    }

    onConnected() {
        this.documentSync.connectionEstablished();
    }

    onDisconnected() {
        this.documentSync.connectionLost();
    }

    recvMessage(message) {
        console.log("InDocMessage", message);
        this.documentSync.recvMessage(message);
    }

    getDocumentHandle(name) {
        return this.documentSync.methods.documentHandle.getHandle(name);
    }
}

//class DocumentStore extends Marty.Store {
//    constructor(options) {
//        super(options);
//        this.state = {
//            documents: {}
//        };
//        this.ots = {};
//        this.handlers = {
//            recvMessage: Constants.RECV_DOCUMENT_MESSAGE,
//            onConnected: Constants.RPC_REMOTE
//        };
//
//        this.subjects = {
//            recvMessage: new Rx.Subject(),
//
//            recvOperation: this.subjects.recvMessage.filter(
//                    msg => msg.type === "operation"),
//            recvSelection: this.subjects.recvMessage.filter(
//                    msg => msg.type === "selection"),
//            recvUserJoin: this.subjects.recvMessage.filter(
//                    msg => msg.type === "user_join"),
//            recvUserLeave: this.subjects.recvMessage.filter(
//                    msg => msg.type === "user_leave")
//        };
//    }
//
//    recvMessage(message) {
//        this.subjects.recvMessage.onNext(message);
//    }
//
//    initDocument() {
//        return ;
//    }
//
//    onConnected(rpc) {
//        console.log("Socket open");
//        rpc.initDocumentChannel("index", 
//                (success, revision, document, users) => console.log(success, revision, document, users));
//    }
//}

export default DocumentStore;
