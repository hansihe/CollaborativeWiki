var React = require('react');
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DocumentRendererComponent = require('./ComponentDocumentRenderer');

var services = require('../state/serviceManager');

var DocumentViewComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
/*            <div style={{overflowY: "scroll", height: "100%"}}>
                <div className="row">
                    <div className="small-12">
                        <div className="panel">
                            <DocumentRendererComponent
                                documentId={documentId}
                                style={{width: "100%", paddingLeft: "10px"}}/>
                        </div>
                    </div>
                </div>
            </div>*/
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
