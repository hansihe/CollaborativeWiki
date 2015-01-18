var React = require('react');

var HTMLDisplayComponent = React.createClass({
    render: function() {
        return (
            <div dangerouslySetInnerHTML={{__html: this.props.html}}/>
        )
    }
});

module.exports = HTMLDisplayComponent;