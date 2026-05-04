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
    require("../test/mockdom");
}
"use strict";
var ace = require("../ace");
var codeLens = require("./code_lens");
var assert = require("../test/assertions");
var lang = require("../lib/lang");
require("./error_marker");
function click(node) {
    node.dispatchEvent(new window.CustomEvent("click", { bubbles: true }));
}
var editor = null;
module.exports = {
    setUp: function () {
        if (editor)
            editor.destroy();
        var el = document.createElement("div");
        el.style.left = "20px";
        el.style.top = "30px";
        el.style.width = "300px";
        el.style.height = "100px";
        document.body.appendChild(el);
        editor = ace.edit(el);
        editor.on("destroy", function () {
            document.body.removeChild(el);
        });
    },
    tearDown: function () {
        editor && editor.destroy();
        editor = null;
    },
    "test code lens": function () {
        editor.session.setValue("a\nb|c\nd" + "\n".repeat(100) + "\txxx");
        var commandId = "codeLensAction";
        var called = null;
        editor.commands.addCommand({
            name: commandId,
            exec: function (editor, args) {
                called = args;
            }
        });
        codeLens.registerCodeLensProvider(editor, {
            provideCodeLenses: function (session, callback) {
                callback(null, [{
                        start: {
                            row: 1
                        },
                        command: {
                            id: commandId,
                            title: "1",
                            arguments: "line"
                        }
                    }, {
                        start: {
                            row: 1
                        },
                        command: {
                            id: commandId,
                            title: "2",
                            arguments: "column"
                        }
                    }, {
                        start: {
                            row: session.getLength() - 1
                        },
                        command: {
                            id: commandId,
                            title: "last",
                            arguments: "last"
                        }
                    }]);
            }
        });
        editor.$updateLenses();
        editor.renderer.$loop._flush();
        var lens = editor.container.querySelector(".ace_codeLens");
        assert.equal(lens.textContent, "1\xa0|\xa02");
        assert.equal(lens.childNodes.length, 3);
        click(lens.childNodes[0]);
        assert.equal(called, "line");
        click(lens.childNodes[2]);
        assert.equal(called, "column");
        // Scroll down so that first lines go beyond the viewport
        editor.gotoLine(10);
        editor.renderer.$loop._flush();
        lens = editor.container.querySelector(".ace_codeLens");
        assert.ok(!lens);
        editor.gotoLine(200);
        editor.renderer.$loop._flush();
        lens = editor.container.querySelector(".ace_codeLens");
        assert.equal(lens.textContent, "last");
        editor.setSession(ace.createEditSession("\n".repeat(100)));
        editor.renderer.$loop._flush();
        lens = editor.container.querySelector(".ace_codeLens");
        assert.ok(!lens);
    },
    "test async code lens": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var lens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor.session.setValue("a\nb\nc");
                        codeLens.registerCodeLensProvider(editor, {
                            provideCodeLenses: function (session, callback) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, lang.sleep(0)];
                                            case 1:
                                                _a.sent();
                                                callback(null, [
                                                    {
                                                        start: { row: 1 },
                                                        command: { title: "code lens" }
                                                    }
                                                ]);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        });
                        editor.$updateLenses();
                        return [4 /*yield*/, lang.sleep(0)];
                    case 1:
                        _a.sent();
                        editor.renderer.$loop._flush();
                        lens = editor.container.querySelector(".ace_codeLens");
                        assert.equal(lens.textContent, "code lens");
                        next();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test multiple code lens providers": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var lens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor.session.setValue("a\nb\nc\nd");
                        codeLens.registerCodeLensProvider(editor, {
                            provideCodeLenses: function (session, callback) {
                                callback(null, [
                                    {
                                        start: { row: 1 },
                                        command: { title: "1" }
                                    }
                                ]);
                            }
                        });
                        codeLens.registerCodeLensProvider(editor, {
                            provideCodeLenses: function (session, callback) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, lang.sleep(0)];
                                            case 1:
                                                _a.sent();
                                                callback(null, [
                                                    {
                                                        start: { row: 2 },
                                                        command: { title: "2" }
                                                    }
                                                ]);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        });
                        editor.$updateLenses();
                        return [4 /*yield*/, lang.sleep(0)];
                    case 1:
                        _a.sent();
                        editor.renderer.$loop._flush();
                        lens = editor.container.querySelectorAll(".ace_codeLens");
                        assert.equal(lens[0].textContent, "1");
                        assert.equal(lens[1].textContent, "2");
                        next();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test multiple code lens providers on the same line": function () {
        editor.session.setValue("a\nb\nc");
        codeLens.registerCodeLensProvider(editor, {
            provideCodeLenses: function (session, callback) {
                callback(null, [{
                        start: { row: 1 },
                        command: { title: "1" }
                    }]);
            }
        });
        codeLens.registerCodeLensProvider(editor, {
            provideCodeLenses: function (session, callback) {
                callback(null, [{
                        start: { row: 1 },
                        command: { title: "2" }
                    }]);
            }
        });
        editor.$updateLenses();
        editor.renderer.$loop._flush();
        var lens = editor.container.querySelector(".ace_codeLens");
        assert.equal(lens.textContent, "1\xa0|\xa02");
    },
    "test code lens behavior with multiple sessions": function () {
        editor.session.setValue("a\nb");
        codeLens.registerCodeLensProvider(editor, {
            provideCodeLenses: function (session, callback) {
                callback(null, [{
                        start: { row: 1 },
                        command: { title: session.doc.$lines[0] }
                    }]);
            }
        });
        editor.$updateLenses();
        editor.renderer.$loop._flush();
        var lens = editor.container.querySelector(".ace_codeLens");
        assert.equal(lens.textContent, "a");
        editor.setSession(ace.createEditSession("c\nd"));
        editor.$updateLenses();
        editor.renderer.$loop._flush();
        var lens = editor.container.querySelector(".ace_codeLens");
        assert.equal(lens.textContent, "c");
    }
};
require("../test/run")(module);

});