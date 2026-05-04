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
var dom = require("./lib/dom");
var ace = require("./ace");
var assert = require("./test/assertions");
var lang = require("./lib/lang");
module.exports = {
    "test: ace edit": function () {
        var editor = ace.edit(null, {
            value: "Helo world"
        });
        assert.equal(editor.getValue(), "Helo world");
        var session = ace.createEditSession("Juhu kinners!");
        editor.setSession(session);
        assert.equal(editor.getValue(), "Juhu kinners!");
        assert.equal(editor, ace.edit(editor.container));
        editor.destroy();
    },
    "test: edit textarea": function () {
        var el = document.createElement("textarea");
        document.body.appendChild(el);
        var editor = ace.edit(el);
        assert.notEqual(editor.container, el);
        editor.container.id = "editor1";
        assert.equal(editor, ace.edit("editor1"));
        editor.destroy();
        document.body.removeChild(editor.container);
    },
    "test: edit element by id": function () {
        var el = document.createElement("div");
        document.body.appendChild(el);
        var editor = null;
        try {
            editor = ace.edit("x");
        }
        catch (e) {
        }
        assert.equal(editor, null);
        el.id = "editor2";
        el.textContent = "h";
        editor = ace.edit("editor2");
        assert.equal(el, editor.container);
        assert.equal("h", editor.getValue());
        document.body.removeChild(el);
        editor.destroy();
    },
    "test: destroy": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, mouseTarget, textarea, focusCalled;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = ace.edit();
                        mouseTarget = editor.renderer.getMouseEventTarget();
                        textarea = editor.textInput.getElement();
                        // editor.curOp is undefined after commands
                        sendText(textarea, "x");
                        assert.ok(!editor.curOp);
                        assert.equal(editor.getValue(), "x");
                        // editor.curOp is defined if api is used without endOperation
                        editor.insert("1");
                        assert.ok(editor.curOp);
                        focusCalled = 0;
                        editor.focus = function () { focusCalled++; };
                        click(mouseTarget);
                        assert.equal(focusCalled, 1);
                        editor.destroy();
                        // clicking on destroyed editor doesn't call focus
                        click(mouseTarget);
                        assert.equal(focusCalled, 1);
                        return [4 /*yield*/, lang.sleep(0)];
                    case 1:
                        _a.sent();
                        assert.notOk(!!editor.curOp);
                        // input commands on destroed editor without session do not throw errors
                        editor.setSession(null);
                        sendText(textarea, "2");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: useStrictCSP": function () {
        ace.config.set("useStrictCSP", undefined);
        function getStyleNode() {
            return document.getElementById("test.css");
        }
        assert.ok(!getStyleNode());
        dom.importCssString("test{}", "test.css", false);
        assert.ok(!getStyleNode());
        ace.config.set("useStrictCSP", true);
        assert.ok(!getStyleNode());
        ace.config.set("useStrictCSP", false);
        assert.ok(getStyleNode());
    },
    "test: resizeObserver": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var mockObserver, editor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockObserver = {
                            disconnect: function () { mockObserver.target = null; },
                            observe: function (el) {
                                mockObserver.target = el;
                            },
                            $create: function (fn) {
                                mockObserver.callback = fn;
                                return mockObserver;
                            },
                            call: function () {
                                setTimeout(function () {
                                    if (mockObserver.target)
                                        mockObserver.callback([{ contentRect: mockObserver.target.getBoundingClientRect() }]);
                                });
                            }
                        };
                        if (!window.ResizeObserver) {
                            window.ResizeObserver = mockObserver.$create;
                        }
                        editor = ace.edit(null);
                        document.body.appendChild(editor.container);
                        editor.container.style.width = "100px";
                        editor.container.style.height = "100px";
                        mockObserver.call();
                        editor.resize(true);
                        assert.ok(!editor.renderer.$resizeTimer.isPending());
                        assert.equal(editor.renderer.$size.width, 100);
                        editor.container.style.width = "200px";
                        mockObserver.call();
                        return [4 /*yield*/, lang.sleep(15)];
                    case 1:
                        _a.sent();
                        if (editor.renderer.$resizeTimer.isPending())
                            editor.renderer.$resizeTimer.call();
                        assert.equal(editor.renderer.$size.width, 200);
                        editor.container.style.height = "200px";
                        mockObserver.call();
                        return [4 /*yield*/, lang.sleep(15)];
                    case 2:
                        _a.sent();
                        assert.ok(editor.renderer.$resizeTimer.isPending());
                        editor.container.style.height = "100px";
                        mockObserver.call();
                        return [4 /*yield*/, lang.sleep(15)];
                    case 3:
                        _a.sent();
                        assert.ok(!editor.renderer.$resizeTimer.isPending());
                        editor.setOption("useResizeObserver", false);
                        editor.container.style.height = "300px";
                        mockObserver.call();
                        assert.ok(!editor.renderer.$resizeObserver);
                        editor.setOption("useResizeObserver", true);
                        assert.ok(editor.renderer.$resizeObserver);
                        if (window.ResizeObserver === mockObserver.$create)
                            window.ResizeObserver = undefined;
                        editor.destroy();
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: edit template": function () {
        var template = document.createElement("template");
        var div = document.createElement("div");
        template.content = document.createDocumentFragment();
        template.content.appendChild(div);
        var fragment = template.content.cloneNode(true);
        var el = fragment.firstChild;
        //emulating template content document fragment behaviour in browser
        //which cause #4634 issue (virtual Document that doesn't have `documentElement`)
        el.ownerDocument = {};
        var editor = ace.edit(el);
        assert.equal(editor.container, el);
        editor.destroy();
    }
};
/*global CustomEvent*/
function click(node) {
    node.dispatchEvent(new CustomEvent("mousedown"));
}
function sendText(textarea, text) {
    textarea.value = textarea.value.slice(0, textarea.selectionStart) + text
        + textarea.value.slice(textarea.selectionEnd);
    textarea.dispatchEvent(new CustomEvent("input"));
}
require("./test/run")(module);

});