var Marty = require('marty');

var Constants = require('../Constants');

var ConnectionStatus = Marty.createConstants([
        "CONNECTED",
        "DISCONNECTED"
        ]);

class ConnectionStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {
            status: ConnectionStatus.DISCONNECTED,
            rpcRemote: undefined
        };
        this.handlers = {
            socketClose: Constants.SOCKET_CLOSE,
            rpcRemote: Constants.RPC_REMOTE
        };
    }

    socketClose() {
        this.state.status = ConnectionStatus.DISCONNECTED;
        this.state.rpcRemote = undefined;
        this.hasChanged();
    }

    rpcRemote(remote) {
        console.log(ConnectionStatus);
        this.state.status = ConnectionStatus.CONNECTED;
        this.state.rpcRemote = remote;
        this.hasChanged();
    }
}

export default Marty.register(ConnectionStore);
