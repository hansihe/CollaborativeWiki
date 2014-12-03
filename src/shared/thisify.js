module.exports = function(func, thisArg) {
    return function() {
        return func.apply(thisArg, arguments);
    }
};
