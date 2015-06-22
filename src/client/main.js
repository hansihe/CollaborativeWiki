// Imports
window.Marty = require('marty');
var Marty = require('marty');

var SocketStateSource = require('./SocketStateSource');
var ConnectionStore = require('./store/ConnectionStore');
var DocumentStore = require('./store/DocumentStore');

var React = require('react');
var _ = require('../shared/underscore');

var ReactRouter = require('react-router');
var {Route, DefaultRoute, Redirect} = ReactRouter;

var HandlerApp = require('./react_components/HandlerApp');
var HandlerDocument = require('./react_components/HandlerDocument');
var HandlerDocumentView = require('./react_components/HandlerDocumentView');
var HandlerDocumentEdit = require('./react_components/HandlerDocumentEdit');
var HandlerLogin = require('./react_components/HandlerLogin');

var routeStateStore = require('./state/stores/RouteState');

var routes = (
    <Route name="index" path="/" handler={HandlerApp}>
        <Redirect from="/" to="documentView" params={{documentId: "index"}}/>
        <Route name="login" handler={HandlerLogin}/>
        <Route name="document" path="/d/:documentId" handler={HandlerDocument}>
            <DefaultRoute name="documentView" handler={HandlerDocumentView}/>
            <Route name="documentEdit" path="edit" handler={HandlerDocumentEdit}/>
        </Route>
    </Route>
);

class Application extends Marty.Application {
    constructor(options) {
        super(options);

        this.register('constants', () => require('./Constants'));

        this.register('socketSourceActions', require('./SocketStateSource').SocketActions);
        this.register('socketSource', require('./SocketStateSource').default);

        this.register('connectionStore', require('./store/ConnectionStore'));
        this.register('documentStore', require('./store/DocumentStore'));
    }
}

var stream = require('stream');
window.onload = function() {
    var app = new Application();

    ReactRouter.run(routes, ReactRouter.HistoryLocation, function(Handler, state) {
        routeStateStore.actions.updateRouteState(state);
        var component = (
            <Marty.ApplicationContainer app={app}>
                <Handler/>
            </Marty.ApplicationContainer>
        );
        React.render(component, document.body);
    });
};
