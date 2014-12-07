// Imports
var react = require('react');
React = react;
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



var renderer = require('./markdown/renderer');
console.log(renderer.renderText('# test\n> Testing __how2lol?__'));



var ReactRouter = require('react-router');
var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;

var App = require('./react_components/ViewApp');
var DocumentView = require('./react_components/ViewDocumentView');
var DocumentEdit = require('./react_components/ViewDocumentEdit');
var Login = require('./react_components/ViewLogin');

var routes = (
    <Route name="index" path="/" handler={App}>
        <DefaultRoute handler={DocumentEdit}/>
        <Route name="login" handler={Login}/>
        <Route name="page" path="/page/:documentId" handler={DocumentEdit}/>
        <Route name="pageEdit" path="/page/:documentId/edit" handler={DocumentEdit}/>
    </Route>
);

window.onload = function() {
    ReactRouter.run(routes, ReactRouter.HistoryLocation, function(Handler) {
        React.render((<Handler/>), document.body);
    });
};