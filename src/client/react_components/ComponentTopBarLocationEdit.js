var React = require('react');
var MixinNavigationUtil = require('./MixinNavigationUtil');

var ComponentTextEdit = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value
        }
    },

    render: function() {
        return (
            <input type="text" className={this.props.className}
                value={this.state.value}
                onBlur={this.revertValue}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}/>
        );
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            value: nextProps.value
        });
    },
    revertValue: function() {
        this.setState({
            value: this.props.value
        });
    },
    handleChange: function(event) {
        this.setState({
            value: event.target.value
        });
    },
    handleKeyDown: function(event) {
        if (event.keyCode == 13) {
            this.props.submit(this.state.value);
        }
    }
});

var LocationEdit = React.createClass({
    mixins: [MixinNavigationUtil],

    render: function() {
        return (
            <div className="page-nav-container">
                <ComponentTextEdit value={this.getWikiLocation()} className="page-nav"
                    submit={(value) => {this.navigateToWikiPage(value)}}/>
            </div>
        );
    }
});

module.exports = LocationEdit;
