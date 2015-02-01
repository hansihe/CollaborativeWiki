var UserCursorComponent = require('./react_components/ComponentUserCursor');
var CodeMirror = require('codemirror');
var React = require('react');
var _ = require('lodash');

var CursorRootComponent = React.createClass({
    getInitialState: function() {
        return {
            users: []
        }
    },
    render: function() {
        var componentThis = this;

        // Each user has a div with all their cursors in. This makes one container for each user.
        var userCursorContainers = _.map(this.state.users, function(value, userName) {
            // In each user's cursor container, there may be multiple cursors. They are keyed by their position in the
            // array.
            var userCursors = _.map(value.selections, function(value, cursorNum) {
                return <UserCursorComponent key={cursorNum} name={userName} cursorRange={value} editor={componentThis.props.editor}/>;
            });
            return (
                <div key={userName}>
                    {userCursors}
                </div>
            );
        });
        return <div>{userCursorContainers}</div>
    },
    editorChange: function() {
        this.forceUpdate();
    }
});

function CodeMirrorUserSelection(cm) {
    this.cm = cm;

    var container = document.createElement('div');
    container.style.position = 'absolute';
    this.cm.display.sizer.insertBefore(container, this.cm.display.sizer.firstChild);
    this.component = React.render(<CursorRootComponent editor={this.cm}/>, container);
}

CodeMirrorUserSelection.prototype.setUserCursors = function(userCursors) {
    this.component.setState({
        users: userCursors
    });
};

CodeMirrorUserSelection.prototype.editorChange = function() {
    this.component.editorChange();
};

module.exports = CodeMirrorUserSelection;