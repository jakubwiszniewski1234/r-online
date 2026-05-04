define(function(require, exports, module){var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
if (typeof process !== "undefined") {
    require("./test/mockdom");
}
"use strict";
var assert = require("./test/assertions");
var VirtualRenderer = require("./virtual_renderer").VirtualRenderer;
var Editor = require("./editor").Editor;
var lang = require("./lib/lang");
var MouseEvent = function (type, opts) {
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(/click|wheel/.test(type) ? type : "mouse" + type, true, true, window, opts.detail, opts.x, opts.y, opts.x, opts.y, opts.ctrl, opts.alt, opts.shift, opts.meta, opts.button || 0, opts.relatedTarget);
    return e;
};
var WheelEvent = function (opts) {
    var e = new MouseEvent("wheel", opts);
    e.DOM_DELTA_PIXEL = 0;
    e.DOM_DELTA_LINE = 1;
    e.DOM_DELTA_PAGE = 2;
    e.deltaMode = e["DOM_DELTA_" + opts.mode.toUpperCase()];
    e.deltaX = opts.x || 0;
    e.deltaY = opts.y || 0;
    return e;
};
var editor = null;
var renderer = null;
module.exports = {
    name: "ACE scrollbar_custom.js",
    setUp: function () {
        if (editor)
            editor.destroy();
        var el = document.createElement("div");
        el.style.left = "20px";
        el.style.top = "30px";
        el.style.width = "300px";
        el.style.height = "100px";
        document.body.appendChild(el);
        renderer = new VirtualRenderer(el);
        renderer.scrollHeight = 50;
        renderer.layerConfig.maxHeight = 200;
        renderer.layerConfig.lineHeight = 14;
        editor = new Editor(renderer);
        editor.on("destroy", function () {
            document.body.removeChild(el);
        });
        editor.setOptions({
            customScrollbar: true
        });
        // TODO remove this when onresize doesn't recreate custom scrollbar
        renderer.$loop._flush();
    },
    tearDown: function () {
        editor && editor.destroy();
        editor = null;
    },
    "test: vertical scrolling": function () {
        editor.setValue("a" + "\n".repeat(100) + "b" + "\nxxxxxx", -1);
        renderer.$loop._flush();
        renderer.scrollBarV.element.dispatchEvent(MouseEvent("down", {
            x: 0,
            y: 80,
            button: 0
        }));
        renderer.$loop._flush();
        var thumbTop = renderer.scrollBarV.thumbTop;
        assert.ok(thumbTop > 0);
        editor.container.dispatchEvent(WheelEvent({
            mode: "line",
            y: 50
        }));
        renderer.$loop._flush();
        assert.ok(renderer.scrollBarV.thumbTop > thumbTop);
    },
    "test: dragging vertical scroll thumb": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor.setValue("a" + "\n".repeat(100) + "b" + "\nxxxxxx", -1);
                        renderer.$loop._flush();
                        renderer.scrollBarV.inner.dispatchEvent(MouseEvent("down", {
                            x: 5,
                            y: 10,
                            button: 0
                        }));
                        renderer.$loop._flush();
                        renderer.scrollBarV.inner.dispatchEvent(MouseEvent("move", {
                            x: 5,
                            y: 80,
                            button: 0
                        }));
                        return [4 /*yield*/, lang.sleep(200)];
                    case 1:
                        _a.sent();
                        assert.ok(renderer.scrollBarV.thumbTop > 0);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: horizontal scrolling": function () {
        assert.ok(!renderer.scrollBarH.isVisible);
        editor.setValue("a".repeat(1000), -1);
        renderer.$loop._flush();
        assert.ok(renderer.scrollBarH.isVisible);
        renderer.scrollBarH.element.dispatchEvent(MouseEvent("down", {
            x: 80,
            y: 0,
            button: 0
        }));
        renderer.$loop._flush();
        assert.ok(renderer.scrollBarH.thumbLeft > 0);
    },
    "test: dragging horizontal scroll thumb": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor.setValue("a".repeat(1000), -1);
                        renderer.$loop._flush();
                        renderer.scrollBarH.inner.dispatchEvent(MouseEvent("down", {
                            x: 5,
                            y: 5,
                            button: 0
                        }));
                        renderer.$loop._flush();
                        renderer.scrollBarH.inner.dispatchEvent(MouseEvent("move", {
                            x: 80,
                            y: 5,
                            button: 0
                        }));
                        return [4 /*yield*/, lang.sleep(200)];
                    case 1:
                        _a.sent();
                        assert.ok(renderer.scrollBarH.thumbLeft > 0);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
require("./test/run")(module);

});