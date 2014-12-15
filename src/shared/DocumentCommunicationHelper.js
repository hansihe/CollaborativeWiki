var _ = require('./underscore');
var EventEmitter = require('events').EventEmitter;
var ot = require('ot');

var opCodes = [
    'documentOperation',
    'userEnterDocument',
    'userExitDocument',
    'userSelection'
];
var opCodesInv = _.reduce(opCodes, function(result, code, num) {
    result[code] = num;
    return result;
}, {});

var opCodeHandlers = {
    documentOperation: {
        fields: ['documentId', 'userId', 'documentRevision', 'operation'],
        pack: function(data) {
            //console.log(data);
            //if (typeof data.operation ==)
            //data.operation = ot.TextOperation.prototype.toJSON.call(data.operation);
            // TODO: flsdhfkjsahdgf
            return data;
        },
        unpack: function(data) {
            data.operation = ot.TextOperation.fromJSON(data.operation);
            return data;
        }
    },
    userSelection: {
        fields: ['documentId', 'userId', 'selection']
    }
};

var DocumentCommunicationHelper = {};

DocumentCommunicationHelper.unpack = function(data) {
    var opCode = opCodes[data[0]];

    if (!opCode) {
        console.error('opcode not recognized', data);
        return;
    }

    var opCodeHandler = opCodeHandlers[opCode];

    var out = _.reduce(opCodeHandler.fields, function(result, name, num) {
        result[name] = data[num + 1];
        return result;
    }, {});

    out.type = opCode;

    if (opCodeHandler.unpack) {
        out = opCodeHandler.unpack(out);
    }

    return out;
};

DocumentCommunicationHelper.pack = function(data, type) {
    var oType = type || data.type;
    var opCodeNumber = opCodesInv[oType];
    var opCodeHandler = opCodeHandlers[oType];

    if (opCodeHandler.pack) {
        data = opCodeHandler.pack(data);
    }

    var out = _.map(opCodeHandler.fields, function(name, num) {
        return data[name];
    });

    return [opCodeNumber].concat(out);
};

module.exports = DocumentCommunicationHelper;