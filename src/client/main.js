// Imports
window.Marty = require('marty');

var SocketStateSource = require('./SocketStateSource');
var ConnectionStore = require('./store/ConnectionStore');
var DocumentStore = require('./store/DocumentStore');

var React = require('react');
var _ = require('../shared/underscore');

var PrimusClient = require('./primusClient');

var ReactRouter = require('react-router');
var {Route, DefaultRoute, Redirect} = ReactRouter;

var HandlerApp = require('./react_components/HandlerApp');
var HandlerDocument = require('./react_components/HandlerDocument');
var HandlerDocumentView = require('./react_components/HandlerDocumentView');
var HandlerDocumentEdit = require('./react_components/HandlerDocumentEdit');
var HandlerLogin = require('./react_components/HandlerLogin');

var routeStateStore = require('./state/stores/RouteState');
var DocumentClientManager = require('./state/DocumentClientManager');
var Rx = require("rx");
var dnode = require('dnode');
var util = require('../shared/util');

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

var stream = require('stream');
window.onload = function() {
//    var state = {
//        documentClientManager: undefined,
//        socket: new Rx.ReplaySubject(1),
//        socketOpen: undefined, // O
//        socketClose: undefined, // O
//        connectionId: new Rx.BehaviorSubject(),
//        connectionStatus: new Rx.BehaviorSubject(false),
//        documentMessageStreamSubject: new Rx.ReplaySubject(1),
//        rpcInstance: new Rx.ReplaySubject(1),
//        rpcRemote: new Rx.ReplaySubject(1)
//    }
//
//    // Connection and connection events
//    var socket = PrimusClient.connect('/socket');
//    state.socketOpen = Rx.Observable.fromEvent(socket, 'open').map(() => socket);
//    state.socketOpen.subscribe(state.socket);
//    state.socketClose = Rx.Observable.fromEvent(socket, 'close');
//
//    // Connection state tracking
//    Rx.Observable.merge(
//            state.socketOpen.map(() => true),
//            state.socketClose.map(() => false))
//        .subscribe(state.connectionStatus);
//    state.connectionStatus.subscribe(state => console.log("Connection State: ", state));
//
//    // Connection id
//    state.socket.flatMap(
//            Rx.Observable.fromCallback(socket.id.bind(socket))())
//        .subscribe(state.connectionId);
//    state.socketClose.subscribe(state.connectionId);
//
//    // Document message stream
//    state.documentMessageStreamSubject = state.socketOpen.map(
//            socket => util.streamSubject(socket.substream('dm')));
//    state.documentMessageStreamSubject.filter(s => s != undefined).subscribe(
//            stream => stream.subscribe(
//                message => state.documentClientManager.incomingServerDocumentMessage(message)));
//
//    // RPC
//    function makeDnode(socket) {
//        var dn = dnode({});
//        util.dPipe(dn, socket.substream('d'));
//        return dn;
//    };
//    state.rpcInstance = state.socket.map(
//            socket => makeDnode(socket));
//    state.rpcRemote = state.rpcInstance.flatMap(
//            dn => Rx.Observable.fromEvent(dn, 'remote').first());
//
//    // Document manager
//    state.documentClientManager = new DocumentClientManager(state);

    var ContextComponent = React.createClass({
        childContextTypes: {
            documentClientManager: React.PropTypes.object.isRequired,
            applicationState: React.PropTypes.object.isRequired
        },
        getChildContext: function() {
            return {
                documentClientManager: state.documentClientManager,
                applicationState: state
            }
        },
        render: function() {
            return <this.props.Handler/>;
        }
    });

    ReactRouter.run(routes, ReactRouter.HistoryLocation, function(Handler, state) {
        routeStateStore.actions.updateRouteState(state);
        React.render((<ContextComponent Handler={Handler}/>), document.body);
    });
};
