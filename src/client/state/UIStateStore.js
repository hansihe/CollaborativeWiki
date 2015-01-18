var Reflux = require('reflux');

var actions = Reflux.createActions([
    "toggleUsersSidebar"
]);

var uiStateStore = Reflux.createStore({
    init: function() {
        this.state = {
            usersSidebarOpen: false
        };
        this.listenToMany(actions);
    },
    onToggleUsersSidebar: function() {
        this.state.usersSidebarOpen = !this.state.usersSidebarOpen;
        this.trigger(this.state);
    }
});

module.exports = {
    actions: actions,
    store: uiStateStore
};