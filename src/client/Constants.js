var Marty = require("marty");

export default Marty.createConstants([
        // Socket
        "SOCKET_OPEN",
        "SOCKET_CLOSE",

        "RECV_DOCUMENT_MESSAGE",
        "RECV_RPC_MESSAGE",
        // These two are informal only, they don't do anything when dispatched
        "SEND_DOCUMENT_MESSAGE",
        "SEND_RPC_MESSAGE",

        "RPC_REMOTE"
]);
