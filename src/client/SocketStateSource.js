var Marty = require("marty");
var dnode = require('dnode');

var PrimusClient = require('./primusClient');

var Constants = require('./Constants');

export class SocketActions extends Marty.ActionCreators {
    socketOpen() {
        this.dispatch(Constants.SOCKET_OPEN);
    }
    socketClose() {
        this.dispatch(Constants.SOCKET_CLOSE);
    }

    recvDocumentMessage(message) {
        this.dispatch(Constants.RECV_DOCUMENT_MESSAGE, message);
    }
    recvRpcMessage(message) {
        this.dispatch(Constants.RECV_RPC_MESSAGE, message);
    }

    sendDocumentMessage(message) {
        this.dispatch(Constants.SEND_DOCUMENT_MESSAGE, message);
    }
    sendRpcMessage(message) {
        this.dispatch(Constants.SEND_RPC_MESSAGE, message);
    }

    rpcRemote(remote) {
        this.dispatch(Constants.RPC_REMOTE, remote);
    }
}

export default class SocketStateSource extends Marty.StateSource {
    constructor(options) {
        super(options);

        this.socket = PrimusClient.connect('/socket');
        this.socket.on('open', this.socketOpen.bind(this));
        this.socket.on('close', this.socketClose.bind(this));

        this.documentStream = this.socket.substream('dm2');
        this.documentStream.on('data', this.recvDocumentMessage.bind(this));

        this.rpcStream = this.socket.substream('d');
        this.rpcStream.on('data', this.recvRpcMessage.bind(this));
    }

    socketOpen() {
        this.app.socketSourceActions.socketOpen();

        this.rpc = dnode({});
        this.rpc.on('data', this.sendRpcMessage.bind(this));
        this.rpc.on('remote', this.onRpcRemote.bind(this));
    }
    socketClose() {
        this.app.socketSourceActions.socketClose();

        this.rpc = null;
    }

    onRpcRemote(remote) {
        this.app.socketSourceActions.rpcRemote(remote);
    }

    recvDocumentMessage(message) {
        this.app.socketSourceActions.recvDocumentMessage(message);
    }
    recvRpcMessage(message) {
        this.app.socketSourceActions.recvRpcMessage(message);
        if (this.rpc) {
            this.rpc.write(message);
        }
    }

    sendDocumentMessage(message) {
        this.documentStream.write(message);
        //SocketActions.sendDocumentMessage(message);
    }
    sendRpcMessage(message) {
        this.rpcStream.write(message);
        //SocketActions.sendRpcMessage(message);
    }
}
