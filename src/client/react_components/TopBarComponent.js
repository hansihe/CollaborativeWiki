var React = require('react');
var ReactRouter = require('react-router');

var Link = require('react-router').Link;

var TopBarLocationEditComponent = require('./TopBarLocationEditComponent');

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
                <ul className="title-area">
                    <li className="name">
                        <h1><Link to="index">My Wiki</Link></h1>
                    </li>
                </ul>
                <section className="top-bar-section">
                    <ul className="left">
                        <TopBarLocationEditComponent location={this.getWikiLocation()} navigationCallback={this.navigateToWikiPage}/>
                    </ul>
                </section>
                <section className="top-bar-section">
                    <ul className="right">
                        <li>
                            <Link to="login">Sign in</Link>
                        </li>
                    </ul>
                </section>
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
        this.transitionTo('page', {documentId: id});
    }
});

module.exports = ActionBarComponent;