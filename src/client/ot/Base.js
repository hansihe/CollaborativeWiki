var _ = require('lodash');
var EventEmitter = require('eventemitter3');

export function makeEvents(name, events) {
    return _.zipObject(events, _.map(events, event => name + '_' + event));
}

var currentLUID = 0;
function getLUID() {
    currentLUID += 1;
    return currentLUID;
}

export class BaseExtension {
    constructor(base) {
        this.name = this.constructor.getName();
        this.base = base;
        this.events = makeEvents(this.name, this.constructor.getEvents());
        this.allEvents = this.base.events;
        this.methods = {};
    }

    static getEvents() {
        return [];
    }
    static getName() {
        throw "No name defined";
    }
    
    dispatch(event, data, documentId) {
        this.base.dispatch(event, data, documentId);
    }
    bindEvent(event, method) {
        if (event === undefined) {
            throw "cannot bind to undefined";
        }
        return this.base.onEvent(event, method.bind(this));
    }
    offEvent(listenerId) {
        this.base.offEvent(listenerId);
    }
}

export class BaseDocumentSync {
    constructor(extensions) {
        this.eventHub = new EventEmitter();

        this.extensions = {};
        this.events = {};
        this.methods = {};

        this._listeners = {};

        if (extensions !== undefined) {
            this.registerExtensions(extensions);
        }
    }

    dispatch(event, data, documentId) {
        console.log("Base Event: ", event, data, documentId);
        this.eventHub.emit(event, {
            data: data,
            documentId: documentId
        });
    }
    onEvent(event, listener) {
        let func = ({data, documentId}) => {
            listener(data, documentId);
        };

        let listenerId = getLUID();
        this._listeners[listenerId] = [event, func];

        this.eventHub.on(event, func);

        return listenerId;
    }
    offEvent(listenerId) {
        let [event, func] = this._listeners[listenerId];
        this._listeners[listenerId] = undefined;

        this.eventHub.removeListener(event, func);
    }

    registerExtensions(extensions) {
        _.each(extensions, this.registerExtensionEvents, this);
        _.each(extensions, this.registerExtension, this);
    }

    registerExtensionEvents(extClass) {
        let name = extClass.getName();
        this.events[name] = makeEvents(name, extClass.getEvents());
    }
    registerExtension(extClass) {
        let name = extClass.getName();
        let ext = new extClass(this);

        this.extensions[name] = ext;
        this.methods[name] = ext.methods;
    }
}
