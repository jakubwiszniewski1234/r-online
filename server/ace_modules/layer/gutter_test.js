define(function(require, exports, module){"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
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
var keys = require("../lib/keys");
require("../multi_select");
require("../theme/textmate");
var Editor = require("../editor").Editor;
var Mode = require("../mode/java").Mode;
var VirtualRenderer = require("../virtual_renderer").VirtualRenderer;
var assert = require("../test/assertions");
var lang = require("../lib/lang");
function emit(keyCode) {
    var data = { bubbles: true, keyCode: keyCode };
    var event = new KeyboardEvent("keydown", data);
    var el = document.activeElement;
    el.dispatchEvent(event);
}
module.exports = {
    setUp: function () {
        this.editor = new Editor(new VirtualRenderer());
        this.editor.container.style.position = "absolute";
        this.editor.container.style.height = "500px";
        this.editor.container.style.width = "500px";
        this.editor.container.style.left = "50px";
        this.editor.container.style.top = "10px";
        document.body.appendChild(this.editor.container);
    },
    "test: custom icon replaces the fold icon sucessfully": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the fold widget.
                        emit(keys["enter"]);
                        editor.renderer.$gutterLayer.$addCustomWidget(13, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title"
                        });
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        // Check that custom widget is shown
                        editor.renderer.$loop._flush();
                        console.log(lines.cells[13].element.childNodes[2].className);
                        assert.ok(/ace_users_css/.test(lines.cells[13].element.childNodes[3].className));
                        // fold widget is not shown
                        assert.equal(lines.cells[13].element.childNodes[1].style.display, "none");
                        // After escape focus should be back to the gutter.
                        emit(keys["escape"]);
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: after hiding custom icon fold icon is visible automatically": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the custom widget.
                        emit(keys["enter"]);
                        editor.renderer.$gutterLayer.$addCustomWidget(0, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title"
                        });
                        editor.renderer.$gutterLayer.$removeCustomWidget(0);
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[1]);
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check that custom widget is hidden.
                        editor.renderer.$loop._flush();
                        assert.equal(lines.cells[0].element.childNodes[3], undefined);
                        assert.equal(lines.cells[0].element.childNodes[1].style.display, "inline-block");
                        assert.ok(/ace_open/.test(lines.cells[0].element.childNodes[1].className));
                        // After escape focus should be back to the gutter.
                        emit(keys["escape"]);
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: folding is kept consistent when custom widget is shown first and then hidden": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the fold widget.
                        emit(keys["enter"]);
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[1]);
                        // Click the fold widget to fold the lines.
                        emit(keys["enter"]);
                        editor.renderer.$gutterLayer.$addCustomWidget(0, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title"
                        });
                        editor.renderer.$gutterLayer.$removeCustomWidget(0);
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check that custom widget is hidden.
                        editor.renderer.$loop._flush();
                        assert.equal(lines.cells[0].element.childNodes[3], undefined);
                        assert.ok(/ace_closed/.test(lines.cells[0].element.childNodes[1].className));
                        // After escape focus should be back to the gutter.
                        emit(keys["escape"]);
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: onClick callback is getting called and updated when updating the custom widget": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, firstCallbackCalledCount, firstCallback, secondCallbackCalledCount, secondCallback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the fold widget.
                        emit(keys["enter"]);
                        firstCallbackCalledCount = 0;
                        firstCallback = function () {
                            firstCallbackCalledCount++;
                        };
                        secondCallbackCalledCount = 0;
                        secondCallback = function () {
                            secondCallbackCalledCount++;
                        };
                        editor.renderer.$gutterLayer.$addCustomWidget(0, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title",
                            callbacks: {
                                onClick: firstCallback
                            }
                        });
                        editor.renderer.$gutterLayer.$addCustomWidget(0, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title",
                            callbacks: {
                                onClick: secondCallback
                            }
                        });
                        // clicking the custom widget
                        lines.cells[0].element.childNodes[3].dispatchEvent(new CustomEvent("click"));
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        // Check that custom widget is hidden.
                        editor.renderer.$loop._flush();
                        assert.equal(firstCallbackCalledCount, 0);
                        assert.equal(secondCallbackCalledCount, 1);
                        // After escape focus should be back to the gutter.
                        emit(keys["escape"]);
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    tearDown: function () {
        this.editor.destroy();
        document.body.removeChild(this.editor.container);
    }
};
require("../test/run")(module);

});