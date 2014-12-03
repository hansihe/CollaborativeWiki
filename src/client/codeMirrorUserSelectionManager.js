function CodeMirrorUserSelection(cm) {
    this.cm = cm;

    var cmUSThis = this;

    //setTimeout(function() {
    var pos = cm.getDoc().posFromIndex(2);
    var cursor = cmUSThis.makeCursor(2, pos);
    cm.addWidget(pos, cursor);
    //}, 2000);


    setInterval(function() {

    });


    console.log("yee");
}

CodeMirrorUserSelection.prototype.makeCursor = function() {
    /*var cursorCoords = this.cm.cursorCoords(this.cm, pos, "div", null, null, !this.cm.options.singleCursorHeightPerLine);
    var cursorHeight = Math.max(0, pos.bottom - pos.top) * this.cm.options.cursorHeight + "px";*/
    var cursorHeight = 13 + "px";

    var element = document.createElement("div");
    element.style.position = "absolute";
    element.style.height = cursorHeight;
    element.style.width = 0;
    element.style.borderLeft = "solid 1px green";
    element.style.borderRight = "solid 1px green";

    return element;
};

module.exports = CodeMirrorUserSelection;