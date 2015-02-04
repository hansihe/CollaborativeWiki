var NetworkChannel = require('../shared/NetworkChannel');
var reconnect_shoe = require('reconnect-shoe');

class ClientNetworkChannel extends NetworkChannel {

    constructor(rpcMethods) {
        let this_ = this;
        super(rpcMethods);

        this.reconnect = reconnect_shoe(function(stream) {
            this_.newStream(stream);
        }).connect('/endpoint');
    }

}

module.exports = ClientNetworkChannel;