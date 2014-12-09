var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var DisplayModeSelectorComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var active = this.props.active;
        return (
            <ul className="display-mode-selector">
                <li className={active == 'view' ? 'active' : ''}><Link to="page" params={this.getParams()}>View</Link></li>
                <li className={active == 'edit' ? 'active' : ''}><Link to="pageEdit" params={this.getParams()}>Edit</Link></li>
            </ul>
        );
    }
});

module.exports = DisplayModeSelectorComponent;