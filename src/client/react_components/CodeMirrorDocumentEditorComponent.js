var React = require('react');
var CodeMirror = require('codemirror');
var services = require('../state/serviceManager');
var _ = require('../../shared/underscore');

var CodeMirrorAdapter = require('../codemirror-adapter');
var CodeMirrorUserSelectionManager = require('../codeMirrorUserSelectionManager');

require('codemirror/mode/markdown/markdown');


var CodeMirrorDocumentEditor = React.createClass({
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

    componentDidMount: function() {
        this.editor = CodeMirror(this.refs.container.getDOMNode(), this.props);
        this.setDocument(this.props.documentId);
    },
    componentWillReceiveProps: function(nextProps) {
        this.setDocument(nextProps.documentId);
    },
    setDocument: function(documentId) {
        var componentThis = this;

        this.setState({
            loading: true
        });

        if(componentThis.cancelStateCallback) {
            componentThis.cancelStateCallback();
        }

        if (this.document) {
            this.editorDocumentAdapter.detach();
            this.editor.setValue('');
            this.document.removeListener('applyOperation', this.onApplyOperation);
        }

        this.document = services.stateManager.documentClientManager.requestClient(documentId);
        this.cancelStateCallback = this.document.getInitialState(function() {
            componentThis.setDocumentClientOnEditor(componentThis.editor, componentThis.document);

            componentThis.setState({
                loading: false
            });
        });
    },

    render: function() {
        return (
            <div className="codemirror-container" ref="container" style={this.props.style}></div>
        );
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

        this.document.on('applyOperation', this.onApplyOperation);

        //documentClient.on('selection', function(selection) {
        //    codeMirrorExtension.setCursorPos(selection.ranges[0].anchor)
        //});
    },
    onApplyOperation: function(operation) {
        this.editorDocumentAdapter.applyOperation(operation);
    }
});

module.exports = CodeMirrorDocumentEditor;