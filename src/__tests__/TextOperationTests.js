jest.dontMock('ot');
var TextOperation = require('ot').TextOperation;

// http://en.wikipedia.org/wiki/Operational_transformation#Transformation_properties
describe('TextOperation', function() {
    it('satisfies CP1/TP1', function() {
        var op0 = TextOperation.fromJSON(["a"]);
        var op1 = TextOperation.fromJSON(["b"]);

        var transformed = TextOperation.transform(op0, op1);

        expect(op1.compose(transformed[0])).toEqual(op0.compose(transformed[1]));
    });
    it('satisfies CP2/TP2', function() {
        var op1 = TextOperation.fromJSON(["a"]);
        var op2 = TextOperation.fromJSON(["b"]);
        var op3 = TextOperation.fromJSON(["c"]);

        var transformed1 = TextOperation.transform(op1, op2);

        var transformed2 = TextOperation.transform(op2.compose(transformed1[0]), op3);
        var transformed3 = TextOperation.transform(op1.compose(transformed1[1]), op3);

        expect(transformed2).toEqual(transformed3);
    });

    it('satisfies IP1', function() {
        var op = TextOperation.fromJSON([2, "ab", 2]);
        var result = op.compose(op.invert());
        expect(op.baseLength).toEqual(result.targetLength);
    });
    it('satisfies IP2', function() {
        var op1 = TextOperation.fromJSON(["1", 1, "2", 1, "3", 1, "4", 1, "5"]);
        var op2 = TextOperation.fromJSON(["a", 1, "b", 1, "c", 1, "d", 1, "e"]);

        var undone = op1.compose(op1.invert());
        var transformed = TextOperation.transform(op2, undone);

        expect(transformed[0]).toEqual(op2);
    });
    it('satisfies IP3', function() {
        var op1 = TextOperation.fromJSON([2, "a", 1, "b", 2]);
        var op2 = TextOperation.fromJSON(["1", 1, "2", 1, "3", 2, "4", 1, "5"]);

        var transformed = TextOperation.transform(op1, op2);

        var result1 = TextOperation.transform(op1.invert(), transformed[1])[0];
        var result2 = transformed[0].invert();

        expect(result1).toEqual(result2);
    });
});