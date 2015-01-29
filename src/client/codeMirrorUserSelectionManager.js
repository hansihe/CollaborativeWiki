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
        var cursors = _.map(this.state.users, function(value, key) {
            if (value.selections.length == 0) {
                return
            }
            var cursorPos = componentThis.calculateCursorPosition(value.selections[0].head);
            return <div key={key}
                style={{
                    position: 'absolute',
                    top: cursorPos.bottom,
                    left: cursorPos.left
                }}>
                <UserCursorComponent name={key}/>
            </div>;
        });
        return <div>{cursors}</div>
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