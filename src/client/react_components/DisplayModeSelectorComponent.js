var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var DisplayModeSelectorComponent = React.createClass({
    mixins: [ReactRouter.State],

    render: function() {
        var active = this.props.active;
        return (
            <ul className="display-mode-selector">
                <li className={active == 'view' ? 'active' : ''}><Link to="page" params={{documentId: this.props.documentId}}>View</Link></li>
                <li className={active == 'edit' ? 'active' : ''}><Link to="pageEdit" params={{documentId: this.props.documentId}}>Edit</Link></li>
            </ul>
        );
    }
});

module.exports = DisplayModeSelectorComponent;