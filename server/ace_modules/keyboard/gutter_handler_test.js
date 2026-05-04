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
require("../multi_select");
require("../theme/textmate");
var user = require("../test/user");
var Editor = require("../editor").Editor;
var Mode = require("../mode/java").Mode;
var VirtualRenderer = require("../virtual_renderer").VirtualRenderer;
var assert = require("../test/assertions");
var lang = require("../lib/lang");
function findVisibleTooltip() {
    var tooltips = document.body.querySelectorAll(".ace_gutter-tooltip");
    for (var i = 0; i < tooltips.length; i++) {
        if (window.getComputedStyle(tooltips[i]).display === "block") {
            return tooltips[i];
        }
    }
    return null;
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
    "test: keyboard code folding: basic functionality": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, toggler;
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
                        toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the fold widget.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[1]);
                        // Click the fold widget.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check that code is folded.
                        editor.renderer.$loop._flush();
                        assert.ok(/ace_closed/.test(toggler.className));
                        assert.equal(lines.cells[1].element.textContent, "52");
                        // After escape focus should be back to the gutter.
                        user.type("Escape");
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: keyboard code folding: multiple folds": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "\n x {" + "\n".repeat(5) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        assert.equal(lines.cells[2].element.textContent, "3");
                        // Focus on the fold widgets.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[1]);
                        // Click the first fold widget.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check that code is folded.
                        editor.renderer.$loop._flush();
                        assert.equal(lines.cells[2].element.textContent, "8");
                        // Move to the next fold widget.
                        user.type("Down");
                        assert.equal(document.activeElement, lines.cells[3].element.childNodes[1]);
                        assert.equal(lines.cells[4].element.textContent, "10");
                        // Click the fold widget.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 3:
                        _a.sent();
                        // Check that code is folded.
                        assert.equal(lines.cells[4].element.textContent, "15");
                        // Move back up one fold widget.
                        user.type("Up");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[1]);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: keyboard annotation: basic functionality": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "error test", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        user.type("Left");
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[2]);
                        // Click annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check annotation is rendered.
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        // Press escape to dismiss the tooltip.
                        user.type("Escape");
                        // After escape again focus should be back to the gutter.
                        user.type("Escape");
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: keyboard annotation: multiple annotations": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, tooltip, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([
                            { row: 1, column: 0, text: "error test", type: "error" },
                            { row: 2, column: 0, text: "warning test", type: "warning" }
                        ]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        user.type("Left");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[2]);
                        // Click annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check annotation is rendered.
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        // Press escape to dismiss the tooltip.
                        user.type("Escape");
                        // Press down to move to next annotation.
                        user.type("Down");
                        assert.equal(document.activeElement, lines.cells[2].element.childNodes[2]);
                        // Click annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 3:
                        _a.sent();
                        // Check annotation is rendered.
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/warning test/.test(tooltip.textContent));
                        // Press escape to dismiss the tooltip.
                        user.type("Escape");
                        // Move back up one annotation.
                        user.type("Up");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[2]);
                        // Move back to the folds, focus should be on the fold on line 1.
                        user.type("Right");
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[1]);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: keyboard annotation: no folds": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 1, column: 0, text: "error test", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on gutter interaction.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        // Focus should be on the annotation directly.
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[2]);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: aria attributes mode with getFoldWidgetRange": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(5) + "}";
        editor.session.setMode(new Mode());
        editor.setOption("enableKeyboardAccessibility", true);
        editor.setValue(value, -1);
        editor.renderer.$loop._flush();
        var lines = editor.renderer.$gutterLayer.$lines;
        var toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
        assert.equal(toggler.getAttribute("aria-label"), "Toggle code folding, rows 1 through 6");
        assert.equal(toggler.getAttribute("aria-expanded"), "true");
        assert.equal(toggler.getAttribute("title"), "Fold code");
        editor.session.$toggleFoldWidget(0, {});
        editor.renderer.$loop._flush();
        assert.equal(toggler.getAttribute("aria-label"), "Toggle code folding, rows 1 through 6");
        assert.equal(toggler.getAttribute("aria-expanded"), "false");
        assert.equal(toggler.getAttribute("title"), "Unfold code");
    },
    "test: aria attributes mode without getFoldWidgetRange": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(5) + "}";
        var mode = new Mode();
        mode.foldingRules.getFoldWidgetRange = function (session, foldStyle, row) {
            return null;
        };
        editor.session.setMode(mode);
        editor.setOption("enableKeyboardAccessibility", true);
        editor.setValue(value, -1);
        editor.renderer.$loop._flush();
        var lines = editor.renderer.$gutterLayer.$lines;
        var toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
        assert.equal(toggler.getAttribute("aria-label"), "Toggle code folding, row 1");
        assert.equal(toggler.getAttribute("aria-expanded"), "true");
        assert.equal(toggler.getAttribute("title"), "Fold code");
    },
    "test: should signal keyboard event": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, row, isAnnotation, isFold, key, lines;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "error test", type: "error" }]);
                        editor.on("gutterkeydown", function (event) {
                            row = event.getRow();
                            isAnnotation = event.isInAnnotationLane();
                            isFold = event.isInFoldLane();
                            key = event.getKey();
                        });
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        // Focus on the annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        user.type("Left");
                        assert.equal(document.activeElement, lines.cells[0].element.childNodes[2]);
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        assert.equal(row, 0);
                        assert.equal(isAnnotation, true);
                        assert.equal(isFold, false);
                        assert.equal(key, "left");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: switching lanes with the custom widget should work": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([
                            { row: 1, column: 0, text: "error test", type: "error" },
                            { row: 2, column: 0, text: "warning test", type: "warning" }
                        ]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        editor.renderer.$gutterLayer.$addCustomWidget(1, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title",
                        });
                        // Focus on the annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        user.type("Left");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[2]);
                        // Click annotation.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 2:
                        _a.sent();
                        // Check annotation is rendered.
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        // Press escape to dismiss the tooltip.
                        user.type("Escape");
                        // Switch lane move to custom widget
                        user.type("Right");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[3]);
                        // Move back to the annotations, focus should be on the annotation on line 1.
                        user.type("Left");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[2]);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: moving up and down to custom widget and checking onclick callback as well": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, firstCallbackCalledCount, firstCallback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "\n x {" + "\n".repeat(5) + "}\n";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.setOption("enableKeyboardAccessibility", true);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        // Set focus to the gutter div.
                        editor.renderer.$gutter.focus();
                        assert.equal(document.activeElement, editor.renderer.$gutter);
                        assert.equal(lines.cells[2].element.textContent, "3");
                        firstCallbackCalledCount = 0;
                        firstCallback = function (e) {
                            firstCallbackCalledCount++;
                            e.stopPropagation();
                        };
                        editor.renderer.$gutterLayer.$addCustomWidget(2, {
                            className: "ace_users_css",
                            label: "Open_label",
                            title: "Open_title",
                            callbacks: {
                                onClick: firstCallback
                            }
                        });
                        // Focus on the fold widgets.
                        user.type("Enter");
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        _a.sent();
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[1]);
                        // Move down to the custom widget.
                        user.type("Down");
                        assert.equal(document.activeElement, lines.cells[2].element.childNodes[3]);
                        user.type("Enter");
                        assert.equal(firstCallbackCalledCount, 1);
                        // Move up to the previous fold widget.
                        user.type("Up");
                        assert.equal(document.activeElement, lines.cells[1].element.childNodes[1]);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: add several custom widgets": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(5) + "}\n";
        value = value.repeat(50);
        editor.session.setMode(new Mode());
        editor.setValue(value, -1);
        editor.execCommand("toggleFoldWidget");
        editor.renderer.$loop._flush();
        editor.renderer.$gutterLayer.$addCustomWidget(100, {
            className: "widget1",
        });
        editor.renderer.$gutterLayer.$addCustomWidget(4, {
            className: "widget2",
        });
        editor.renderer.$loop._flush();
        assert.ok(!editor.container.querySelector(".widget1"));
        assert.ok(editor.container.querySelector(".widget2"));
        editor.navigateTo(100, 0);
        editor.renderer.scrollCursorIntoView();
        editor.renderer.$loop._flush();
        assert.ok(editor.container.querySelector(".widget1"));
        assert.ok(!editor.container.querySelector(".widget2"));
    },
    tearDown: function () {
        this.editor.destroy();
        document.body.removeChild(this.editor.container);
    }
};
require("../test/run")(module);

});