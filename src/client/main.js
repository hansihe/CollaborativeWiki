// Imports
var react = require('react');
React = react;
var shoe = require('shoe');
var Stream = require('../shared/networkChannel');
var DocumentClientManager = require('./documentClientManager');
var _ = require('../shared/underscore');
var eventAliases = require('../shared/eventAliases');

var ot = require('ot');
var CodeMirrorAdapter = require('./codemirror-adapter');

var CodeMirrorComponent = require('./react_components/codemirror');
var CodeMirrorUserSelectionManager = require('./codeMirrorUserSelectionManager');
require('codemirror/mode/markdown/markdown');
// End imports

var documentClientManager = new DocumentClientManager();

var sock = shoe('/endpoint');
var stream = new Stream(sock, {
    test: function(callback) {
        callback(function() {
            console.log("Success: server -> client -> server -> client");
        });
    }
});

stream.on('remote', function(remote) {
    console.log('remote');
    documentClientManager.serverConnected(stream);
});
stream.on('end', function() {
    console.log('end');
    documentClientManager.serverDisconnected();
});



var onCreateCodeMirror = function(editor) {
    var channel = documentClientManager.requestClient("testDocument");
    var adapter = new CodeMirrorAdapter(editor);
    new CodeMirrorUserSelectionManager(editor);
    adapter.registerCallbacks({
        change: function(operation, inverse) {
            if (t) {
                channel.applyChange(operation);
            }
        }
    });
    var t = false;
    channel.on('documentReplace', function(document) {
        editor.setValue(document);
        t = true;
    });
    channel.on('applyOperation', function(operation) {
        if (t) {
            adapter.applyOperation(operation);
        }
    });

    editor.on("beforeSelectionChange", function(cm, selections) {
        var otRanges = _.map(selections.ranges, function(value) {
            return {'anchor': cm.indexFromPos(value.anchor), 'head': cm.indexFromPos(value.head)};
        });
        var otSelection = {'ranges': otRanges};
        console.log(otSelection);
    });
};
react.render(
    (<CodeMirrorComponent
        style={{border: '1px solid black'}}
        defaultValue="Testing"
        mode="markdown"
        theme="neat"
        lineNumbers="true"
        onCreate={onCreateCodeMirror}/>),
    document.getElementById('root'));