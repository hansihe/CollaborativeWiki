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

        this.bindEvent(this.allEvents.base.CONNECTION_ESTABLISHED,
                this.connectionEstablished);
        this.bindMessage('INITIAL_STATE',
                this.initialStateReceived);
    }

    connectionEstablished() {
        let documents = this.getDocuments();

        _.each(documents, (id) => {
            this.sendMessage('GET_INITIAL_STATE', undefined, id);
        });
    }

    initialStateReceived(data, id) {
        console.log(arguments);
    }
}
