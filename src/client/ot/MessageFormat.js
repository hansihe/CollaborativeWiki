var t = require("tcomb");

export var Message = t.struct({
    type: t.list(t.Str, 'type'),
    msg: t.dict(t.Any, t.Any, 'msg'),
    id: t.maybe(t.Any)
});
