!function e(t, r, n) {
    function i(s, a) {
        if (!r[s]) {
            if (!t[s]) {
                var u = "function" == typeof require && require;
                if (!a && u)
                    return u(s, !0);
                if (o)
                    return o(s, !0);
                var l = new Error("Cannot find module '" + s + "'");
                throw l.code = "MODULE_NOT_FOUND",
                l
            }
            var c = r[s] = {
                exports: {}
            };
            t[s][0].call(c.exports, (function(e) {
                return i(t[s][1][e] || e)
            }
            ), c, c.exports, e, t, r, n)
        }
        return r[s].exports
    }
    for (var o = "function" == typeof require && require, s = 0; s < n.length; s++)
        i(n[s]);
    return i
}({
    1: [function(e, t, r) {
        (function(t) {
            (function() {
                "use strict";
                var r = s(e("loglevel"))
                  , n = e("@metamask/post-message-stream")
                  , i = e("@metamask/providers/dist/initializeInpageProvider")
                  , o = s(e("../../shared/modules/provider-injection"));
                function s(e) {
                    return e && e.__esModule ? e : {
                        default: e
                    }
                }
                let a;
                (()=>{
                    a = t.define;
                    try {
                        t.define = void 0
                    } catch (e) {
                        console.warn("MetaMask - global.define could not be deleted.")
                    }
                }
                )();
                if ((()=>{
                    try {
                        t.define = a
                    } catch (e) {
                        console.warn("MetaMask - global.define could not be overwritten.")
                    }
                }
                )(),
                r.default.setDefaultLevel("warn"),
                (0,
                o.default)()) {
                    const e = new n.WindowPostMessageStream({
                        name: "metamask-inpage",
                        target: "metamask-contentscript"
                    });
                    (0,
                    i.initializeProvider)({
                        connectionStream: e,
                        logger: r.default,
                        shouldShimWeb3: !0
                    })
                }
            }
            ).call(this)
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "../../shared/modules/provider-injection": 85,
        "@metamask/post-message-stream": 8,
        "@metamask/providers/dist/initializeInpageProvider": 30,
        loglevel: 66
    }],
    2: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        ;
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.ObjectMultiplex = void 0;
        const i = e("readable-stream")
          , o = n(e("end-of-stream"))
          , s = n(e("once"))
          , a = e("./Substream")
          , u = Symbol("IGNORE_SUBSTREAM");
        class l extends i.Duplex {
            constructor(e={}) {
                super(Object.assign(Object.assign({}, e), {
                    objectMode: !0
                })),
                this._substreams = {}
            }
            createStream(e) {
                if (this.destroyed)
                    throw new Error(`ObjectMultiplex - parent stream for name "${e}" already destroyed`);
                if (this._readableState.ended || this._writableState.ended)
                    throw new Error(`ObjectMultiplex - parent stream for name "${e}" already ended`);
                if (!e)
                    throw new Error("ObjectMultiplex - name must not be empty");
                if (this._substreams[e])
                    throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);
                const t = new a.Substream({
                    parent: this,
                    name: e
                });
                return this._substreams[e] = t,
                function(e, t) {
                    const r = s.default(t);
                    o.default(e, {
                        readable: !1
                    }, r),
                    o.default(e, {
                        writable: !1
                    }, r)
                }(this, (e=>t.destroy(e || void 0))),
                t
            }
            ignoreStream(e) {
                if (!e)
                    throw new Error("ObjectMultiplex - name must not be empty");
                if (this._substreams[e])
                    throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);
                this._substreams[e] = u
            }
            _read() {}
            _write(e, t, r) {
                const {name: n, data: i} = e;
                if (!n)
                    return console.warn(`ObjectMultiplex - malformed chunk without name "${e}"`),
                    r();
                const o = this._substreams[n];
                return o ? (o !== u && o.push(i),
                r()) : (console.warn(`ObjectMultiplex - orphaned data for stream "${n}"`),
                r())
            }
        }
        r.ObjectMultiplex = l
    }
    , {
        "./Substream": 3,
        "end-of-stream": 46,
        once: 67,
        "readable-stream": 81
    }],
    3: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.Substream = void 0;
        const n = e("readable-stream");
        class i extends n.Duplex {
            constructor({parent: e, name: t}) {
                super({
                    objectMode: !0
                }),
                this._parent = e,
                this._name = t
            }
            _read() {}
            _write(e, t, r) {
                this._parent.push({
                    name: this._name,
                    data: e
                }),
                r()
            }
        }
        r.Substream = i
    }
    , {
        "readable-stream": 81
    }],
    4: [function(e, t, r) {
        "use strict";
        const n = e("./ObjectMultiplex");
        t.exports = n.ObjectMultiplex
    }
    , {
        "./ObjectMultiplex": 2
    }],
    5: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.BasePostMessageStream = void 0;
        const n = e("readable-stream")
          , i = ()=>{}
          , o = "ACK";
        class s extends n.Duplex {
            constructor() {
                super({
                    objectMode: !0
                }),
                this._init = !1,
                this._haveSyn = !1
            }
            _handshake() {
                this._write("SYN", null, i),
                this.cork()
            }
            _onData(e) {
                if (this._init)
                    try {
                        this.push(e)
                    } catch (e) {
                        this.emit("error", e)
                    }
                else
                    "SYN" === e ? (this._haveSyn = !0,
                    this._write(o, null, i)) : e === o && (this._init = !0,
                    this._haveSyn || this._write(o, null, i),
                    this.uncork())
            }
            _read() {}
            _write(e, t, r) {
                this._postMessage(e),
                r()
            }
        }
        r.BasePostMessageStream = s
    }
    , {
        "readable-stream": 24
    }],
    6: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.WebWorkerParentPostMessageStream = void 0;
        const n = e("../BasePostMessageStream")
          , i = e("../utils");
        class o extends n.BasePostMessageStream {
            constructor({worker: e}) {
                super(),
                this._target = i.DEDICATED_WORKER_NAME,
                this._worker = e,
                this._worker.onmessage = this._onMessage.bind(this),
                this._handshake()
            }
            _postMessage(e) {
                this._worker.postMessage({
                    target: this._target,
                    data: e
                })
            }
            _onMessage(e) {
                const t = e.data;
                (0,
                i.isValidStreamMessage)(t) && this._onData(t.data)
            }
            _destroy() {
                this._worker.onmessage = null,
                this._worker = null
            }
        }
        r.WebWorkerParentPostMessageStream = o
    }
    , {
        "../BasePostMessageStream": 5,
        "../utils": 9
    }],
    7: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.WebWorkerPostMessageStream = void 0;
        const n = e("../BasePostMessageStream")
          , i = e("../utils");
        class o extends n.BasePostMessageStream {
            constructor() {
                if ("undefined" == typeof self || "undefined" == typeof WorkerGlobalScope || !(self instanceof WorkerGlobalScope))
                    throw new Error("WorkerGlobalScope not found. This class should only be instantiated in a WebWorker.");
                super(),
                this._name = i.DEDICATED_WORKER_NAME,
                self.onmessage = this._onMessage.bind(this),
                this._handshake()
            }
            _postMessage(e) {
                self.postMessage({
                    data: e
                })
            }
            _onMessage(e) {
                const t = e.data;
                (0,
                i.isValidStreamMessage)(t) && t.target === this._name && this._onData(t.data)
            }
            _destroy() {}
        }
        r.WebWorkerPostMessageStream = o
    }
    , {
        "../BasePostMessageStream": 5,
        "../utils": 9
    }],
    8: [function(e, t, r) {
        "use strict";
        var n = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
            void 0 === n && (n = r),
            Object.defineProperty(e, n, {
                enumerable: !0,
                get: function() {
                    return t[r]
                }
            })
        }
        : function(e, t, r, n) {
            void 0 === n && (n = r),
            e[n] = t[r]
        }
        )
          , i = this && this.__exportStar || function(e, t) {
            for (var r in e)
                "default" === r || Object.prototype.hasOwnProperty.call(t, r) || n(t, e, r)
        }
        ;
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        i(e("./window/WindowPostMessageStream"), r),
        i(e("./WebWorker/WebWorkerPostMessageStream"), r),
        i(e("./WebWorker/WebWorkerParentPostMessageStream"), r),
        i(e("./BasePostMessageStream"), r)
    }
    , {
        "./BasePostMessageStream": 5,
        "./WebWorker/WebWorkerParentPostMessageStream": 6,
        "./WebWorker/WebWorkerPostMessageStream": 7,
        "./window/WindowPostMessageStream": 10
    }],
    9: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.isValidStreamMessage = r.DEDICATED_WORKER_NAME = void 0;
        const n = e("@metamask/utils");
        r.DEDICATED_WORKER_NAME = "dedicatedWorker",
        r.isValidStreamMessage = function(e) {
            return (0,
            n.isObject)(e) && Boolean(e.data) && ("number" == typeof e.data || "object" == typeof e.data || "string" == typeof e.data)
        }
    }
    , {
        "@metamask/utils": 11
    }],
    10: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.WindowPostMessageStream = void 0;
        const n = e("../BasePostMessageStream")
          , i = e("../utils");
        class o extends n.BasePostMessageStream {
            constructor({name: e, target: t, targetOrigin: r=location.origin, targetWindow: n=window}) {
                if (super(),
                "undefined" == typeof window || "function" != typeof window.postMessage)
                    throw new Error("window.postMessage is not a function. This class should only be instantiated in a Window.");
                this._name = e,
                this._target = t,
                this._targetOrigin = r,
                this._targetWindow = n,
                this._onMessage = this._onMessage.bind(this),
                window.addEventListener("message", this._onMessage, !1),
                this._handshake()
            }
            _postMessage(e) {
                this._targetWindow.postMessage({
                    target: this._target,
                    data: e
                }, this._targetOrigin)
            }
            _onMessage(e) {
                const t = e.data;
                "*" !== this._targetOrigin && e.origin !== this._targetOrigin || e.source !== this._targetWindow || !(0,
                i.isValidStreamMessage)(t) || t.target !== this._name || this._onData(t.data)
            }
            _destroy() {
                window.removeEventListener("message", this._onMessage, !1)
            }
        }
        r.WindowPostMessageStream = o
    }
    , {
        "../BasePostMessageStream": 5,
        "../utils": 9
    }],
    11: [function(e, t, r) {
        "use strict";
        var n = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
            void 0 === n && (n = r),
            Object.defineProperty(e, n, {
                enumerable: !0,
                get: function() {
                    return t[r]
                }
            })
        }
        : function(e, t, r, n) {
            void 0 === n && (n = r),
            e[n] = t[r]
        }
        )
          , i = this && this.__exportStar || function(e, t) {
            for (var r in e)
                "default" === r || Object.prototype.hasOwnProperty.call(t, r) || n(t, e, r)
        }
        ;
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        i(e("./json"), r),
        i(e("./misc"), r),
        i(e("./time"), r)
    }
    , {
        "./json": 12,
        "./misc": 13,
        "./time": 14
    }],
    12: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        ;
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.validateJsonAndGetSize = r.getJsonRpcIdValidator = r.assertIsJsonRpcFailure = r.isJsonRpcFailure = r.assertIsJsonRpcSuccess = r.isJsonRpcSuccess = r.assertIsJsonRpcRequest = r.isJsonRpcRequest = r.assertIsJsonRpcNotification = r.isJsonRpcNotification = r.jsonrpc2 = r.isValidJson = void 0;
        const i = n(e("fast-deep-equal"))
          , o = e("./misc");
        function s(e) {
            return !o.hasProperty(e, "id")
        }
        function a(e) {
            return o.hasProperty(e, "id")
        }
        function u(e) {
            return o.hasProperty(e, "result")
        }
        function l(e) {
            return o.hasProperty(e, "error")
        }
        r.isValidJson = function(e) {
            try {
                return i.default(e, JSON.parse(JSON.stringify(e)))
            } catch (e) {
                return !1
            }
        }
        ,
        r.jsonrpc2 = "2.0",
        r.isJsonRpcNotification = s,
        r.assertIsJsonRpcNotification = function(e) {
            if (!s(e))
                throw new Error("Not a JSON-RPC notification.")
        }
        ,
        r.isJsonRpcRequest = a,
        r.assertIsJsonRpcRequest = function(e) {
            if (!a(e))
                throw new Error("Not a JSON-RPC request.")
        }
        ,
        r.isJsonRpcSuccess = u,
        r.assertIsJsonRpcSuccess = function(e) {
            if (!u(e))
                throw new Error("Not a successful JSON-RPC response.")
        }
        ,
        r.isJsonRpcFailure = l,
        r.assertIsJsonRpcFailure = function(e) {
            if (!l(e))
                throw new Error("Not a failed JSON-RPC response.")
        }
        ,
        r.getJsonRpcIdValidator = function(e) {
            const {permitEmptyString: t, permitFractions: r, permitNull: n} = Object.assign({
                permitEmptyString: !0,
                permitFractions: !1,
                permitNull: !0
            }, e);
            return e=>Boolean("number" == typeof e && (r || Number.isInteger(e)) || "string" == typeof e && (t || e.length > 0) || n && null === e)
        }
        ,
        r.validateJsonAndGetSize = function(e, t=!1) {
            const r = new Set;
            return function e(t, n) {
                if (void 0 === t)
                    return [!0, 0];
                if (null === t)
                    return [!0, n ? 0 : o.JsonSize.Null];
                const i = typeof t;
                try {
                    if ("function" === i)
                        return [!1, 0];
                    if ("string" === i || t instanceof String)
                        return [!0, n ? 0 : o.calculateStringSize(t) + 2 * o.JsonSize.Quote];
                    if ("boolean" === i || t instanceof Boolean)
                        return n ? [!0, 0] : [!0, 1 == t ? o.JsonSize.True : o.JsonSize.False];
                    if ("number" === i || t instanceof Number)
                        return n ? [!0, 0] : [!0, o.calculateNumberSize(t)];
                    if (t instanceof Date)
                        return n ? [!0, 0] : [!0, isNaN(t.getDate()) ? o.JsonSize.Null : o.JsonSize.Date + 2 * o.JsonSize.Quote]
                } catch (e) {
                    return [!1, 0]
                }
                if (!o.isPlainObject(t) && !Array.isArray(t))
                    return [!1, 0];
                if (r.has(t))
                    return [!1, 0];
                r.add(t);
                try {
                    return [!0, Object.entries(t).reduce(((i,[s,a],u,l)=>{
                        let[c,d] = e(a, n);
                        if (!c)
                            throw new Error("JSON validation did not pass. Validation process stopped.");
                        if (r.delete(t),
                        n)
                            return 0;
                        if (0 === d && Array.isArray(t) && (d = o.JsonSize.Null),
                        0 === d)
                            return i;
                        return i + (Array.isArray(t) ? 0 : s.length + o.JsonSize.Comma + 2 * o.JsonSize.Colon) + d + (u < l.length - 1 ? o.JsonSize.Comma : 0)
                    }
                    ), n ? 0 : 2 * o.JsonSize.Wrapper)]
                } catch (e) {
                    return [!1, 0]
                }
            }(e, t)
        }
    }
    , {
        "./misc": 13,
        "fast-deep-equal": 52
    }],
    13: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.calculateNumberSize = r.calculateStringSize = r.isASCII = r.isPlainObject = r.ESCAPE_CHARACTERS_REGEXP = r.JsonSize = r.hasProperty = r.isObject = r.isNullOrUndefined = r.isNonEmptyArray = void 0,
        r.isNonEmptyArray = function(e) {
            return Array.isArray(e) && e.length > 0
        }
        ,
        r.isNullOrUndefined = function(e) {
            return null == e
        }
        ,
        r.isObject = function(e) {
            return Boolean(e) && "object" == typeof e && !Array.isArray(e)
        }
        ;
        function n(e) {
            return e.charCodeAt(0) <= 127
        }
        r.hasProperty = (e,t)=>Object.hasOwnProperty.call(e, t),
        function(e) {
            e[e.Null = 4] = "Null",
            e[e.Comma = 1] = "Comma",
            e[e.Wrapper = 1] = "Wrapper",
            e[e.True = 4] = "True",
            e[e.False = 5] = "False",
            e[e.Quote = 1] = "Quote",
            e[e.Colon = 1] = "Colon",
            e[e.Date = 24] = "Date"
        }(r.JsonSize || (r.JsonSize = {})),
        r.ESCAPE_CHARACTERS_REGEXP = /"|\\|\n|\r|\t/gu,
        r.isPlainObject = function(e) {
            if ("object" != typeof e || null === e)
                return !1;
            try {
                let t = e;
                for (; null !== Object.getPrototypeOf(t); )
                    t = Object.getPrototypeOf(t);
                return Object.getPrototypeOf(e) === t
            } catch (e) {
                return !1
            }
        }
        ,
        r.isASCII = n,
        r.calculateStringSize = function(e) {
            var t;
            return e.split("").reduce(((e,t)=>n(t) ? e + 1 : e + 2), 0) + (null !== (t = e.match(r.ESCAPE_CHARACTERS_REGEXP)) && void 0 !== t ? t : []).length
        }
        ,
        r.calculateNumberSize = function(e) {
            return e.toString().length
        }
    }
    , {}],
    14: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }),
        r.timeSince = r.inMilliseconds = r.Duration = void 0,
        function(e) {
            e[e.Millisecond = 1] = "Millisecond",
            e[e.Second = 1e3] = "Second",
            e[e.Minute = 6e4] = "Minute",
            e[e.Hour = 36e5] = "Hour",
            e[e.Day = 864e5] = "Day",
            e[e.Week = 6048e5] = "Week",
            e[e.Year = 31536e6] = "Year"
        }(r.Duration || (r.Duration = {}));
        const n = (e,t)=>{
            if (!(e=>Number.isInteger(e) && e >= 0)(e))
                throw new Error(`"${t}" must be a non-negative integer. Received: "${e}".`)
        }
        ;
        r.inMilliseconds = function(e, t) {
            return n(e, "count"),
            e * t
        }
        ,
        r.timeSince = function(e) {
            return n(e, "timestamp"),
            Date.now() - e
        }
    }
    , {}],
    15: [function(e, t, r) {
        (function(e) {
            (function() {
                "use strict";
                !e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = function(t, r, n, i) {
                    if ("function" != typeof t)
                        throw new TypeError('"callback" argument must be a function');
                    var o, s, a = arguments.length;
                    switch (a) {
                    case 0:
                    case 1:
                        return e.nextTick(t);
                    case 2:
                        return e.nextTick((function() {
                            t.call(null, r)
                        }
                        ));
                    case 3:
                        return e.nextTick((function() {
                            t.call(null, r, n)
                        }
                        ));
                    case 4:
                        return e.nextTick((function() {
                            t.call(null, r, n, i)
                        }
                        ));
                    default:
                        for (o = new Array(a - 1),
                        s = 0; s < o.length; )
                            o[s++] = arguments[s];
                        return e.nextTick((function() {
                            t.apply(null, o)
                        }
                        ))
                    }
                }
                : t.exports = e.nextTick
            }
            ).call(this)
        }
        ).call(this, e("_process"))
    }
    , {
        _process: 69
    }],
    16: [function(e, t, r) {
        "use strict";
        var n = e("process-nextick-args")
          , i = Object.keys || function(e) {
            var t = [];
            for (var r in e)
                t.push(r);
            return t
        }
        ;
        t.exports = d;
        var o = e("core-util-is");
        o.inherits = e("inherits");
        var s = e("./_stream_readable")
          , a = e("./_stream_writable");
        o.inherits(d, s);
        for (var u = i(a.prototype), l = 0; l < u.length; l++) {
            var c = u[l];
            d.prototype[c] || (d.prototype[c] = a.prototype[c])
        }
        function d(e) {
            if (!(this instanceof d))
                return new d(e);
            s.call(this, e),
            a.call(this, e),
            e && !1 === e.readable && (this.readable = !1),
            e && !1 === e.writable && (this.writable = !1),
            this.allowHalfOpen = !0,
            e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1),
            this.once("end", f)
        }
        function f() {
            this.allowHalfOpen || this._writableState.ended || n(h, this)
        }
        function h(e) {
            e.end()
        }
        Object.defineProperty(d.prototype, "destroyed", {
            get: function() {
                return void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed && this._writableState.destroyed)
            },
            set: function(e) {
                void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed = e,
                this._writableState.destroyed = e)
            }
        }),
        d.prototype._destroy = function(e, t) {
            this.push(null),
            this.end(),
            n(t, e)
        }
    }
    , {
        "./_stream_readable": 18,
        "./_stream_writable": 20,
        "core-util-is": 45,
        inherits: 55,
        "process-nextick-args": 15
    }],
    17: [function(e, t, r) {
        "use strict";
        t.exports = o;
        var n = e("./_stream_transform")
          , i = e("core-util-is");
        function o(e) {
            if (!(this instanceof o))
                return new o(e);
            n.call(this, e)
        }
        i.inherits = e("inherits"),
        i.inherits(o, n),
        o.prototype._transform = function(e, t, r) {
            r(null, e)
        }
    }
    , {
        "./_stream_transform": 19,
        "core-util-is": 45,
        inherits: 55
    }],
    18: [function(e, t, r) {
        (function(r, n) {
            (function() {
                "use strict";
                var i = e("process-nextick-args");
                t.exports = w;
                var o, s = e("isarray");
                w.ReadableState = b;
                e("events").EventEmitter;
                var a = function(e, t) {
                    return e.listeners(t).length
                }
                  , u = e("./internal/streams/stream")
                  , l = e("safe-buffer").Buffer
                  , c = n.Uint8Array || function() {}
                ;
                var d = e("core-util-is");
                d.inherits = e("inherits");
                var f = e("util")
                  , h = void 0;
                h = f && f.debuglog ? f.debuglog("stream") : function() {}
                ;
                var p, g = e("./internal/streams/BufferList"), m = e("./internal/streams/destroy");
                d.inherits(w, u);
                var y = ["error", "close", "destroy", "pause", "resume"];
                function b(t, r) {
                    o = o || e("./_stream_duplex"),
                    t = t || {},
                    this.objectMode = !!t.objectMode,
                    r instanceof o && (this.objectMode = this.objectMode || !!t.readableObjectMode);
                    var n = t.highWaterMark
                      , i = this.objectMode ? 16 : 16384;
                    this.highWaterMark = n || 0 === n ? n : i,
                    this.highWaterMark = Math.floor(this.highWaterMark),
                    this.buffer = new g,
                    this.length = 0,
                    this.pipes = null,
                    this.pipesCount = 0,
                    this.flowing = null,
                    this.ended = !1,
                    this.endEmitted = !1,
                    this.reading = !1,
                    this.sync = !0,
                    this.needReadable = !1,
                    this.emittedReadable = !1,
                    this.readableListening = !1,
                    this.resumeScheduled = !1,
                    this.destroyed = !1,
                    this.defaultEncoding = t.defaultEncoding || "utf8",
                    this.awaitDrain = 0,
                    this.readingMore = !1,
                    this.decoder = null,
                    this.encoding = null,
                    t.encoding && (p || (p = e("string_decoder/").StringDecoder),
                    this.decoder = new p(t.encoding),
                    this.encoding = t.encoding)
                }
                function w(t) {
                    if (o = o || e("./_stream_duplex"),
                    !(this instanceof w))
                        return new w(t);
                    this._readableState = new b(t,this),
                    this.readable = !0,
                    t && ("function" == typeof t.read && (this._read = t.read),
                    "function" == typeof t.destroy && (this._destroy = t.destroy)),
                    u.call(this)
                }
                function v(e, t, r, n, i) {
                    var o, s = e._readableState;
                    null === t ? (s.reading = !1,
                    function(e, t) {
                        if (t.ended)
                            return;
                        if (t.decoder) {
                            var r = t.decoder.end();
                            r && r.length && (t.buffer.push(r),
                            t.length += t.objectMode ? 1 : r.length)
                        }
                        t.ended = !0,
                        M(e)
                    }(e, s)) : (i || (o = function(e, t) {
                        var r;
                        n = t,
                        l.isBuffer(n) || n instanceof c || "string" == typeof t || void 0 === t || e.objectMode || (r = new TypeError("Invalid non-string/buffer chunk"));
                        var n;
                        return r
                    }(s, t)),
                    o ? e.emit("error", o) : s.objectMode || t && t.length > 0 ? ("string" == typeof t || s.objectMode || Object.getPrototypeOf(t) === l.prototype || (t = function(e) {
                        return l.from(e)
                    }(t)),
                    n ? s.endEmitted ? e.emit("error", new Error("stream.unshift() after end event")) : _(e, s, t, !0) : s.ended ? e.emit("error", new Error("stream.push() after EOF")) : (s.reading = !1,
                    s.decoder && !r ? (t = s.decoder.write(t),
                    s.objectMode || 0 !== t.length ? _(e, s, t, !1) : R(e, s)) : _(e, s, t, !1))) : n || (s.reading = !1));
                    return function(e) {
                        return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                    }(s)
                }
                function _(e, t, r, n) {
                    t.flowing && 0 === t.length && !t.sync ? (e.emit("data", r),
                    e.read(0)) : (t.length += t.objectMode ? 1 : r.length,
                    n ? t.buffer.unshift(r) : t.buffer.push(r),
                    t.needReadable && M(e)),
                    R(e, t)
                }
                Object.defineProperty(w.prototype, "destroyed", {
                    get: function() {
                        return void 0 !== this._readableState && this._readableState.destroyed
                    },
                    set: function(e) {
                        this._readableState && (this._readableState.destroyed = e)
                    }
                }),
                w.prototype.destroy = m.destroy,
                w.prototype._undestroy = m.undestroy,
                w.prototype._destroy = function(e, t) {
                    this.push(null),
                    t(e)
                }
                ,
                w.prototype.push = function(e, t) {
                    var r, n = this._readableState;
                    return n.objectMode ? r = !0 : "string" == typeof e && ((t = t || n.defaultEncoding) !== n.encoding && (e = l.from(e, t),
                    t = ""),
                    r = !0),
                    v(this, e, t, !1, r)
                }
                ,
                w.prototype.unshift = function(e) {
                    return v(this, e, null, !0, !1)
                }
                ,
                w.prototype.isPaused = function() {
                    return !1 === this._readableState.flowing
                }
                ,
                w.prototype.setEncoding = function(t) {
                    return p || (p = e("string_decoder/").StringDecoder),
                    this._readableState.decoder = new p(t),
                    this._readableState.encoding = t,
                    this
                }
                ;
                var S = 8388608;
                function E(e, t) {
                    return e <= 0 || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e != e ? t.flowing && t.length ? t.buffer.head.data.length : t.length : (e > t.highWaterMark && (t.highWaterMark = function(e) {
                        return e >= S ? e = S : (e--,
                        e |= e >>> 1,
                        e |= e >>> 2,
                        e |= e >>> 4,
                        e |= e >>> 8,
                        e |= e >>> 16,
                        e++),
                        e
                    }(e)),
                    e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0,
                    0))
                }
                function M(e) {
                    var t = e._readableState;
                    t.needReadable = !1,
                    t.emittedReadable || (h("emitReadable", t.flowing),
                    t.emittedReadable = !0,
                    t.sync ? i(k, e) : k(e))
                }
                function k(e) {
                    h("emit readable"),
                    e.emit("readable"),
                    P(e)
                }
                function R(e, t) {
                    t.readingMore || (t.readingMore = !0,
                    i(x, e, t))
                }
                function x(e, t) {
                    for (var r = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (h("maybeReadMore read 0"),
                    e.read(0),
                    r !== t.length); )
                        r = t.length;
                    t.readingMore = !1
                }
                function j(e) {
                    h("readable nexttick read 0"),
                    e.read(0)
                }
                function C(e, t) {
                    t.reading || (h("resume read 0"),
                    e.read(0)),
                    t.resumeScheduled = !1,
                    t.awaitDrain = 0,
                    e.emit("resume"),
                    P(e),
                    t.flowing && !t.reading && e.read(0)
                }
                function P(e) {
                    var t = e._readableState;
                    for (h("flow", t.flowing); t.flowing && null !== e.read(); )
                        ;
                }
                function O(e, t) {
                    return 0 === t.length ? null : (t.objectMode ? r = t.buffer.shift() : !e || e >= t.length ? (r = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length),
                    t.buffer.clear()) : r = function(e, t, r) {
                        var n;
                        e < t.head.data.length ? (n = t.head.data.slice(0, e),
                        t.head.data = t.head.data.slice(e)) : n = e === t.head.data.length ? t.shift() : r ? function(e, t) {
                            var r = t.head
                              , n = 1
                              , i = r.data;
                            e -= i.length;
                            for (; r = r.next; ) {
                                var o = r.data
                                  , s = e > o.length ? o.length : e;
                                if (s === o.length ? i += o : i += o.slice(0, e),
                                0 === (e -= s)) {
                                    s === o.length ? (++n,
                                    r.next ? t.head = r.next : t.head = t.tail = null) : (t.head = r,
                                    r.data = o.slice(s));
                                    break
                                }
                                ++n
                            }
                            return t.length -= n,
                            i
                        }(e, t) : function(e, t) {
                            var r = l.allocUnsafe(e)
                              , n = t.head
                              , i = 1;
                            n.data.copy(r),
                            e -= n.data.length;
                            for (; n = n.next; ) {
                                var o = n.data
                                  , s = e > o.length ? o.length : e;
                                if (o.copy(r, r.length - e, 0, s),
                                0 === (e -= s)) {
                                    s === o.length ? (++i,
                                    n.next ? t.head = n.next : t.head = t.tail = null) : (t.head = n,
                                    n.data = o.slice(s));
                                    break
                                }
                                ++i
                            }
                            return t.length -= i,
                            r
                        }(e, t);
                        return n
                    }(e, t.buffer, t.decoder),
                    r);
                    var r
                }
                function A(e) {
                    var t = e._readableState;
                    if (t.length > 0)
                        throw new Error('"endReadable()" called on non-empty stream');
                    t.endEmitted || (t.ended = !0,
                    i(T, t, e))
                }
                function T(e, t) {
                    e.endEmitted || 0 !== e.length || (e.endEmitted = !0,
                    t.readable = !1,
                    t.emit("end"))
                }
                function N(e, t) {
                    for (var r = 0, n = e.length; r < n; r++)
                        if (e[r] === t)
                            return r;
                    return -1
                }
                w.prototype.read = function(e) {
                    h("read", e),
                    e = parseInt(e, 10);
                    var t = this._readableState
                      , r = e;
                    if (0 !== e && (t.emittedReadable = !1),
                    0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended))
                        return h("read: emitReadable", t.length, t.ended),
                        0 === t.length && t.ended ? A(this) : M(this),
                        null;
                    if (0 === (e = E(e, t)) && t.ended)
                        return 0 === t.length && A(this),
                        null;
                    var n, i = t.needReadable;
                    return h("need readable", i),
                    (0 === t.length || t.length - e < t.highWaterMark) && h("length less than watermark", i = !0),
                    t.ended || t.reading ? h("reading or ended", i = !1) : i && (h("do read"),
                    t.reading = !0,
                    t.sync = !0,
                    0 === t.length && (t.needReadable = !0),
                    this._read(t.highWaterMark),
                    t.sync = !1,
                    t.reading || (e = E(r, t))),
                    null === (n = e > 0 ? O(e, t) : null) ? (t.needReadable = !0,
                    e = 0) : t.length -= e,
                    0 === t.length && (t.ended || (t.needReadable = !0),
                    r !== e && t.ended && A(this)),
                    null !== n && this.emit("data", n),
                    n
                }
                ,
                w.prototype._read = function(e) {
                    this.emit("error", new Error("_read() is not implemented"))
                }
                ,
                w.prototype.pipe = function(e, t) {
                    var n = this
                      , o = this._readableState;
                    switch (o.pipesCount) {
                    case 0:
                        o.pipes = e;
                        break;
                    case 1:
                        o.pipes = [o.pipes, e];
                        break;
                    default:
                        o.pipes.push(e)
                    }
                    o.pipesCount += 1,
                    h("pipe count=%d opts=%j", o.pipesCount, t);
                    var u = (!t || !1 !== t.end) && e !== r.stdout && e !== r.stderr ? c : w;
                    function l(t, r) {
                        h("onunpipe"),
                        t === n && r && !1 === r.hasUnpiped && (r.hasUnpiped = !0,
                        h("cleanup"),
                        e.removeListener("close", y),
                        e.removeListener("finish", b),
                        e.removeListener("drain", d),
                        e.removeListener("error", m),
                        e.removeListener("unpipe", l),
                        n.removeListener("end", c),
                        n.removeListener("end", w),
                        n.removeListener("data", g),
                        f = !0,
                        !o.awaitDrain || e._writableState && !e._writableState.needDrain || d())
                    }
                    function c() {
                        h("onend"),
                        e.end()
                    }
                    o.endEmitted ? i(u) : n.once("end", u),
                    e.on("unpipe", l);
                    var d = function(e) {
                        return function() {
                            var t = e._readableState;
                            h("pipeOnDrain", t.awaitDrain),
                            t.awaitDrain && t.awaitDrain--,
                            0 === t.awaitDrain && a(e, "data") && (t.flowing = !0,
                            P(e))
                        }
                    }(n);
                    e.on("drain", d);
                    var f = !1;
                    var p = !1;
                    function g(t) {
                        h("ondata"),
                        p = !1,
                        !1 !== e.write(t) || p || ((1 === o.pipesCount && o.pipes === e || o.pipesCount > 1 && -1 !== N(o.pipes, e)) && !f && (h("false write response, pause", n._readableState.awaitDrain),
                        n._readableState.awaitDrain++,
                        p = !0),
                        n.pause())
                    }
                    function m(t) {
                        h("onerror", t),
                        w(),
                        e.removeListener("error", m),
                        0 === a(e, "error") && e.emit("error", t)
                    }
                    function y() {
                        e.removeListener("finish", b),
                        w()
                    }
                    function b() {
                        h("onfinish"),
                        e.removeListener("close", y),
                        w()
                    }
                    function w() {
                        h("unpipe"),
                        n.unpipe(e)
                    }
                    return n.on("data", g),
                    function(e, t, r) {
                        if ("function" == typeof e.prependListener)
                            return e.prependListener(t, r);
                        e._events && e._events[t] ? s(e._events[t]) ? e._events[t].unshift(r) : e._events[t] = [r, e._events[t]] : e.on(t, r)
                    }(e, "error", m),
                    e.once("close", y),
                    e.once("finish", b),
                    e.emit("pipe", n),
                    o.flowing || (h("pipe resume"),
                    n.resume()),
                    e
                }
                ,
                w.prototype.unpipe = function(e) {
                    var t = this._readableState
                      , r = {
                        hasUnpiped: !1
                    };
                    if (0 === t.pipesCount)
                        return this;
                    if (1 === t.pipesCount)
                        return e && e !== t.pipes || (e || (e = t.pipes),
                        t.pipes = null,
                        t.pipesCount = 0,
                        t.flowing = !1,
                        e && e.emit("unpipe", this, r)),
                        this;
                    if (!e) {
                        var n = t.pipes
                          , i = t.pipesCount;
                        t.pipes = null,
                        t.pipesCount = 0,
                        t.flowing = !1;
                        for (var o = 0; o < i; o++)
                            n[o].emit("unpipe", this, r);
                        return this
                    }
                    var s = N(t.pipes, e);
                    return -1 === s || (t.pipes.splice(s, 1),
                    t.pipesCount -= 1,
                    1 === t.pipesCount && (t.pipes = t.pipes[0]),
                    e.emit("unpipe", this, r)),
                    this
                }
                ,
                w.prototype.on = function(e, t) {
                    var r = u.prototype.on.call(this, e, t);
                    if ("data" === e)
                        !1 !== this._readableState.flowing && this.resume();
                    else if ("readable" === e) {
                        var n = this._readableState;
                        n.endEmitted || n.readableListening || (n.readableListening = n.needReadable = !0,
                        n.emittedReadable = !1,
                        n.reading ? n.length && M(this) : i(j, this))
                    }
                    return r
                }
                ,
                w.prototype.addListener = w.prototype.on,
                w.prototype.resume = function() {
                    var e = this._readableState;
                    return e.flowing || (h("resume"),
                    e.flowing = !0,
                    function(e, t) {
                        t.resumeScheduled || (t.resumeScheduled = !0,
                        i(C, e, t))
                    }(this, e)),
                    this
                }
                ,
                w.prototype.pause = function() {
                    return h("call pause flowing=%j", this._readableState.flowing),
                    !1 !== this._readableState.flowing && (h("pause"),
                    this._readableState.flowing = !1,
                    this.emit("pause")),
                    this
                }
                ,
                w.prototype.wrap = function(e) {
                    var t = this._readableState
                      , r = !1
                      , n = this;
                    for (var i in e.on("end", (function() {
                        if (h("wrapped end"),
                        t.decoder && !t.ended) {
                            var e = t.decoder.end();
                            e && e.length && n.push(e)
                        }
                        n.push(null)
                    }
                    )),
                    e.on("data", (function(i) {
                        (h("wrapped data"),
                        t.decoder && (i = t.decoder.write(i)),
                        t.objectMode && null == i) || (t.objectMode || i && i.length) && (n.push(i) || (r = !0,
                        e.pause()))
                    }
                    )),
                    e)
                        void 0 === this[i] && "function" == typeof e[i] && (this[i] = function(t) {
                            return function() {
                                return e[t].apply(e, arguments)
                            }
                        }(i));
                    for (var o = 0; o < y.length; o++)
                        e.on(y[o], n.emit.bind(n, y[o]));
                    return n._read = function(t) {
                        h("wrapped _read", t),
                        r && (r = !1,
                        e.resume())
                    }
                    ,
                    n
                }
                ,
                w._fromList = O
            }
            ).call(this)
        }
        ).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./_stream_duplex": 16,
        "./internal/streams/BufferList": 21,
        "./internal/streams/destroy": 22,
        "./internal/streams/stream": 23,
        _process: 69,
        "core-util-is": 45,
        events: 44,
        inherits: 55,
        isarray: 58,
        "process-nextick-args": 15,
        "safe-buffer": 25,
        "string_decoder/": 26,
        util: 42
    }],
    19: [function(e, t, r) {
        "use strict";
        t.exports = s;
        var n = e("./_stream_duplex")
          , i = e("core-util-is");
        function o(e) {
            this.afterTransform = function(t, r) {
                return function(e, t, r) {
                    var n = e._transformState;
                    n.transforming = !1;
                    var i = n.writecb;
                    if (!i)
                        return e.emit("error", new Error("write callback called multiple times"));
                    n.writechunk = null,
                    n.writecb = null,
                    null != r && e.push(r);
                    i(t);
                    var o = e._readableState;
                    o.reading = !1,
                    (o.needReadable || o.length < o.highWaterMark) && e._read(o.highWaterMark)
                }(e, t, r)
            }
            ,
            this.needTransform = !1,
            this.transforming = !1,
            this.writecb = null,
            this.writechunk = null,
            this.writeencoding = null
        }
        function s(e) {
            if (!(this instanceof s))
                return new s(e);
            n.call(this, e),
            this._transformState = new o(this);
            var t = this;
            this._readableState.needReadable = !0,
            this._readableState.sync = !1,
            e && ("function" == typeof e.transform && (this._transform = e.transform),
            "function" == typeof e.flush && (this._flush = e.flush)),
            this.once("prefinish", (function() {
                "function" == typeof this._flush ? this._flush((function(e, r) {
                    a(t, e, r)
                }
                )) : a(t)
            }
            ))
        }
        function a(e, t, r) {
            if (t)
                return e.emit("error", t);
            null != r && e.push(r);
            var n = e._writableState
              , i = e._transformState;
            if (n.length)
                throw new Error("Calling transform done when ws.length != 0");
            if (i.transforming)
                throw new Error("Calling transform done when still transforming");
            return e.push(null)
        }
        i.inherits = e("inherits"),
        i.inherits(s, n),
        s.prototype.push = function(e, t) {
            return this._transformState.needTransform = !1,
            n.prototype.push.call(this, e, t)
        }
        ,
        s.prototype._transform = function(e, t, r) {
            throw new Error("_transform() is not implemented")
        }
        ,
        s.prototype._write = function(e, t, r) {
            var n = this._transformState;
            if (n.writecb = r,
            n.writechunk = e,
            n.writeencoding = t,
            !n.transforming) {
                var i = this._readableState;
                (n.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
            }
        }
        ,
        s.prototype._read = function(e) {
            var t = this._transformState;
            null !== t.writechunk && t.writecb && !t.transforming ? (t.transforming = !0,
            this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0
        }
        ,
        s.prototype._destroy = function(e, t) {
            var r = this;
            n.prototype._destroy.call(this, e, (function(e) {
                t(e),
                r.emit("close")
            }
            ))
        }
    }
    , {
        "./_stream_duplex": 16,
        "core-util-is": 45,
        inherits: 55
    }],
    20: [function(e, t, r) {
        (function(r, n, i) {
            (function() {
                "use strict";
                var o = e("process-nextick-args");
                function s(e) {
                    var t = this;
                    this.next = null,
                    this.entry = null,
                    this.finish = function() {
                        !function(e, t, r) {
                            var n = e.entry;
                            e.entry = null;
                            for (; n; ) {
                                var i = n.callback;
                                t.pendingcb--,
                                i(r),
                                n = n.next
                            }
                            t.corkedRequestsFree ? t.corkedRequestsFree.next = e : t.corkedRequestsFree = e
                        }(t, e)
                    }
                }
                t.exports = b;
                var a, u = !r.browser && ["v0.10", "v0.9."].indexOf(r.version.slice(0, 5)) > -1 ? i : o;
                b.WritableState = y;
                var l = e("core-util-is");
                l.inherits = e("inherits");
                var c = {
                    deprecate: e("util-deprecate")
                }
                  , d = e("./internal/streams/stream")
                  , f = e("safe-buffer").Buffer
                  , h = n.Uint8Array || function() {}
                ;
                var p, g = e("./internal/streams/destroy");
                function m() {}
                function y(t, r) {
                    a = a || e("./_stream_duplex"),
                    t = t || {},
                    this.objectMode = !!t.objectMode,
                    r instanceof a && (this.objectMode = this.objectMode || !!t.writableObjectMode);
                    var n = t.highWaterMark
                      , i = this.objectMode ? 16 : 16384;
                    this.highWaterMark = n || 0 === n ? n : i,
                    this.highWaterMark = Math.floor(this.highWaterMark),
                    this.finalCalled = !1,
                    this.needDrain = !1,
                    this.ending = !1,
                    this.ended = !1,
                    this.finished = !1,
                    this.destroyed = !1;
                    var l = !1 === t.decodeStrings;
                    this.decodeStrings = !l,
                    this.defaultEncoding = t.defaultEncoding || "utf8",
                    this.length = 0,
                    this.writing = !1,
                    this.corked = 0,
                    this.sync = !0,
                    this.bufferProcessing = !1,
                    this.onwrite = function(e) {
                        !function(e, t) {
                            var r = e._writableState
                              , n = r.sync
                              , i = r.writecb;
                            if (function(e) {
                                e.writing = !1,
                                e.writecb = null,
                                e.length -= e.writelen,
                                e.writelen = 0
                            }(r),
                            t)
                                !function(e, t, r, n, i) {
                                    --t.pendingcb,
                                    r ? (o(i, n),
                                    o(M, e, t),
                                    e._writableState.errorEmitted = !0,
                                    e.emit("error", n)) : (i(n),
                                    e._writableState.errorEmitted = !0,
                                    e.emit("error", n),
                                    M(e, t))
                                }(e, r, n, t, i);
                            else {
                                var s = S(r);
                                s || r.corked || r.bufferProcessing || !r.bufferedRequest || _(e, r),
                                n ? u(v, e, r, s, i) : v(e, r, s, i)
                            }
                        }(r, e)
                    }
                    ,
                    this.writecb = null,
                    this.writelen = 0,
                    this.bufferedRequest = null,
                    this.lastBufferedRequest = null,
                    this.pendingcb = 0,
                    this.prefinished = !1,
                    this.errorEmitted = !1,
                    this.bufferedRequestCount = 0,
                    this.corkedRequestsFree = new s(this)
                }
                function b(t) {
                    if (a = a || e("./_stream_duplex"),
                    !(p.call(b, this) || this instanceof a))
                        return new b(t);
                    this._writableState = new y(t,this),
                    this.writable = !0,
                    t && ("function" == typeof t.write && (this._write = t.write),
                    "function" == typeof t.writev && (this._writev = t.writev),
                    "function" == typeof t.destroy && (this._destroy = t.destroy),
                    "function" == typeof t.final && (this._final = t.final)),
                    d.call(this)
                }
                function w(e, t, r, n, i, o, s) {
                    t.writelen = n,
                    t.writecb = s,
                    t.writing = !0,
                    t.sync = !0,
                    r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
                    t.sync = !1
                }
                function v(e, t, r, n) {
                    r || function(e, t) {
                        0 === t.length && t.needDrain && (t.needDrain = !1,
                        e.emit("drain"))
                    }(e, t),
                    t.pendingcb--,
                    n(),
                    M(e, t)
                }
                function _(e, t) {
                    t.bufferProcessing = !0;
                    var r = t.bufferedRequest;
                    if (e._writev && r && r.next) {
                        var n = t.bufferedRequestCount
                          , i = new Array(n)
                          , o = t.corkedRequestsFree;
                        o.entry = r;
                        for (var a = 0, u = !0; r; )
                            i[a] = r,
                            r.isBuf || (u = !1),
                            r = r.next,
                            a += 1;
                        i.allBuffers = u,
                        w(e, t, !0, t.length, i, "", o.finish),
                        t.pendingcb++,
                        t.lastBufferedRequest = null,
                        o.next ? (t.corkedRequestsFree = o.next,
                        o.next = null) : t.corkedRequestsFree = new s(t)
                    } else {
                        for (; r; ) {
                            var l = r.chunk
                              , c = r.encoding
                              , d = r.callback;
                            if (w(e, t, !1, t.objectMode ? 1 : l.length, l, c, d),
                            r = r.next,
                            t.writing)
                                break
                        }
                        null === r && (t.lastBufferedRequest = null)
                    }
                    t.bufferedRequestCount = 0,
                    t.bufferedRequest = r,
                    t.bufferProcessing = !1
                }
                function S(e) {
                    return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
                }
                function E(e, t) {
                    e._final((function(r) {
                        t.pendingcb--,
                        r && e.emit("error", r),
                        t.prefinished = !0,
                        e.emit("prefinish"),
                        M(e, t)
                    }
                    ))
                }
                function M(e, t) {
                    var r = S(t);
                    return r && (!function(e, t) {
                        t.prefinished || t.finalCalled || ("function" == typeof e._final ? (t.pendingcb++,
                        t.finalCalled = !0,
                        o(E, e, t)) : (t.prefinished = !0,
                        e.emit("prefinish")))
                    }(e, t),
                    0 === t.pendingcb && (t.finished = !0,
                    e.emit("finish"))),
                    r
                }
                l.inherits(b, d),
                y.prototype.getBuffer = function() {
                    for (var e = this.bufferedRequest, t = []; e; )
                        t.push(e),
                        e = e.next;
                    return t
                }
                ,
                function() {
                    try {
                        Object.defineProperty(y.prototype, "buffer", {
                            get: c.deprecate((function() {
                                return this.getBuffer()
                            }
                            ), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                        })
                    } catch (e) {}
                }(),
                "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (p = Function.prototype[Symbol.hasInstance],
                Object.defineProperty(b, Symbol.hasInstance, {
                    value: function(e) {
                        return !!p.call(this, e) || e && e._writableState instanceof y
                    }
                })) : p = function(e) {
                    return e instanceof this
                }
                ,
                b.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"))
                }
                ,
                b.prototype.write = function(e, t, r) {
                    var n, i = this._writableState, s = !1, a = (n = e,
                    (f.isBuffer(n) || n instanceof h) && !i.objectMode);
                    return a && !f.isBuffer(e) && (e = function(e) {
                        return f.from(e)
                    }(e)),
                    "function" == typeof t && (r = t,
                    t = null),
                    a ? t = "buffer" : t || (t = i.defaultEncoding),
                    "function" != typeof r && (r = m),
                    i.ended ? function(e, t) {
                        var r = new Error("write after end");
                        e.emit("error", r),
                        o(t, r)
                    }(this, r) : (a || function(e, t, r, n) {
                        var i = !0
                          , s = !1;
                        return null === r ? s = new TypeError("May not write null values to stream") : "string" == typeof r || void 0 === r || t.objectMode || (s = new TypeError("Invalid non-string/buffer chunk")),
                        s && (e.emit("error", s),
                        o(n, s),
                        i = !1),
                        i
                    }(this, i, e, r)) && (i.pendingcb++,
                    s = function(e, t, r, n, i, o) {
                        if (!r) {
                            var s = function(e, t, r) {
                                e.objectMode || !1 === e.decodeStrings || "string" != typeof t || (t = f.from(t, r));
                                return t
                            }(t, n, i);
                            n !== s && (r = !0,
                            i = "buffer",
                            n = s)
                        }
                        var a = t.objectMode ? 1 : n.length;
                        t.length += a;
                        var u = t.length < t.highWaterMark;
                        u || (t.needDrain = !0);
                        if (t.writing || t.corked) {
                            var l = t.lastBufferedRequest;
                            t.lastBufferedRequest = {
                                chunk: n,
                                encoding: i,
                                isBuf: r,
                                callback: o,
                                next: null
                            },
                            l ? l.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest,
                            t.bufferedRequestCount += 1
                        } else
                            w(e, t, !1, a, n, i, o);
                        return u
                    }(this, i, a, e, t, r)),
                    s
                }
                ,
                b.prototype.cork = function() {
                    this._writableState.corked++
                }
                ,
                b.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--,
                    e.writing || e.corked || e.finished || e.bufferProcessing || !e.bufferedRequest || _(this, e))
                }
                ,
                b.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()),
                    !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()) > -1))
                        throw new TypeError("Unknown encoding: " + e);
                    return this._writableState.defaultEncoding = e,
                    this
                }
                ,
                b.prototype._write = function(e, t, r) {
                    r(new Error("_write() is not implemented"))
                }
                ,
                b.prototype._writev = null,
                b.prototype.end = function(e, t, r) {
                    var n = this._writableState;
                    "function" == typeof e ? (r = e,
                    e = null,
                    t = null) : "function" == typeof t && (r = t,
                    t = null),
                    null != e && this.write(e, t),
                    n.corked && (n.corked = 1,
                    this.uncork()),
                    n.ending || n.finished || function(e, t, r) {
                        t.ending = !0,
                        M(e, t),
                        r && (t.finished ? o(r) : e.once("finish", r));
                        t.ended = !0,
                        e.writable = !1
                    }(this, n, r)
                }
                ,
                Object.defineProperty(b.prototype, "destroyed", {
                    get: function() {
                        return void 0 !== this._writableState && this._writableState.destroyed
                    },
                    set: function(e) {
                        this._writableState && (this._writableState.destroyed = e)
                    }
                }),
                b.prototype.destroy = g.destroy,
                b.prototype._undestroy = g.undestroy,
                b.prototype._destroy = function(e, t) {
                    this.end(),
                    t(e)
                }
            }
            ).call(this)
        }
        ).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("timers").setImmediate)
    }
    , {
        "./_stream_duplex": 16,
        "./internal/streams/destroy": 22,
        "./internal/streams/stream": 23,
        _process: 69,
        "core-util-is": 45,
        inherits: 55,
        "process-nextick-args": 15,
        "safe-buffer": 25,
        timers: 82,
        "util-deprecate": 83
    }],
    21: [function(e, t, r) {
        "use strict";
        var n = e("safe-buffer").Buffer;
        t.exports = function() {
            function e() {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                this.head = null,
                this.tail = null,
                this.length = 0
            }
            return e.prototype.push = function(e) {
                var t = {
                    data: e,
                    next: null
                };
                this.length > 0 ? this.tail.next = t : this.head = t,
                this.tail = t,
                ++this.length
            }
            ,
            e.prototype.unshift = function(e) {
                var t = {
                    data: e,
                    next: this.head
                };
                0 === this.length && (this.tail = t),
                this.head = t,
                ++this.length
            }
            ,
            e.prototype.shift = function() {
                if (0 !== this.length) {
                    var e = this.head.data;
                    return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next,
                    --this.length,
                    e
                }
            }
            ,
            e.prototype.clear = function() {
                this.head = this.tail = null,
                this.length = 0
            }
            ,
            e.prototype.join = function(e) {
                if (0 === this.length)
                    return "";
                for (var t = this.head, r = "" + t.data; t = t.next; )
                    r += e + t.data;
                return r
            }
            ,
            e.prototype.concat = function(e) {
                if (0 === this.length)
                    return n.alloc(0);
                if (1 === this.length)
                    return this.head.data;
                for (var t, r, i, o = n.allocUnsafe(e >>> 0), s = this.head, a = 0; s; )
                    t = s.data,
                    r = o,
                    i = a,
                    t.copy(r, i),
                    a += s.data.length,
                    s = s.next;
                return o
            }
            ,
            e
        }()
    }
    , {
        "safe-buffer": 25
    }],
    22: [function(e, t, r) {
        "use strict";
        var n = e("process-nextick-args");
        function i(e, t) {
            e.emit("error", t)
        }
        t.exports = {
            destroy: function(e, t) {
                var r = this
                  , o = this._readableState && this._readableState.destroyed
                  , s = this._writableState && this._writableState.destroyed;
                o || s ? t ? t(e) : !e || this._writableState && this._writableState.errorEmitted || n(i, this, e) : (this._readableState && (this._readableState.destroyed = !0),
                this._writableState && (this._writableState.destroyed = !0),
                this._destroy(e || null, (function(e) {
                    !t && e ? (n(i, r, e),
                    r._writableState && (r._writableState.errorEmitted = !0)) : t && t(e)
                }
                )))
            },
            undestroy: function() {
                this._readableState && (this._readableState.destroyed = !1,
                this._readableState.reading = !1,
                this._readableState.ended = !1,
                this._readableState.endEmitted = !1),
                this._writableState && (this._writableState.destroyed = !1,
                this._writableState.ended = !1,
                this._writableState.ending = !1,
                this._writableState.finished = !1,
                this._writableState.errorEmitted = !1)
            }
        }
    }
    , {
        "process-nextick-args": 15
    }],
    23: [function(e, t, r) {
        t.exports = e("events").EventEmitter
    }
    , {
        events: 44
    }],
    24: [function(e, t, r) {
        (r = t.exports = e("./lib/_stream_readable.js")).Stream = r,
        r.Readable = r,
        r.Writable = e("./lib/_stream_writable.js"),
        r.Duplex = e("./lib/_stream_duplex.js"),
        r.Transform = e("./lib/_stream_transform.js"),
        r.PassThrough = e("./lib/_stream_passthrough.js")
    }
    , {
        "./lib/_stream_duplex.js": 16,
        "./lib/_stream_passthrough.js": 17,
        "./lib/_stream_readable.js": 18,
        "./lib/_stream_transform.js": 19,
        "./lib/_stream_writable.js": 20
    }],
    25: [function(e, t, r) {
        var n = e("buffer")
          , i = n.Buffer;
        function o(e, t) {
            for (var r in e)
                t[r] = e[r]
        }
        function s(e, t, r) {
            return i(e, t, r)
        }
        i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = n : (o(n, r),
        r.Buffer = s),
        o(i, s),
        s.from = function(e, t, r) {
            if ("number" == typeof e)
                throw new TypeError("Argument must not be a number");
            return i(e, t, r)
        }
        ,
        s.alloc = function(e, t, r) {
            if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
            var n = i(e);
            return void 0 !== t ? "string" == typeof r ? n.fill(t, r) : n.fill(t) : n.fill(0),
            n
        }
        ,
        s.allocUnsafe = function(e) {
            if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
            return i(e)
        }
        ,
        s.allocUnsafeSlow = function(e) {
            if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
            return n.SlowBuffer(e)
        }
    }
    , {
        buffer: 43
    }],
    26: [function(e, t, r) {
        "use strict";
        var n = e("safe-buffer").Buffer
          , i = n.isEncoding || function(e) {
            switch ((e = "" + e) && e.toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
            case "raw":
                return !0;
            default:
                return !1
            }
        }
        ;
        function o(e) {
            var t;
            switch (this.encoding = function(e) {
                var t = function(e) {
                    if (!e)
                        return "utf8";
                    for (var t; ; )
                        switch (e) {
                        case "utf8":
                        case "utf-8":
                            return "utf8";
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return "utf16le";
                        case "latin1":
                        case "binary":
                            return "latin1";
                        case "base64":
                        case "ascii":
                        case "hex":
                            return e;
                        default:
                            if (t)
                                return;
                            e = ("" + e).toLowerCase(),
                            t = !0
                        }
                }(e);
                if ("string" != typeof t && (n.isEncoding === i || !i(e)))
                    throw new Error("Unknown encoding: " + e);
                return t || e
            }(e),
            this.encoding) {
            case "utf16le":
                this.text = u,
                this.end = l,
                t = 4;
                break;
            case "utf8":
                this.fillLast = a,
                t = 4;
                break;
            case "base64":
                this.text = c,
                this.end = d,
                t = 3;
                break;
            default:
                return this.write = f,
                void (this.end = h)
            }
            this.lastNeed = 0,
            this.lastTotal = 0,
            this.lastChar = n.allocUnsafe(t)
        }
        function s(e) {
            return e <= 127 ? 0 : e >> 5 == 6 ? 2 : e >> 4 == 14 ? 3 : e >> 3 == 30 ? 4 : -1
        }
        function a(e) {
            var t = this.lastTotal - this.lastNeed
              , r = function(e, t, r) {
                if (128 != (192 & t[0]))
                    return e.lastNeed = 0,
                    "�".repeat(r);
                if (e.lastNeed > 1 && t.length > 1) {
                    if (128 != (192 & t[1]))
                        return e.lastNeed = 1,
                        "�".repeat(r + 1);
                    if (e.lastNeed > 2 && t.length > 2 && 128 != (192 & t[2]))
                        return e.lastNeed = 2,
                        "�".repeat(r + 2)
                }
            }(this, e, t);
            return void 0 !== r ? r : this.lastNeed <= e.length ? (e.copy(this.lastChar, t, 0, this.lastNeed),
            this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (e.copy(this.lastChar, t, 0, e.length),
            void (this.lastNeed -= e.length))
        }
        function u(e, t) {
            if ((e.length - t) % 2 == 0) {
