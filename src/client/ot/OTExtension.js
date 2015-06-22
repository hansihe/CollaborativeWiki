var { ClientExtension } = require('./DocumentSync');
var ot = require('ot');

var { OTStates } = require('./OTHelpers');

export class OTExtension extends ClientExtension {
    static getName() {
        return 'ot';
    }
    static getEvents() {
        return [
            'EDITABLE',
            'REPLACE_TEXT'
        ];
    }

    constructor(base) {
        super(base);

        this.methods = {
            apply: operation => this.applyOperation(operation)
        };

        console.log(this);

        this.bindEvent(this.allEvents.base.RECV_MESSAGE, this.recvMessage);
        this.bindEvent(this.allEvents.base.INIT_DOCUMENT_STATE,
                this.initDocumentState);
        this.bindEvent(this.allEvents.initialState.INITIAL_STATE_RECEIVED, 
                this.initialStateReceived);
    }
    initDocumentState(data, id) {
        let state = this.getDocumentState(id);

        state.otState = OTStates.synchronized;
        this.setEditable(id, false);
        this.replaceText(id, "");
        state.revision = -1;
        state.outstanding = null;
        state.buffer = null;
    }
    initialStateReceived(data, id) {
        let state = this.getDocumentState(id);

        this.replaceText(id, data.text);
        state.revision = data.revision;
        this.setEditable(id, true);
    }
    applyClientOperation(state, operation) {
        this.applyOTActions(OTHelpers.applyClient(
                state.otState, state.buffer, operation));
    }
    recvOp(state, message) {
        let operation = ot.TextOperation.fromJSON(message.op);
        this.applyOTActions(OTHelpers.applyServer(
                state.otState, state.buffer, state.outstanding, operation));
    }
    recvAck(state) {
        this.applyOTActions(OTHelpers.serverAck(
                state.otState, state.buffer));
    }
    applyOTActions(id, actions) {
        let state = this.getDocumentState(id);

        _.each(actions, action => {
            this.applyOTAction(state, action);
        });
    }
    applyOTAction(state, action) {
        switch (action[0]) {
            case 'state': {
                state.otState = action[1];
                break;
            }
            case 'send': {
                this.sendOperation(state, action[1]);
                break;
            } 
            case 'outstanding': {
                state.outstanding = action[1];
                break;
            }
            case 'buffer': {
                state.buffer = action[1];
                break;
            }
            case 'apply': {
                break;
            }
            throw "invalid ot action: " + action[0];
        }
    }
    recvMessage(message, id) {
        let state = this.getDocumentState(id);
        switch (message.type) {
            case "op": {
                return this.recvOp(state, message);
            }
            case "ack": {
                return this.recvAck(state);
            }
        }
    }

    replaceText(id, text) {
        let state = this.getDocumentState(id);

        state.text = text;
        this.dispatch(this.events.REPLACE_TEXT, {
            text: text
        }, id);
    }
    setEditable(id, editable) {
        let state = this.getDocumentState(id);

        state.editable = editable;
        this.dispatch(this.events.EDITABLE, {
            editable: editable
        }, id);
    }
}
