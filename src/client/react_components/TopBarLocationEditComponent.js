var React = require('react');
var ReactRouter = require('react-router');

var LocationEdit = React.createClass({
    mixins: [ReactRouter.State, ReactRouter.Navigation],

    getInitialState: function() {
        return {
            location: this.getParams().documentId || 'index'
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
    revertValue: function() {
        var documentId = this.getParams().documentId || 'index';
        this.setState({
            location: documentId
        });
    },
    handleChange: function(event) {
        this.setState({
            location: event.target.value
        })
    },
    handleKeyDown: function(event) {
        if (event.keyCode == 13) {
            this.transitionTo('page', {documentId: this.state.location})
        }
    }
});

module.exports = LocationEdit;