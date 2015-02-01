import React from 'react';
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
import AnimateMixin from 'react-animate';
import TimerMixin from './mixin/TimerMixin.js';


var cursorHeight = 13;

var styles = {
    cursorRoot: {
        position: 'absolute',
        height: 0,
        width: 0
    },
    cursorBar: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: cursorHeight,
        width: '2px'
    },
    cursorTop: {
        position: 'absolute',
        bottom: cursorHeight - 1,
        left: '-2px',
        height: '6px',
        width: '6px'
    },
    cursorName: {
        position: 'absolute',
        bottom: cursorHeight - 1,
        left: '-2',
        padding: '2px'
    }
};

var UserCursorComponent = React.createClass({
    mixins: [TimerMixin, AnimateMixin],
    getInitialState: function() {
        return {
            nameVisible: false
        }
    },

    onEnter: function(e) {
        this.clearTimeout(this.state.hoverTimeout);
        // If the name is not already visible, animate it
        if (!this.state.nameVisible) {
            this.animate('name-fade', {opacity: 0}, {opacity: 1}, 100);
        }
        this.setState({
            nameVisible: true,
            hoverTimeout: null
        });
    },
    onExit: function(e) {
        // We don't want it to pop out immediately when a user takes the mouse away, we want to wait a bit.
        let timeout = this.setTimeout(this.timerExit, 1000);
        this.setState({
            hoverTimeout: timeout
        });
    },
    timerExit: function() {
        let _this = this;
        this.animate('name-fade', {opacity: 1}, {opacity: 0}, 100, {
            onComplete: function() {
                _this.setState({
                    nameVisible: false
                });
            }
        });
        this.setState({
            hoverTimeout: null
        });
    },

    calculateCursorPosition: function(index) {
        var cm = this.props.editor;
        return cm.cursorCoords(cm.clipPos(cm.getDoc().posFromIndex(index)), 'local')
    },
    markText: function(editor, range) {
        let startPos = editor.getDoc().posFromIndex(Math.min(range.head, range.anchor));
        let endPos = editor.getDoc().posFromIndex(Math.max(range.head, range.anchor));
        return editor.markText(startPos, endPos, {className: "test", css: "color: green;"});
    },

    componentWillReceiveProps: function(nextProps) {
        this.state.textMarking.clear();

        this.setState({
            textMarking: this.markText(nextProps.editor, nextProps.cursorRange)
        });
    },
    componentDidMount: function() {
        this.setState({
            textMarking: this.markText(this.props.editor, this.props.cursorRange)
        });
    },
    componentWillUnmount: function() {
        this.state.textMarking.clear();
    },

    render: function() {
        let cursorPosition = this.calculateCursorPosition(this.props.cursorRange.head);
        let rootStyle = {
            position: 'absolute',
            top: cursorPosition.bottom,
            left: cursorPosition.left - 1
        };
        let nameStyle = this.state.nameVisible ? {} : {visibility: 'hidden'};
        return (
            <div
                key="cursorRoot"
                className="other-user-cursor"
                onMouseOver={this.onEnter}
                onMouseOut={this.onExit}
                style={_.extend(rootStyle, styles.cursorRoot)}>
                <div
                    key="cursorBar"
                    className="cursor-bar"
                    style={styles.cursorBar}/>
                <div
                    key="cursorTop"
                    className="cursor-top"
                    style={styles.cursorTop}/>
                <div
                    key="cursorName"
                    className="cursor-name"
                    style={_.extend(nameStyle, this.getAnimatedStyle('name-fade'), styles.cursorName)}>{this.props.name}</div>
            </div>
        );
    }
});

module.exports = UserCursorComponent;