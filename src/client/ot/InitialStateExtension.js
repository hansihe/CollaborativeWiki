const { ClientExtension } = require('./Client');
const _ = require('lodash');

export class InitialStateExtension extends ClientExtension {
    static getName() {
        return 'initialState';
    }
    static getEvents() {
        return [
            'INITIAL_STATE_RECEIVED'
        ];
    }

    constructor(base) {
        super(base);

        this.bindMessage('INITIAL_STATE',
                this.initialStateReceived);
    }

    initialStateReceived(data, id) {
        this.dispatch(this.events.INITIAL_STATE_RECEIVED, data, id);
    }
}
