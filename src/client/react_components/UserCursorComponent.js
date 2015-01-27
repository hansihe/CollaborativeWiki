var React = require('react');

var cursorHeight = 13;

var UserCursorComponent = React.createClass({
    onEnter: function() {
        console.log("HOVER!");
    },
    render: function() {
        return (
            <div
                key="cursorRoot"
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
            </div>
        );
    }
});

module.exports = UserCursorComponent;