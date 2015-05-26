var Marty = require("marty");

class DocumentStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {};
        this.handlers = {

        };
    }
}
