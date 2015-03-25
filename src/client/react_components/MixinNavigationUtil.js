var React = require('react');

var MixinNavigationUtil = {
    contextTypes: {
        router: React.PropTypes.func
    },

    navigateToWikiPage: function(id) {
        this.context.router.transitionTo('document', {documentId: id});
    },
    getWikiLocation: function() {
        if (this.context.router.getCurrentPathname() == '/') {
            return 'index';
        }
        if (this.context.router.getCurrentParams().documentId) {
            return this.context.router.getCurrentParams().documentId;
        }
        return '';
    },

    routeIsDocument: function() {
        return this.context.router.isActive("document");
    },
    routeIsDocumentEditing: function() {
        return this.context.router.isActive("documentEdit");
    }
};

module.exports = MixinNavigationUtil;
