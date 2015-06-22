var React = require('react');
var renderer = require('../markdown/renderer');
var services = require('../state/serviceManager');
var DocumentUseMixin = require('./mixin/DocumentUseMixin');

var { provideDocumentHandle } = require('./ContainerDocument');


class DocumentRenderer extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            markdown: ''
        };

        this.registerHandler();
    }

    registerHandler() {
        this.props.documentHandle.bindEvent(
                this.props.app.documentStore.documentSync.events.ot.REPLACE_TEXT, 
                this.replaceText.bind(this));

        let state = this.props.documentHandle.getState();
        this.setState({
            markdown: state.text
        });
        // TODO: Fix state setting
    }

    replaceText({ text }) {
        this.setState({
            markdown: text
        });
    }

    render() {
        return (
            <div style={this.props.style} className="markdown-container">
                {renderer.renderText(this.state.markdown)}
            </div>
        );
    }
}

//var DocumentRenderer = React.createClass({
//    mixins: [React.PureRenderMixin, DocumentUseMixin],
//    getInitialState: function() {
//        return {
//            markdown: ''
//        }
//    },
//
//    render: function() {
//        return (
//            <div style={this.props.style} className="markdown-container">
//                {renderer.renderText(this.state.markdown)}
//            </div>
//        )
//    },
//
//    onDocumentChange: function() {
//        this.setMarkdown(this.document.text);
//    },
//    setMarkdown: function(markdown) {
//        this.setState({
//            markdown: markdown
//        });
//    },
//
//    componentWillMount: function() {
//        this.setState({documentId: this.props.documentId});
//    },
//    componentWillReceiveProps: function(nextProps) {
//        this.setState({documentId: nextProps.documentId});
//    },
//
//    attachDocumentListeners: function() {
//        //this.document.documentChangeEvent.on(this.onDocumentChange);
//        // TODO
//        this.document.text.subscribe(text => this.setMarkdown(text));
//    },
//    initialStateReceived: function() {
//        //this.setMarkdown(this.document.text);
//    },
//    detachDocumentListeners: function() {
//        //this.document.documentChangeEvent.off(this.onDocumentChange);
//        // TODO
//    }
//});

module.exports = provideDocumentHandle(DocumentRenderer);
