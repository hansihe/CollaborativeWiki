var _ = require('./underscore');
var EventEmitter = require('events').EventEmitter;

var opCodes = [
    'documentOperation',
    'userEnterDocument',
    'userExitDocument',
    'userSelection'
];
var opCodesInv = _.reduce(operationCodes, function(result, code, num) {
    result[code] = num;
    return result;
}, {});

var opCodeHandlers = {
    documentOperation: {
        fields: ['documentId', 'userId', 'documentRevision', 'operation'],
        pack: function(args) {

        },
        unpack: function(data) {

        }
    }
};

var DocumentCommunicationHelper = function() {
    EventEmitter.call(this);
};
_.extends(DocumentCommunicationHelper.prototype, EventEmitter.prototype);

DocumentCommunicationHelper.prototype.eventIn = function(data) {
    var opCode = opCodesInv[data[0]];

    if (!opCode) {
        console.error('opcode not recognized', data);
        return;
    }

    var opCodeHandler = opCodeHandlers[opCode];

    var out = _.reduce(opCodeHandler.fields, function(result, name, num) {
        result[name] = data[num];
        return result;
    }, {});

    out.type = opCode;

    if (opCodeHandler.unpack) {
        out = opCodeHandler.unpack(out);
    }

    this.emit(opCode, out);
};
// TODO: Finish this later, I'm tired
asdfasfs
DocumentCommunicationHelper.prototype.eventOut = function(type, data) {
    var opCodeHandler = opCodeHandlers[type];

    if (opCodeHandler.pack) {

    }

    var out = _.map(opCodeHandler.fields, function(name, num) {
        return data[]
    });
};

module.exports = DocumentCommunicationHelper;