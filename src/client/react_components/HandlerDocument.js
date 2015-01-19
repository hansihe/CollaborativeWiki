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
        var test = this.state.uiState.usersSidebarOpen ? (<div key="usersBar" style={{flex: "0 0 200px", height: "100%", width: "200px"}}><UserBarComponent/></div>) : undefined;
        return (
            <ReactCSSTransitionGroup
                component="div"
                transitionName="flex-animation"
                className="flex-animation-container">
                <div
                    key="routeContainer"
                    style={{flex: "1 0 0", height: "100%", overflow: "hidden"}}>
                    <ReactRouter.RouteHandler/>
                </div>
                {test}
                <SideBarComponent
                    key="sidebar"
                    editing={true}
                    test={this.test}/>
            </ReactCSSTransitionGroup>
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