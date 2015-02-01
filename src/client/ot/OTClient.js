import ot from 'ot';

let states = {
    synchronized: 'synchronized',
    awaiting: 'awaiting',
    awaitingBuffer: 'awaitingBuffer'
};

class OTClient {
    /**
     * OT client state machine.
     * Implements a lot of the same things as ot.Client does, except in a less confusing way (in my opinion).
     * @param revision
     */

    constructor(revision) {
        console.log(this);
        this.state = states.synchronized;

        this.revision = revision;

        this.outstanding = null;
        this.buffer = null;
    }

    sendOperation(revision, operation) {
        // TODO
    }

    applyOperation(operation) {
        // TODO
    }

    applyClient(operation) {
        switch (this.state) {
            case states.synchronized: {
                this.sendOperation(this.revision, operation);
                this.outstanding = operation;

                this.state = states.awaiting;
                break;
            }
            case states.awaiting: {
                this.buffer = operation;

                this.state = states.awaitingBuffer;
                break;
            }
            case states.awaitingBuffer: {
                this.buffer = this.buffer.compose(operation);
                break;
            }
            default: throw "unknown state";
        }
    }

    applyServer(operation) {
        this.revision += 1;
        switch (this.state) {
            case states.synchronized: {
                this.applyOperation(operation);
                break;
            }
            case states.awaiting: {
                let pair = operation.constructor.transform(this.outstanding, operation);
                this.applyOperation(pair[1]);
                this.outstanding = pair[0];
                break;
            }
            case states.awaitingBuffer: {
                let transform = operation.constructor.transform;
                let pair1 = transform(this.outstanding, operation);
                let pair2 = transform(this.buffer, pair1[1]);

                this.applyOperation(pair2[1]);

                this.outstanding = pair1[0];
                this.buffer = pair2[0];
                break;
            }
            default: throw "unknown state";
        }
    }

    serverAck() {
        this.revision += 1;
        switch (this.state) {
            case states.synchronized: {
                throw "state is synchronized, there is no operation to ack";
            }
            case states.awaiting: {
                this.outstanding = null;

                this.state = states.synchronized;
                break;
            }
            case states.awaitingBuffer: {
                this.sendOperation(this.revision, this.buffer);

                this.outstanding = this.buffer;
                this.buffer = null;

                this.state = states.awaiting;
                break;
            }
            default: throw "unknown state";
        }
    }
}

module.exports = OTClient;