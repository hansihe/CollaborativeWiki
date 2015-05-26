export function pipe(src, dest) {
    src.on('data', data => dest.write(data));
}

export function dPipe(one, two) {
    pipe(one, two);
    pipe(two, one);
}

export function streamSubject(primus) {

    var streamClose = Rx.Observable.fromEvent(primus, 'close');
    var observable = Rx.Observable.fromEvent(primus, 'data').takeUntil(streamClose);
    
    var observer = new Rx.Observer.create(
        function(data) {
            primus.write(data);
        },
        function(error) {
            console.error("Error reached stream: ", error);
        },
        function() {

        }
    );

    return Rx.Subject.create(observer, observable);
}
