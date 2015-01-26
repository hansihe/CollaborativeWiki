var React = require('react');
var CodeMirror = require('codemirror');
var services = require('../state/serviceManager');
var _ = require('../../shared/underscore');
var DocumentUseMixin = require('./mixin/DocumentUseMixin');

var CodeMirrorAdapter = require('../codemirror-adapter');
var CodeMirrorUserSelectionManager = require('../codeMirrorUserSelectionManager');

require('codemirror/mode/markdown/markdown');


var CodeMirrorDocumentEditor = React.createClass({
    mixins: [React.PureRenderMixin, DocumentUseMixin],
    propTypes: {
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        documentId: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {
            mode: 'markdown',
            theme: 'neat',
            lineNumbers: true
        }
    },

    render: function() {
        return (
            <div className="codemirror-container" ref="container" style={this.props.style}></div>
        );
    },

    componentWillMount: function() {
        this.setState({documentId: this.props.documentId});
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({documentId: nextProps.documentId});
    },

    componentDidMount: function() {
        console.log("Codemirror init");
        this.editor = CodeMirror(this.refs.container.getDOMNode(), this.props);
    },

    /**
     * Normally called by setDocument whe
     * @param editor
     * @param documentClient
     */
    setDocumentClientOnEditor: function(editor, documentClient) {
        documentClient.text && editor.setValue(documentClient.text);

        this.editorDocumentAdapter = new CodeMirrorAdapter(editor);
        this.editorDocumentSelectionManager = new CodeMirrorUserSelectionManager(editor);

        this.editorDocumentAdapter.registerCallbacks({
            change: function(operation, inverse) {
                documentClient.performClientOperation(operation);
            },
            selectionChange: function() {
                var otRanges = [];
                _.forEach(editor.getDoc().listSelections(), function(value) {
                    otRanges.push({
                        anchor: editor.indexFromPos(value.anchor),
                        head: editor.indexFromPos(value.head)
                    });
                });
                var otSelection = {'ranges': otRanges};

                documentClient.performSelection(otSelection);
            }
        });
    },
    onApplyOperation: function(operation) {
        var documentClient = this.document;
        var editor = this.editor;

        this.editorDocumentAdapter.applyOperation(operation);
        this.editorDocumentAdapter.registerCallbacks({
            change: function(operation, inverse) {
                documentClient.performClientOperation(operation);
            },
            selectionChange: function() {
                var otRanges = [];
                _.forEach(editor.getDoc().listSelections(), function(value) {
                    otRanges.push({
                        anchor: editor.indexFromPos(value.anchor),
                        head: editor.indexFromPos(value.head)
                    });
                });
                var otSelection = {'ranges': otRanges};

                documentClient.performSelection(otSelection);
            }
        });
    },

    attachDocumentListeners: function() {
        this.document.serverOperationEvent.on(this.onApplyOperation);
    },
    initialStateReceived: function() {
        this.setDocumentClientOnEditor(this.editor, this.document);
    },
    detachDocumentListeners: function() {
        this.editorDocumentAdapter.detach();
        this.editor.setValue('');
        this.document.serverOperationEvent.off(this.onApplyOperation);
    }
});

module.exports = CodeMirrorDocumentEditor;