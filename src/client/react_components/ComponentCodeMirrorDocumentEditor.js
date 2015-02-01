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
            lineNumbers: true,
            lineWrapping: true
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
        this.editor.on('changes', this.editorDocumentSelectionManager.editorChange.bind(this.editorDocumentSelectionManager));

        this.editorDocumentAdapter.registerCallbacks({
            change: function(operation, inverse) {
                documentClient.performClientOperation(operation);
            },
            selectionChange: function() {
                var otSelections = [];
                _.forEach(editor.getDoc().listSelections(), function(value) {
                    otSelections.push({
                        anchor: editor.indexFromPos(value.anchor),
                        head: editor.indexFromPos(value.head)
                    });
                });

                documentClient.performSelection(otSelections);
            }
        });
    },

    onApplyOperation: function(operation) {
        this.editorDocumentAdapter.applyOperation(operation);
    },
    onSelectionsChange: function() {
        this.editorDocumentSelectionManager.setUserCursors(this.document.getOtherUsers());
    },

    attachDocumentListeners: function() {
        this.document.serverOperationEvent.on(this.onApplyOperation);
        this.document.selectionsChangeEvent.on(this.onSelectionsChange);
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