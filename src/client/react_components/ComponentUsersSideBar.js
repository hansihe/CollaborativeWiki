var React = require('react');
var DocumentUseMixin = require('./mixin/DocumentUseMixin');
var _ = require('../../shared/underscore');

var TitleComponent = React.createClass({
    render: function() {
        return (
            <div className="sidebar-title">{this.props.children}</div>
        );
    }
});

var UsersSideBar = React.createClass({
    mixins: [DocumentUseMixin],
    render: function() {
        var userEntries = _.map(this.state.users, function(data, name) {
            return (<li key={name}>{name}</li>);
        });
        return (
            <div className="users-sidebar">
                <TitleComponent>Users</TitleComponent>
                <ul>
                    {userEntries}
                </ul>
            </div>
        )
    },

    componentWillMount: function() {
        this.setState({documentId: this.props.documentId});
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({documentId: nextProps.documentId});
    },

    handleUsersChange: function() {
        this.setState({
            users: this.document.users
        })
    },

    attachDocumentListeners: function() {
        this.document.usersChangeEvent.on(this.handleUsersChange);
    },
    initialStateReceived: function() {
        this.setState({
            users: this.document.users
        });
    },
    detachDocumentListeners: function() {
        this.document.usersChangeEvent.off(this.handleUsersChange);
    }
});

module.exports = UsersSideBar;