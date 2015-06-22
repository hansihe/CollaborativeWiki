import ot from 'ot';

export var states = {
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

    sendOperation(revision, operation) {}
    applyOperation(operation) {}

    getRevision() {}
    incrementRevision() {}

    getState() {}
    setState(state) {}

    getOutstanding() {}
    setOutstanding(outstanding) {}

    getBuffer() {}
    setBuffer(buffer) {}

    applyClient(operation) {
        switch (this.getState()) {
            case states.synchronized: {
                this.sendOperation(this.revision, operation);
                this.setOutstanding(operation);

                this.setState(states.awaiting);
                break;
            }
            case states.awaiting: {
                this.setBuffer(operation);

                this.setState(states.awaitingBuffer);
                break;
            }
            case states.awaitingBuffer: {
                this.setBuffer(this.getBuffer().compose(operation));
                break;
            }
            default: throw "unknown state";
        }
    }

    applyServer(operation) {
        this.incrementRevision();
        switch (this.getState()) {
            case states.synchronized: {
                this.applyOperation(operation);
                break;
            }
            case states.awaiting: {
                let pair = operation.constructor.transform(this.getOutstanding(), operation);
                this.applyOperation(pair[1]);
                this.setOutstanding(pair[0]);
                break;
            }
            case states.awaitingBuffer: {
                let transform = operation.constructor.transform;
                let pair1 = transform(this.getOutstanding(), operation);
                let pair2 = transform(this.getBuffer(), pair1[1]);

                this.applyOperation(pair2[1]);

                this.setOutstanding(pair1[0]);
                this.setBuffer(pair2[0]);
                break;
            }
            default: throw "unknown state";
        }
    }

    serverAck() {
        this.incrementRevision();
        switch (this.getState()) {
            case states.synchronized: {
                throw "state is synchronized, there is no operation to ack";
            }
            case states.awaiting: {
                this.setOutstanding(null);

                this.setState(states.synchronized);
                break;
            }
            case states.awaitingBuffer: {
                this.sendOperation(this.revision, this.getBuffer());

                this.setOutstanding(this.getBuffer());
                this.setBuffer(null);

                this.setState(states.awaiting);
                break;
            }
            default: throw "unknown state";
        }
    }
}

class SImplOTClient extends OTClient {
    constructor(revision) {
        super();

        this.state = states.synchronized;

        this.revision = revision;

        this.outstanding = null;
        this.buffer = null;
    }

    getRevision() {
        return this.revision;
    }
    incrementRevision() {
        this.revision += 1;
    }

    getState() {
        return this.state();
    }
    setState(state) {
        this.state = state;
    }

    getOutstanding() {
        return this.outstanding;
    }
    setOutstanding(outstanding) {
        this.outstanding = outstanding;
    }

    getBuffer() {
        return this.buffer;
    }
    setBuffer(buffer) {
        this.buffer = buffer;
    }
}

module.exports = SImplOTClient;
module.exports.base = OTClient;
