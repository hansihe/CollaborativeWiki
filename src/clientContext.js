var OTServer = require('./shared/customOT').Server;
var NetworkChannel = require('./shared/networkChannel');
var ot = require('ot');
var uuid = require('node-uuid');
var r = require('./redisClient');
var eventAliases = require('./shared/eventAliases');

var tempDocuments = {
    testDocument: new OTServer("testDocumentWoo5")
};

function ClientContext(stream) {
    var clientConnectionThis = this;

    this.debugLog = function() {
        console.log.apply(console.log, ["ClientContext", clientConnectionThis.uuid, ":"].concat(arguments))
    };

    this.uuid = uuid.v4();

    this.channel = new NetworkChannel(stream, {
        initDocumentChannel: function(id, callback) {
            var document = tempDocuments[id];

            document.documentWrapper.subscribe(function(operation) {
                clientConnectionThis.channel.pubsub.publish(eventAliases.documentOperation, operation.id, clientConnectionThis.uuid == operation.senderUUID, operation.revision, operation.operation);
            });

            var multi = r.redisConnection.multi();

            multi.get(document.documentWrapper.propertyNames['document']);
            multi.llen(document.documentWrapper.propertyNames['operations']);

            multi.exec(function(err, results) {
                if (document) {
                    var documentText = results[0] || "";
                    console.log(results);
                    callback(true, results[1], documentText);
                } else {
                    callback(false);
                }
            });
        }
    });

    // Confirmed connection
    this.channel.on('remote', function(remote) {
        clientConnectionThis.debugLog("Connected");

        clientConnectionThis.channel.pubsub.on(eventAliases.documentOperation, function(id, revision, rawOperation) { // OT operation receive
            var document = tempDocuments[id];
            var operation = ot.TextOperation.fromJSON(rawOperation);
            document.receiveOperation(revision, operation, {
                id: id,
                senderUUID: clientConnectionThis.uuid
            });
        });
    });
}

module.exports = ClientContext;