var React = require('react');

var LocationEdit = React.createClass({
    getInitialState: function() {
        return {
            location: this.props.location
        }
    },

    render: function() {
        return (
            <li className="has-form">
                <input
                    ref="input"
                    type="text"
                    placeholder="Wiki page"
                    className="location-edit-box"
                    style={{width: "200%"}}
                    value={this.state.location}
                    onBlur={this.revertValue}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}/>
            </li>
        );
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            location: nextProps.location
        });
    },
    revertValue: function() {
        this.setState({
            location: this.props.location
        });
    },
    handleChange: function(event) {
        this.setState({
            location: event.target.value
        })
    },
    handleKeyDown: function(event) {
        if (event.keyCode == 13) {
            this.props.navigationCallback(this.state.location);
        }
    }
});

module.exports = LocationEdit;