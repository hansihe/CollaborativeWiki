var React = require('react');

var TitleComponent = React.createClass({
    render: function() {
        return (
            <div className="sidebar-title">{this.props.children}</div>
        );
    }
});

var UsersSideBar = React.createClass({
    render: function() {
        return (
            <div className="users-sidebar">
                <TitleComponent>Users</TitleComponent>
            </div>
        )
    }
});

module.exports = UsersSideBar;