const { BaseDocumentSync, BaseExtension, ClientDocumentSync, ClientExtension } = require("../../client/ot/DocumentSync");
const OTExtension = require("../../client/ot/OTExtension");

describe("BaseDocumentSync", () => {
    it("should expose events and methods from extensions", () => {
        class TE1 extends BaseExtension {
            static getName() {
                return 'tx1';
            }
            static getEvents() {
                return [
                    'TEST_EVENT'
                ];
            }

            constructor(base) {
                super(base);
                this.methods = {
                    testMethod: () => {}
                };
            }
        }
        const ds = new BaseDocumentSync([TE1]);

        (ds.methods.tx1).should.have.property("testMethod").Function;
    });

    it("should dispatch events between extensions", () => {
        let result = false;

        class TX1 extends BaseExtension {
            static getName() {
                return 'tx1';
            }
            static getEvents() {
                return [
                    'TEST_EVENT'
                ];
            }

            constructor(base) {
                super(base);
                this.methods = {
                    test: () => this.dispatch(this.events.TEST_EVENT, "ArgumentOne", "Two")
                };
            }
        }
        class TX2 extends BaseExtension {
            static getName() {
                return 'tx2';
            }

            constructor(base) {
                super(base);
                this.bindEvent(this.allEvents.tx1.TEST_EVENT, this.testEvent);
            }
            testEvent() {
                result = true;
            }
        }
        const ds = new BaseDocumentSync([TX1, TX2]);
        ds.methods.tx1.test();

        (result).should.be.True;
    });

});

describe("ClientDocumentSync", () => {
    it("should dispatch received messages to extensions", () => {
        var received = [];
        class TX1 extends ClientExtension {
            static getName() {
                return 'tx1';
            }

            constructor(base) {
                super(base);
                this.bindMessage('test', this.recvTest);
            }
            recvTest(message, id) {
                received.push(message, id);
            }
        }
        const ds = new ClientDocumentSync([TX1]);

        const message = {
            type: ['tx1', 'test'],
            msg: 'success',
            id: 'docId'
        };
        ds.recvMessage(message);

        (received).should.be.eql(['success', 'docId']);
    });
});

describe("OTExtension", () => {

});
