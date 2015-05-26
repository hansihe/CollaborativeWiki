var _ = require('lodash');
var EventEmitter = require('eventemitter3');

export function makeEvents(name, events) {
    return _.zipObject(events, _.map(events, event => name + '_' + event));
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
    
    dispatch(event, ...data) {
        this.base.dispatch(event, data);
    }
    bindEvent(event, method) {
        if (event === undefined) {
            throw "cannot bind to undefined";
        }
        this.base.eventHub.on(event, 
                data => method.apply(this, data));
    }
}

export class BaseDocumentSync {
    constructor(extensions) {
        this.eventHub = new EventEmitter();

        this.extensions = {};
        this.events = {};
        this.methods = {};

        if (extensions !== undefined) {
            this.registerExtensions(extensions);
        }
    }

    dispatch(event, data) {
        console.log("Base Event: ", event, data);
        this.eventHub.emit(event, data);
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
