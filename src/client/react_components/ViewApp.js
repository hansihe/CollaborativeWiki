var react = require('react');

var TopBarComponent = require('./TopBarComponent');
var RouteHandler = require('react-router').RouteHandler;

var AppComponent = react.createClass({
    render: function() {
        return (
            <div className="app-root">
                <TopBarComponent/>
                <div className="app-content-wrapper">
                    <RouteHandler/>
                </div>
            </div>
        )
    }
});

module.exports = AppComponent;