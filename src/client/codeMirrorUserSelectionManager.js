var UserCursorComponent = require('./react_components/UserCursorComponent');
var CodeMirror = require('codemirror');
var React = require('react');
var _ = require('lodash');

function CodeMirrorUserSelection(cm) {
    this.cm = cm;

    this.editorCursors = {};
    this.userCursors = {};

    //this.editorCursors['test'] = this.initWidgetComponent(<UserCursorComponent/>, 20);
    //this.editorCursors['test'][2] = 20;

    this.setUserCursors({
        wattest: {
            index: 15
        },
        twst2: {
            index: 10
        }
    });
}

CodeMirrorUserSelection.prototype.setUserCursors = function(newUserCursors) {
    var oldCursors = _.map(this.userCursors, function(value, key) {
        return key;
    });
    var newCursors = _.map(newUserCursors, function(value, key) {
        return key;
    });

    var removedCursors = _.difference(oldCursors, newCursors);
    for (var i = 0; i < removedCursors.length; i++) {
        this.removeWidget(removedCursors[i]);
    }

    this.userCursors = newUserCursors;

    this.editorChange();
};

CodeMirrorUserSelection.prototype.editorChange = function() {
    var userSelectionThis = this;
    console.log(this.editorCursors, this.userCursors);
    _.forEach(this.userCursors, function(value, key) {
        userSelectionThis.ensureUserCursor(key, value.index);
    });
};

CodeMirrorUserSelection.prototype.ensureUserCursor = function(user, index) {
    if (this.editorCursors[user] === undefined) {
        this.editorCursors[user] = this.initWidgetComponent(<UserCursorComponent user={user}/>, index);
    } else {
        this.setWidgetIndex(this.editorCursors[user][0], index);
    }
};

CodeMirrorUserSelection.prototype.initWidgetComponent = function(component, index) {
    var container = document.createElement('div');
    container.style.position = 'absolute';
    this.cm.display.sizer.insertBefore(container, this.cm.display.sizer.firstChild);
    //this.cm.display.sizer.appendChild(container);
    this.cursor = container;

    var rendered = React.render(component, container);

    if (index) {
        this.setWidgetIndex(container, index);
    }

    return [container, rendered];
};

CodeMirrorUserSelection.prototype.setWidgetIndex = function(element, index) {
    var pos = this.cm.cursorCoords(this.cm.clipPos(this.cm.getDoc().posFromIndex(index)), 'local');
    var cursor = this.cursor;
    cursor.style.top = pos.bottom + 'px';
    cursor.style.left = pos.left + 'px';
};

CodeMirrorUserSelection.prototype.removeWidget = function(id) {
    var element = this.editorCursors[id][0];
    element.parentNode.removeChild(element);
    delete this.editorCursors[id];
};

module.exports = CodeMirrorUserSelection;