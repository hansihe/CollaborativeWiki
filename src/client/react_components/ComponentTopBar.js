var React = require('react');
var ReactRouter = require('react-router');

var Link = require('react-router').Link;

var MixinNavigationUtil = require('./MixinNavigationUtil');

var TopBarLocationEditComponent = require('./ComponentTopBarLocationEdit');
var ComponentEditButton = require('./ComponentEditButton');

var RxLifecycleMixin = require('./mixin/RxLivecycleMixin.js');

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
    mixins: [RxLifecycleMixin],
    contextTypes: {
        applicationState: React.PropTypes.object
    },

    componentWillMount: function() {
        console.log(this);
//        this.rxLifecycle.componentWillUpdate.subscribe(() => console.log("Woohoo, output"));
        this.context.applicationState.connectionStatus.subscribe(state => this.setState({state: state}));
    },

    render: function() {
        var color = this.state.state ? "green" : "red";
        return (
            <div className="connection-status">
                <div className={"icon icon-flash "+color}></div>
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
