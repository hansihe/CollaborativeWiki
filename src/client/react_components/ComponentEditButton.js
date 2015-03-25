var React = require('react');
var MixinNavigationUtil = require('./MixinNavigationUtil');

var ComponentEditButton = React.createClass({
    mixins: [MixinNavigationUtil],

    render: function() {
        var button_class = this.routeIsDocumentEditing() ? "edit-button active" : "edit-button";
        return ( 
            <div className="edit-button-container" style={{float: "left"}}>
                <button onClick={this.onClick} className={button_class}>
                    Edit    
                </button>
            </div>
        );
    },

    onClick: function() {
        if (this.routeIsDocumentEditing()) {
            this.context.router.transitionTo("document", {documentId: this.getWikiLocation()});
        } else {
            this.context.router.transitionTo("documentEdit", {documentId: this.getWikiLocation()});
        }
    }
});

module.exports = ComponentEditButton;
