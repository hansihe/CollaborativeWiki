import {TextOperation} from 'ot';

// Nicked stuff from ot.js' selection.

module.exports = {
    transformIndex: function(index, operation) {
        var newIndex = index;
        var ops = operation.ops;
        for (var i = 0, l = operation.ops.length; i < l; i++) {
            if (TextOperation.isRetain(ops[i])) {
                index -= ops[i];
            } else if (TextOperation.isInsert(ops[i])) {
                newIndex += ops[i].length;
            } else {
                newIndex -= Math.min(index, -ops[i]);
                index += ops[i];
            }
            if (index < 0) { break; }
        }
        return newIndex;
    },
    transformRange: function(range, operation) {
        var head = this.transformIndex(range.head, operation);
        if (range.anchor === range.head) {
            return {
                head: head,
                anchor: head
            }
        } else {
            return {
                head: head,
                anchor: this.transformIndex(range.anchor, operation)
            }
        }
    },
    transformRanges: function(ranges, operation) {
        var result = [];
        for (var i = 0; i < ranges.length; i++) {
            result.push(this.transformRange(ranges[i], operation));
        }
        return result;
    }
};