var { BaseExtension } = require('./DocumentSync');
var ot = require('ot');

export default class OTExtension extends BaseExtension {
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

        this.bindEvent(this.allEvents.base.RECV_MESSAGE, this.recvMessage);
        this.bindEvent(this.allEvents.base.INIT_DOCUMENT_STATE,
                this.initDocumentState);
        this.bindEvent(this.allEvents.initialState.INITIAL_STATE_RECEIVED, 
                this.initialState);
    }
    initDocumentState(id) {
        let state = this.getDocumentState(id);

        state.otState = OTStates.synchronized;
        state.editable = false;
        state.text = "";
        state.revision = -1;
        state.outstanding = null;
        state.buffer = null;
    }
    initialStateReceived(id, data) {
        let state = this.getDocumentState(id);

        state.text = data.text;
        state.revision = data.revision;
        state.editable = true;

        this.dispatch(this.events.REPLACE_TEXT, id, data.text);
        this.dispatch(this.events.EDITABLE, id, true);
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
    recvMessage(message) {
        switch (message.type) {
            case "op": {
                return this.recvOp(state, message);
            }
            case "ack": {
                return this.recvAck(state);
            }
        }
    }
}
