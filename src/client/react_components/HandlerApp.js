var react = require('react');

var TopBarComponent = require('./ComponentTopBar');
var RouteHandler = require('react-router').RouteHandler;

var AppComponent = react.createClass({
    statics: {
        willTransitionFrom: function() {
            //alert('transition');
        },
        willTransitionTo: function (transition, params) {
            //alert('transition');
            //console.log("Transition!!", transition, params);
        }
    },

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