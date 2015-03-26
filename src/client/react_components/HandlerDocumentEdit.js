var React = require('react');
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DisplayModeSelectorComponent = require('./ComponentDisplayModeSelector');
var CodeMirrorDocumentEditorComponent = require('./ComponentCodeMirrorDocumentEditor');
var DocumentRendererComponent = require('./ComponentDocumentRenderer');
var SideBarDocument = require('./ComponentSideBar');

var services = require('../state/serviceManager');

var EditorSeparator = React.createClass({
    render: function() {
        return (
            <div>
            
            </div>
        );
    }
});

/*scss*

.document-edit-root-container {
    display: flex;
    height: 100%;
    position: relative;

    .document-edit-editor {
        height: 100%;
        flex: 1 0 0;

        .codemirror-container {
            height: 100%;
        }
    }

    .document-edit-separator {
        flex: 0 0 20px;
        border-left: solid 1px #dddddd;
        background-color: #fcfcfc;
    }

    .document-edit-preview {
        flex: 1 0 0;
        border-left: solid 1px #dddddd;
        padding-left: 10px;
        padding-right: 10px;
        overflow-y: scroll;
    }
}

 *scss*/

var DocumentEditComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
            <div className="document-edit-root-container">
                <div className="document-edit-editor">
                    <CodeMirrorDocumentEditorComponent documentId={documentId}/>
                </div>
                <div className="document-edit-separator"></div>
                <div className="document-edit-preview">
                    <DocumentRendererComponent documentId={documentId}/>
                </div>
            </div>
        );
    }
});

module.exports = DocumentEditComponent;
