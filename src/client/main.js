// Imports
var React = require('react');
var shoe = require('shoe');
var _ = require('../shared/underscore');

var ot = require('ot');
// End imports

/*
Client:
ClientStateManager
 - NetworkChannel
 - DocumentClientManager
   - DocumentClient

Server:

 */


var PrimusClient = require('./primusClient');
console.log(PrimusClient);

var ReactRouter = require('react-router');
var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var Redirect = ReactRouter.Redirect;

var HandlerApp = require('./react_components/HandlerApp');
var HandlerDocument = require('./react_components/HandlerDocument');
var HandlerDocumentView = require('./react_components/HandlerDocumentView');
var HandlerDocumentEdit = require('./react_components/HandlerDocumentEdit');
var HandlerLogin = require('./react_components/HandlerLogin');

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

var routeStateStore = require('./state/stores/RouteState');

window.onload = function() {
    ReactRouter.run(routes, ReactRouter.HistoryLocation, function(Handler, state) {
        routeStateStore.actions.updateRouteState(state);
        React.render((<Handler/>), document.body);
    });
};
