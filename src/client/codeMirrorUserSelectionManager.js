function CodeMirrorUserSelection(cm) {
    this.cm = cm;

    var cmUSThis = this;

    //setTimeout(function() {
    var pos = cm.getDoc().posFromIndex(2);
    this.cursor = cmUSThis.makeCursor(2, pos);
    cm.addWidget(pos, this.cursor);
    //}, 2000);


    //console.log("yee");
}

CodeMirrorUserSelection.prototype.makeCursor = function() {
    /*var cursorCoords = this.cm.cursorCoords(this.cm, pos, "div", null, null, !this.cm.options.singleCursorHeightPerLine);
    var cursorHeight = Math.max(0, pos.bottom - pos.top) * this.cm.options.cursorHeight + "px";*/
    var cursorHeight = 13 + "px";

    var cursorContainer = document.createElement("div");
    cursorContainer.style.position = "absolute";
    cursorContainer.style.height = 0;
    cursorContainer.style.width = 0;

    var cursorDisplay = document.createElement("div");
    cursorDisplay.style.position = "absolute";
    cursorDisplay.style.left = 0;
    cursorDisplay.style.bottom = 0;
    cursorDisplay.style.height = cursorHeight;
    cursorDisplay.style.width = 0;
    cursorDisplay.style.borderLeft = "solid 1px green";
    cursorDisplay.style.borderRight = "solid 1px green";

    cursorContainer.appendChild(cursorDisplay);

    return cursorContainer;
};

CodeMirrorUserSelection.prototype.setCursorPos = function(pos) {
    this.cursor.parentElement.removeChild(this.cursor);
    this.cm.addWidget(this.cm.getDoc().posFromIndex(pos), this.cursor);
};

module.exports = CodeMirrorUserSelection;