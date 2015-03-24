let Primus = require("primus");
let EventEmitter = require("events").EventEmitter;

let config = {
    pathname: "/socket",
    transformer: "engine.io"
};

export function makeServer(server) {
    let instance = new Primus(server, config);
    return instance;
};

export function makeClientLibrary() {
    let dummyServer = new EventEmitter();
    let instance = makeServer(dummyServer);
    let libraryString = instance.library();
    return libraryString;
}
