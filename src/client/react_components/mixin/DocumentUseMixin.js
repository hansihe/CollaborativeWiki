var React = require('react');
var services = require('../../state/serviceManager');

var DocumentUseMixin = {
    contextTypes: {
        documentClientManager: React.PropTypes.object
    },

    _mountDocument: function(documentId) {
        if (this.document) {throw "error";}

        this.document = this.context.documentClientManager.requestClient(this, documentId);
        this.useEnd = new Rx.Subject();
        this.document.initialState.takeUntil(this.useEnd).subscribe(() => this.initialStateReceived());
        this.attachDocumentListeners();
    },

    _unmountDocument: function() {
        if (!this.document) {throw "error";}
        this.useEnd.onNext();

        this.detachDocumentListeners();
        this.context.documentClientManager.releaseClient(this, this.document);
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
