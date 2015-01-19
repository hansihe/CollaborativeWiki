var Reflux = require('reflux');

var actions = Reflux.createActions([
    "updateRouteState"
]);

var routeStateStore = Reflux.createStore({
    init: function() {
        this.listenToMany(actions);
    },
    onUpdateRouteState: function(state) {
        this.state = state;
        this.trigger(this.state);
    }
});

module.exports = {
    actions: actions,
    store: routeStateStore
};