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
    calculateCursorPosition: function(index) {
        var cm = this.props.editor;
        return cm.cursorCoords(cm.clipPos(cm.getDoc().posFromIndex(index)), 'local')
    },
    render: function() {
        var componentThis = this;

        // Each user has a div with all their cursors in. This makes one container for each user.
        var userCursorContainers = _.map(this.state.users, function(value, userName) {
            // In each user's cursor container, there may be multiple cursors. They are keyed by their position in the
            // array.
            var userCursors = _.map(value.selections, function(value, cursorNum) {
                var cursorPos = componentThis.calculateCursorPosition(value.head);
                return (
                    <div
                        key={cursorNum}
                        style={{
                            position: 'absolute',
                            top: cursorPos.bottom,
                            left: cursorPos.left
                        }}>
                        <UserCursorComponent name={userName}/>
                    </div>
                );
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

    this.selectionState = {};

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