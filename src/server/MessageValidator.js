var tv4 = require('tv4');

var schema = {
    type: 'object',
    properties: {
        "id": {
            type: 'string'
        },
        "type": {
            type: 'string'
        },
        "sender": {
            type: 'string'
        }
    },
    required: ["id", "type", "sender"],
    additionalProperties: false,
    oneOf: [
        {
            title: "Document operation",
            properties: {
                "type": {
                    enum: ['operation']
                },
                "operation": {
                    type: 'array',
                    items: [
                        { type: 'string' },
                        { type: 'integer' }
                    ]
                },
                "revision": {
                    type: 'integer'
                }
            },
            required: ["operation", "revision"]
        },
        {
            title: "Document selection",
            properties: {
                "type": {
                    enum: ['selection']
                },
                "selection": {
                    additionalProperties: true,
                    type: 'object'
                }
            }
        }
    ]
};

module.exports.validate = function(message) {
    var result = tv4.validate(message, schema);
    var error = tv4.error;
    if (!result) {
        console.log(message, error);
    }
    return result;
};