var _ = require('../../../shared/underscore');

var TimerMixin = {
    componentWillMount: function() {
        this.timerTimeouts = [];
        this.timerIntervals = [];
    },
    setTimeout: function(callback, delay, ...args) {
        let obj = setTimeout(callback, delay, ...args);
        this.timerTimeouts.push(obj);
        return obj;
    },
    clearTimeout: function(obj) {
        _.remove(this.timerTimeouts, function(item) {
            return item === obj;
        });
        clearTimeout(obj);
    },
    setInterval: function(callback, delay, ...args) {
        let obj = setTimeout(callback, delay, ...args);
        this.timerIntervals.push(obj);
        return obj;
    },
    clearInterval: function(obj) {
        _.remove(this.timerIntervals, function(item) {
            return item === obj;
        });
        clearInterval(obj);
    },
    componentWillUnmount: function() {
        _.map(this.timerTimeouts, function(obj) {
            clearTimeout(obj);
        });
        _.map(this.timerIntervals, function(obj) {
            clearInterval(obj);
        });
    }
};

module.exports = TimerMixin;