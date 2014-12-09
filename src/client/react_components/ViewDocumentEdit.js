var React = require('react');
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var CodeMirrorDocumentEditorComponent = require('./CodeMirrorDocumentEditorComponent');
var DocumentRendererComponent = require('./DocumentRendererComponent');

var services = require('../state/serviceManager');

var DocumentEditComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
            <div style={{display: "flex", height: "100%"}}>
                <CodeMirrorDocumentEditorComponent
                    documentId={documentId}
                    style={{height: "100%", flex: "1 0 0"}}/>
                <DocumentRendererComponent
                    documentId={documentId}
                    style={{flex: "1 0 0", borderLeft: "solid 1px #ddd", paddingLeft: "10px", overflowY: "scroll"}}/>
            </div>
        );
    }
});

module.exports = DocumentEditComponent;