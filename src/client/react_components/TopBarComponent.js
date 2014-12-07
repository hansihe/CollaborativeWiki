var React = require('react');
var ReactRouter = require('react-router');

var Link = require('react-router').Link;

var TopBarLocationEditComponent = require('./TopBarLocationEditComponent');

var ActionBarComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        /*<LocationEditComponent/>*/

        return (
            <nav className="top-bar">
                <ul className="title-area">
                    <li className="name">
                        <h1><Link to="index">My Wiki</Link></h1>
                    </li>
                </ul>
                <section className="top-bar-section">
                    <ul className="left">
                        <TopBarLocationEditComponent/>
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
    }
});

module.exports = ActionBarComponent;