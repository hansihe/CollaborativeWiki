var NetworkChannel = require('../shared/NetworkChannel');

class ServerNetworkChannel extends NetworkChannel {

    constructor(stream, rpcMethods) {
        super(rpcMethods);
        this.newStream(stream);
    }

}

module.exports = ServerNetworkChannel;