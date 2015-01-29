var React = require('react');

var cursorHeight = 13;

var UserCursorComponent = React.createClass({
    onEnter: function(e) {
        console.log("HOVER!", e);
    },
    render: function() {
        return (
            <div
                key="cursorRoot"
                className="other-user-cursor"
                onMouseOver={this.onEnter}
                style={{
                    position: 'absolute',
                    left: '-1px',
                    height: 0,
                    width: 0
                }}>
                <div
                    key="cursorBar"
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        height: cursorHeight + 'px',
                        width: '2px',
                        backgroundColor: 'green'
                    }}/>
                <div
                    key="cursorTop"
                    style={{
                        position: 'absolute',
                        backgroundColor: 'green',
                        bottom: (cursorHeight - 1) + 'px',
                        left: '-2px',
                        height: '6px',
                        width: '6px'
                    }}/>
                <div
                    key="cursorName"
                    className="cursor-name"
                    style={{
                        position: 'absolute',
                        backgroundColor: 'green',
                        bottom: (cursorHeight - 1) + 'px',
                        left: '-2',
                        padding: '2px',
                        zIndex: 20
                    }}>{this.props.name}</div>
            </div>
        );
    }
});

module.exports = UserCursorComponent;