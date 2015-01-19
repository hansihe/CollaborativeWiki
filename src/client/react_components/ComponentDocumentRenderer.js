var React = require('react');
var renderer = require('../markdown/renderer');
var services = require('../state/serviceManager');

var DocumentRenderer = React.createClass({
    mixins: [React.PureRenderMixin],
    getInitialState: function() {
        return {
            markdown: ''
        }
    },

    render: function() {
        return (
            <div style={this.props.style} className="markdown-container">
                {renderer.renderText(this.state.markdown)}
            </div>
        )
    },
    setDocument: function(documentId) {
        var componentThis = this;

        if(componentThis.cancelStateCallback) {
            componentThis.cancelStateCallback();
        }

        if (this.document) {
            this.document.documentChangeEvent.off(this.onDocumentChange);
            services.stateManager.documentClientManager.destroyClient(this, this.document);
        }

        this.document = services.stateManager.documentClientManager.requestClient(this, documentId);
        this.cancelStateCallback = this.document.getInitialState(function() {
            componentThis.document.documentChangeEvent.on(componentThis.onDocumentChange);
            componentThis.setMarkdown(componentThis.document.text);
        });
    },
    componentDidMount: function() {
        this.setDocument(this.props.documentId);
    },
    componentWillReceiveProps: function(nextProps) {
        this.setDocument(nextProps.documentId);
    },
    componentWillUnmount: function() {
        services.stateManager.documentClientManager.destroyClient(this, this.document);
    },

    onDocumentChange: function() {
        this.setMarkdown(this.document.text);
    },

    setMarkdown: function(markdown) {
        console.log();
        this.setState({
            markdown: markdown
        });
    }
});

module.exports = DocumentRenderer;