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

class DocumentViewComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="document-view-standalone-container">
                <div className="text-container">
                    <DocumentRendererComponent
                        documentHandle={this.context.documentHandle}/>
                </div>
            </div>
        );
    }
}
DocumentViewComponent.contextTypes = {
    documentHandle: React.PropTypes.object
};

module.exports = DocumentViewComponent;
