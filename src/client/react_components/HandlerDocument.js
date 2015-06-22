require('react/addons');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var ReactRouter = require('react-router');
var _ = require('../../shared/underscore');

var DisplayModeSelectorComponent = require('./ComponentDisplayModeSelector');
var SideBarComponent = require('./ComponentSideBar');
var UserBarComponent = require('./ComponentUsersSideBar');

var services = require('../state/serviceManager');

var { DocumentUse } = require('./ContainerDocument');

var DocumentEditComponent = React.createClass({
    mixins: [ReactRouter.State],

    render() {
        console.log("render");
        var documentId = this.getParams().documentId || 'index';
        return (
            <div
                key="routeContainer"
                style={{height: "100%", overflow: "hidden"}}>
                <ReactRouter.RouteHandler/>
            </div>
        );
    },
    componentDidMount() {
        console.log("mount");
    },
    componentWillUnmount() {
        console.log("unmount");
    }
});

module.exports = DocumentUse(DocumentEditComponent);
