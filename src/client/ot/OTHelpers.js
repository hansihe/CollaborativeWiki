export var OTStates = {
    synchronized: 'synchronized',
    awaiting: 'awaiting',
    awaitingBuffer: 'awaitingBuffer'
};

var OTHelpers = {
    applyClient(state, buffer, operation) {
        var actions = [];
        switch (state) {
            case OTStates.synchronized: {
                actions.push(['state', OTStates.awaiting]);
                actions.push(['send', operation]);
                actions.push(['outstanding', operation]);
                break;
            }
            case OTStates.awaiting: {
                actions.push(['state', OTStates.awaitingBuffer]);
                actions.push(['buffer', operation]);
                break;
            }
            case OTStates.awaitingBuffer: {
                actions.push('buffer', buffer.compose(operation));
                break;
            }
        }
        return actions;
    },
    applyServer(state, buffer, outstanding, operation) {
        var actions = [];
        let transform = operation.constructor.transform;

        switch (state) {
            case OTStates.synchronized: {
                actions.push(['apply', operation]);
                break;
            }
            case OTStates.awaiting: {
                let pair = transform(outstanding, operation);

                actions.push(['outstanding', pair[0]]);
                actions.push(['apply', pair[1]]);
                break;
            }
            case OTStates.awaitingBuffer: {
                let pair1 = transform(outstanding, operation);
                let pair2 = transform(buffer, pair1[1]);

                actions.push(['outstanding', pair1[0]]);
                actions.push(['buffer', pair2[0]]);
                actions.push(['apply', pair2[1]]);
                break;
            }
        }
        return actions;
    },
    serverAck(state, buffer) {
        switch (state) {
            case OTStates.synchronized: {
                throw "state is synchronized, there is no operation to ack";
            }
            case OTStates.awaiting: {
                actions.push(['state', OTStates.synchronized]);
                actions.push(['outstanding', null]);
                break;
            }
            case OTStates.awaitingBuffer: {
                actions.push(['state', OTStates.awaiting]);
                actions.push(['send', buffer]);
                actions.push(['outstanding', buffer]);
                actions.push(['buffer', null]);
                break;
            }
        }
    }
};

export default OTHelpers;
