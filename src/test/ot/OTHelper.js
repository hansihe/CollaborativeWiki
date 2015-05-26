const { default: OTHelper, OTStates } = require("../../client/ot/OTHelpers");
const { TextOperation } = require("ot");

const OP1 = new TextOperation().retain(4).insert("woo");

describe("OTHelper", () => {
    describe("#applyClient", () => {
        it("should apply a operation to the synchronized state", () => {
            //OTHelper.applyClient(OTStates.synchronized, null, OP1).should.equal([
            //    ['state', OTStates.awaiting],
            //    ['send', OP1],
            //    ['outstanding', OP1]
            //]);
        });
    });
});
