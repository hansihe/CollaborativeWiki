CollaborativeWiki
=================

A markdown-based wiki with realtime collaborative features. Node.js used on the backend, browserify for frontend.
Written as a personal project, trying to get some experience writing interactive javascript applications.
Uses react.js and react-router for frontend, remarkable with customizations for markdown rendering.

Please note that this is not safe at all for use on open networks. The server does not yet verify incoming data from the client before processing it.

## Todo
### High priority
* [x] Text synchronization across clients using ot
* [x] Proper editor (codemirror)
* [x] Realtime markdown preview utilizing react.js diffing
* [x] Cursor synchronization
* [x] Messages for when people join/leave documents
* [x] Proper document lifecycle management on both client and server
* [ ] Implement reconnect on disconnect
* [ ] Stop trusting the damned client (verify inputs, fail gracefully)
* [ ] Proper dependency management

### Lower priority
* [ ] Accounts
* [ ] History viewer (probably with a fancy slider so you can go back and fourth through the document history)
* [ ] Abstract the parts responsible for ot out to another module. (There is already a pretty good separation here, should be fairly easy)