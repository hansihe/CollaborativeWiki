var React = require('react');
var ReactRouter = require('react-router');

var Link = require('react-router').Link;

var MixinNavigationUtil = require('./MixinNavigationUtil');

var TopBarLocationEditComponent = require('./ComponentTopBarLocationEdit');
var ComponentEditButton = require('./ComponentEditButton');

/*scss*
    .connection-status {
        position: relative;
        height: $header-height;
        width: $header-height - 10;

        .icon {
            font-size: 1.5em;
            position: absolute;
            top: 13px;
            left: 6px;

            &.green {
                color: #4CAF50;
            }
            &.red {
                color: #F44336;
            }
        }
    }
 *scss*/

var ConnectionStatusComponent = React.createClass({
    render: function() {
        return (
            <div className="connection-status">
                <div className="icon icon-flash green"></div>
            </div>
        );
    }
});

var ActionBarComponent = React.createClass({
    mixins: [MixinNavigationUtil],

    getInitialState: function() {
        return {
            location: this.context.router.getCurrentParams().documentId || 'index'
        }
    },

    render: function() {
        var editButton = this.routeIsDocument() ? (<ComponentEditButton/>) : undefined;
        return (
            <nav className="top-bar">
                <TopBarLocationEditComponent/>
                {editButton}
                <div className="right-segment">
                    <ConnectionStatusComponent/>
                </div>
            </nav>
        )
    },

    toggleEditMode: function() {

    }
});

module.exports = ActionBarComponent;
