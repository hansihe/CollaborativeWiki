var Rx = require('rx');
var _ = require('../../../shared/underscore.js');

var lifecycleEvents = {
    'componentWillMount': [], 
    'componentDidMount': [], 
    'componentWillReceiveProps': ['nextProps'], 
    'componentWillUpdate': ['nextProps', 'nextState'], 
    'componentDidUpdate': ['prevProps', 'prevState'], 
    'componentWillUnmount': []
};
var lifecycleEventNames = _.keys(lifecycleEvents);

var RxLifecycleMixin = {
    getInitialState: function() {
        this._rxLifecycle = _.zipObject(lifecycleEventNames, 
                _.map(lifecycleEventNames, () => new Rx.Subject()));
        this.rxLifecycle = _.zipObject(lifecycleEventNames, 
                _.map(lifecycleEventNames, eventName => 
                    this._rxLifecycle[eventName].takeUntil(
                        this._rxLifecycle.componentWillUnmount)));
        console.log(this);
        return {};
    }
};
_.assign(RxLifecycleMixin, _.zipObject(lifecycleEventNames, _.map(lifecycleEvents, function(args, name) {
    var _arguments = arguments;
    return _.zipObject(args, _.map(args, (argName, num) => _arguments[num]));
})));
