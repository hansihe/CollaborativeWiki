require('react/addons');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DisplayModeSelectorComponent = require('./ComponentDisplayModeSelector');
var SideBarComponent = require('./ComponentSideBar');
var UserBarComponent = require('./ComponentUsersSideBar');

var services = require('../state/serviceManager');

var Reflux = require('reflux');
var UIStateStore = require('../state/stores/UIState');

var DocumentEditComponent = React.createClass({
    mixins: [ReactRouter.State, Reflux.ListenerMixin],
    getInitialState: function() {
        return {
            v: true
        };
    },

    render: function() {
        var documentId = this.getParams().documentId || 'index';
        return (
            <div
                key="routeContainer"
                style={{height: "100%", overflow: "hidden"}}>
                <ReactRouter.RouteHandler/>
            </div>
        );
    },
    componentWillMount: function() {
        this.listenTo(UIStateStore.store, this.onUIStateChange);
        this.setState({
            uiState: UIStateStore.store.state
        });
    },
    onUIStateChange: function(state) {
        this.setState({
            uiState: state
        });
    },
    test: function() {
        this.setState({
            v: !this.state.v
        });
    }
});

module.exports = DocumentEditComponent;
