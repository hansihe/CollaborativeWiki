var React = require('react');
var ReactRouter = require('react-router');

var UIStateStore = require('../state/stores/UIState');

var SideBarButtonComponent = React.createClass({
    render: function() {
        return undefined;
    }
});

var SideBarComponent = React.createClass({
    mixins: [ReactRouter.Navigation],
    getDefaultProps: function() {
        return {
            editing: false
        };
    },
    render: function() {
        var editText = this.props.editing ? "View" : "Edit";

        return (
            <div className="sidebar">
                <div className="sidebar-button active" onClick={this.toggleEdit}>{editText}</div>
                <div className="sidebar-button" onClick={UIStateStore.actions.toggleUsersSidebar}>Users</div>
            </div>
        )
    },
    toggleEdit: function() {

    }
});

module.exports = SideBarComponent;