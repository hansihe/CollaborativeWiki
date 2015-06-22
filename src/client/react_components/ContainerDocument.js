var Marty = require('marty');
var React = require('react');

export var RouteDocumentUse = ComposedComponent => {
    class RoutePassComponent extends React.Component {
        render() {
            console.log(this.context);
            return <ComposedComponent {...this.props} documentId={this.context.router.getCurrentParams().documentId}/>;
        }
    };
    RoutePassComponent.contextTypes = {
        router: React.PropTypes.func
    };
    return RoutePassComponent;
};

export var DocumentUse = ComposedComponent => {
    class DocumentComponent extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {};
            this.state = this.documentIdChange(props.documentId);
        }

        componentWillReceiveProps(next) {
            this.setState(this.documentIdChange(next.documentId));
        }

        documentIdChange(name) {
            if (name !== this.state.documentId) {
                var documentHandle = this.state.documentHandle;
                if (documentHandle) {
                    documentHandle.release();
                }

                var documentHandle = this.context.app.documentStore.getDocumentHandle(name);

                return {
                    documentId: name,
                    documentHandle: documentHandle
                };
            }
            return {};
        }

        getChildContext() {
            return {
                documentId: this.state.documentId,
                documentHandle: this.state.documentHandle
            };
        }

        render() {
            return <ComposedComponent {...this.props}/>;
        }
    };
    DocumentComponent.contextTypes = {
        app: React.PropTypes.object.isRequired
    };
    DocumentComponent.childContextTypes = {
        documentId: React.PropTypes.string,
        documentHandle: React.PropTypes.object
    };
    return RouteDocumentUse(DocumentComponent);
};

export var provideDocumentHandle = ComposedComponent => {
    class DocumentHandleProvider extends React.Component {
        render() {
            return <ComposedComponent {...this.props} documentHandle={this.context.documentHandle} app={this.context.app}/>;
        }
    }
    DocumentHandleProvider.contextTypes = {
        documentHandle: React.PropTypes.object,
        app: React.PropTypes.object
    }
    return DocumentHandleProvider;
}
