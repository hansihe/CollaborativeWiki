var React = require('react');
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DocumentRendererComponent = require('./DocumentRendererComponent');
var DisplayModeSelectorComponent = require('./DisplayModeSelectorComponent');

var services = require('../state/serviceManager');

var DocumentViewComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
            <div style={{height: "100%", overflowY: "scroll", paddingTop: "20px", position: "relative"}}>
                <DisplayModeSelectorComponent active="view"/>
                <div className="row">
                    <div className="small-12">
                        <div className="panel">
                            <DocumentRendererComponent
                                documentId={documentId}
                                style={{width: "100%", paddingLeft: "10px"}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DocumentViewComponent;