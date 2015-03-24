var React = require('react');
var ReactRouter = require('react-router');

var Link = require('react-router').Link;

var TopBarLocationEditComponent = require('./ComponentTopBarLocationEdit');

var ConnectionStatusComponent = React.createClass({
    render: function() {
        return (
            <div className="connection-status">
                <div className="icon icon-flash green"></div>
            </div>
        );
    }
});

var ActionBarComponent = React.createClass({
    mixins: [ReactRouter.State, ReactRouter.Navigation],

    getInitialState: function() {
        return {
            location: this.getParams().documentId || 'index'
        }
    },

    render: function() {
        return (
            <nav className="top-bar">
                <TopBarLocationEditComponent location={this.getWikiLocation()} navigationCallback={this.navigateToWikiPage}/>
                <div className="right-segment">
                    <ConnectionStatusComponent/>
                </div>
            </nav>
        )
    },

    getWikiLocation: function() {
        if (this.getPath() == '/') {
            return 'index';
        }
        if (this.getParams().documentId) {
            return this.getParams().documentId;
        }
        return '';
    },

    navigateToWikiPage: function(id) {
        this.transitionTo('document', {documentId: id});
    }
});

module.exports = ActionBarComponent;
