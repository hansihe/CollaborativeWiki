var React = require('react');
var renderer = require('../markdown/renderer');
var services = require('../state/serviceManager');
var DocumentUseMixin = require('./mixin/DocumentUseMixin');

var DocumentRenderer = React.createClass({
    mixins: [React.PureRenderMixin, DocumentUseMixin],
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

    onDocumentChange: function() {
        this.setMarkdown(this.document.text);
    },
    setMarkdown: function(markdown) {
        this.setState({
            markdown: markdown
        });
    },

    componentWillMount: function() {
        this.setState({documentId: this.props.documentId});
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({documentId: nextProps.documentId});
    },

    attachDocumentListeners: function() {
        //this.document.documentChangeEvent.on(this.onDocumentChange);
        // TODO
        this.document.text.subscribe(text => this.setMarkdown(text));
    },
    initialStateReceived: function() {
        //this.setMarkdown(this.document.text);
    },
    detachDocumentListeners: function() {
        //this.document.documentChangeEvent.off(this.onDocumentChange);
        // TODO
    }
});

module.exports = DocumentRenderer;
