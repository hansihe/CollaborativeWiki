var React = require('react');
var services = require('../../state/serviceManager');

var DocumentUseMixin = {
    _mountDocument: function(documentId) {
        if (this.document) {
            throw "error";
        }
        var _this = this;
        this.document = services.stateManager.documentClientManager.requestClient(this, documentId);
        this.cancelStateCallback = this.document.getInitialState(function() {
            _this.initialStateReceived();
        });
        this.attachDocumentListeners();
    },
    _unmountDocument: function() {
        if (!this.document) {
            throw "error";
        }
        if (this.cancelStateCallback) {
            this.cancelStateCallback();
            delete this.cancelStateCallback;
        }
        this.detachDocumentListeners();
        services.stateManager.documentClientManager.destroyClient(this, this.document);
        delete this.document;
    },

    componentWillUpdate: function(nextProps, nextState) {
        if (this.state.documentId !== nextState.documentId) {
            if (this.document) {
                this._unmountDocument();
            }
            this._mountDocument(nextState.documentId);
        }
    },

    componentDidMount: function() {
        if (this.state.documentId) {
            this._mountDocument(this.state.documentId);
        }
    },
    componentWillUnmount: function() {
        if (this.document) {
            this._unmountDocument();
        }
    }

    //attachDocumentListeners: function() {},
    //initialStateReceived: function() {},
    //detachDocumentListeners: function() {}
};

module.exports = DocumentUseMixin;