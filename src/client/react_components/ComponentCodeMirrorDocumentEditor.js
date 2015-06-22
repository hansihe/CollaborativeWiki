var React = require('react');
var CodeMirror = require('codemirror');
var services = require('../state/serviceManager');
var _ = require('../../shared/underscore');
var DocumentUseMixin = require('./mixin/DocumentUseMixin');

var CodeMirrorAdapter = require('../codemirror-adapter');
var CodeMirrorUserSelectionManager = require('../codeMirrorUserSelectionManager');

require('codemirror/mode/markdown/markdown');

var { provideDocumentHandle } = require('./ContainerDocument');

var codemirrorOptions = {
    mode: 'markdown',
    theme: 'neat',
    lineNumbers: false,
    lineWrapping: true
};

class CodeMirrorDocumentEditor extends React.Component {
    constructor(props, context) {
        super(props, context);

    }

    render() {
        return (
            <div className="codemirror-container" ref="container" style={this.props.style}></div>
        );
    }

    componentDidMount() {
        this.editor = CodeMirror(this.refs.container.getDOMNode(), codemirrorOptions);
        this.registerHandler();
    }
}


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
            lineNumbers: false,
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
        //documentClient.initialState.map(() => documentClient.text.getValue()).subscribe(text => editor.setValue(text));

        var replaceText = new Rx.Subject();
        var operationSkip = new Rx.Subject();
        var editorOperation = new Rx.Subject();
        //Rx.Observable.repeat().flatMap(() => editorOperation.takeUntil(operationSkip).skip(1)).subscribe(operation => console.log(operation));
        
        //var skipNum = 0;
        //operationSkip.subscribe(num => skipNum += (num || 1));
        editorOperation.subscribe(operation => documentClient.performClientOperation(operation));
        //editorOperation.filter(() => skipNum == 0).subscribe(operation => { console.log(operation)});
        //editorOperation.subscribe(() => {if(skipNum > 0) {skipNum -= 1}});
        
        replaceText.subscribe(operationSkip);
        replaceText.subscribe(text => editor.setValue(text));

        documentClient.textReplace.subscribe(replaceText);
        replaceText.onNext(documentClient.text.getValue());

        this.editorDocumentAdapter = new CodeMirrorAdapter(editor);
        this.editorDocumentSelectionManager = new CodeMirrorUserSelectionManager(editor);
        this.editor.on('changes', this.editorDocumentSelectionManager.editorChange.bind(this.editorDocumentSelectionManager));

        this.editor.undo = function() {};
        this.editor.redo = function() {};

        this.editorDocumentAdapter.registerCallbacks({
            change: function(operation, inverse) {
                editorOperation.onNext(operation);
                //documentClient.performClientOperation(operation);
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
        //this.document.serverOperationEvent.on(this.onApplyOperation);
        //this.document.selectionsChangeEvent.on(this.onSelectionsChange);
        // TODO
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
