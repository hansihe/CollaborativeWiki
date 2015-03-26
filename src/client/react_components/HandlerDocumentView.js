var React = require('react');
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DocumentRendererComponent = require('./ComponentDocumentRenderer');

var services = require('../state/serviceManager');

/*scss*
    .document-view-standalone-container {
        overflow-y: scroll;
        height: 100%;

        .text-container {
            display: flex;
            justify-content: center;

            .markdown-container {
                width: 100%;
                margin-top: 10px;
                word-wrap: break-word;

                @media screen and (min-width: 960px) {
                    width: 860px;
                    padding: 10px;
                    background-color: #fafafa;
                }
            }
        }
    }
 *scss*/

var DocumentViewComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
            <div className="document-view-standalone-container">
                <div className="text-container">
                    <DocumentRendererComponent
                        documentId={documentId}/>
                </div>
            </div>
        );
    }
});

module.exports = DocumentViewComponent;
