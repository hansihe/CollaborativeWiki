var NetworkChannel = require('../shared/NetworkChannel');
var reconnect_shoe = require('reconnect-shoe');
var PrimusClient = require('./primusClient');

class ClientNetworkChannel extends NetworkChannel {

    constructor(rpcMethods) {
        let this_ = this;
        super(rpcMethods);

        this.socket = PrimusClient.connect('/socket');

        //this.reconnect = reconnect_shoe(function(stream) {
            //this_.newStream(stream);
        //}).connect('/endpoint');
    }

}

module.exports = ClientNetworkChannel;
