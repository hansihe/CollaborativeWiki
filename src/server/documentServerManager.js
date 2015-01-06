var DocumentServer = require('./DocumentServer');

var documentServerManager = {};

documentServerManager.loadedDocuments = {};

documentServerManager.getDocumentServer = function(documentId) {
    var document = this.loadedDocuments[documentId];
    if (!document) {
        document = new DocumentServer(documentId);
        this.loadedDocuments[documentId] = document;
    }
    return document;
};

module.exports = documentServerManager;