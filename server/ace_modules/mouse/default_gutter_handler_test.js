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
var Editor = require("../editor").Editor;
var Mode = require("../mode/java").Mode;
var VirtualRenderer = require("../virtual_renderer").VirtualRenderer;
var assert = require("../test/assertions");
var user = require("../test/user");
var lang = require("../lib/lang");
var MouseEvent = function (type, opts) {
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(/click|wheel/.test(type) ? type : "mouse" + type, true, true, window, opts.detail, opts.x, opts.y, opts.x, opts.y, opts.ctrl, opts.alt, opts.shift, opts.meta, opts.button || 0, opts.relatedTarget);
    return e;
};
var editor;
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
        editor = this.editor;
    },
    "test: gutter error tooltip": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "error test", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_error/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        annotation.dispatchEvent(new MouseEvent("move", { x: 0, y: 0 }));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter security tooltip": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "security finding test", type: "security" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_security/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/security finding test/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter warning tooltip": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "warning test", type: "warning" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_warning/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/warning test/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter info tooltip": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "info test", type: "info" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_info/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/info test/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter hint tooltip": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "suggestion test", type: "hint" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_hint/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/suggestion test/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter svg icons": function () {
        var editor = this.editor;
        var value = "";
        editor.session.setMode(new Mode());
        editor.setOption("useSvgGutterIcons", true);
        editor.setValue(value, -1);
        editor.session.setAnnotations([{ row: 0, column: 0, type: "error", text: "error test" }]);
        editor.renderer.$loop._flush();
        var lines = editor.renderer.$gutterLayer.$lines;
        var line = lines.cells[0].element;
        assert.ok(/ace_gutter-cell_svg-icons/.test(line.className));
        var annotation = line.childNodes[2].firstChild;
        assert.ok(/ace_icon_svg/.test(annotation.className));
    },
    "test: error show up in fold": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, toggler, rect, annotation, row, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("showFoldedAnnotations", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 1, column: 0, type: "error", text: "error test" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        assert.equal(lines.cells[1].element.textContent, "2");
                        toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
                        rect = toggler.getBoundingClientRect();
                        if (!rect.left)
                            rect.left = 100; // for mockdom
                        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
                        editor.renderer.$loop._flush();
                        assert.ok(/ace_closed/.test(toggler.className));
                        assert.equal(lines.cells[1].element.textContent, "51");
                        annotation = lines.cells[0].element.childNodes[2].firstChild;
                        assert.ok(/ace_error_fold/.test(annotation.className));
                        row = lines.cells[0].row;
                        editor.$mouseHandler.$tooltip.showTooltip(row);
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error in folded/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: security show up in fold": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, toggler, rect, annotation, row, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("showFoldedAnnotations", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 1, column: 0, type: "security", text: "security finding test" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        assert.equal(lines.cells[1].element.textContent, "2");
                        toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
                        rect = toggler.getBoundingClientRect();
                        if (!rect.left)
                            rect.left = 100; // for mockdom
                        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
                        editor.renderer.$loop._flush();
                        assert.ok(/ace_closed/.test(toggler.className));
                        assert.equal(lines.cells[1].element.textContent, "51");
                        annotation = lines.cells[0].element.childNodes[2].firstChild;
                        assert.ok(/ace_security_fold/.test(annotation.className));
                        row = lines.cells[0].row;
                        editor.$mouseHandler.$tooltip.showTooltip(row);
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/security finding in folded/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: warning show up in fold": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, toggler, rect, annotation, row, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n".repeat(50) + "}";
                        value = value.repeat(50);
                        editor.session.setMode(new Mode());
                        editor.setOption("showFoldedAnnotations", true);
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 1, column: 0, type: "warning", text: "warning test" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        assert.equal(lines.cells[1].element.textContent, "2");
                        toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
                        rect = toggler.getBoundingClientRect();
                        if (!rect.left)
                            rect.left = 100; // for mockdom
                        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
                        editor.renderer.$loop._flush();
                        assert.ok(/ace_closed/.test(toggler.className));
                        assert.equal(lines.cells[1].element.textContent, "51");
                        annotation = lines.cells[0].element.childNodes[2].firstChild;
                        assert.ok(/ace_warning_fold/.test(annotation.className));
                        row = lines.cells[0].row;
                        editor.$mouseHandler.$tooltip.showTooltip(row);
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/warning in folded/.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: info not show up in fold": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(50) + "}";
        value = value.repeat(50);
        editor.session.setMode(new Mode());
        editor.setOption("showFoldedAnnotations", true);
        editor.setValue(value, -1);
        editor.session.setAnnotations([{ row: 1, column: 0, type: "info", text: "info test" }]);
        editor.renderer.$loop._flush();
        // Fold the line containing the annotation.
        var lines = editor.renderer.$gutterLayer.$lines;
        assert.equal(lines.cells[1].element.textContent, "2");
        var toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
        var rect = toggler.getBoundingClientRect();
        if (!rect.left)
            rect.left = 100; // for mockdom
        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
        editor.renderer.$loop._flush();
        assert.ok(/ace_closed/.test(toggler.className));
        assert.equal(lines.cells[1].element.textContent, "51");
        // Annotation node should NOT have fold class.
        var annotation = lines.cells[0].element.childNodes[2];
        assert.notOk(/fold/.test(annotation.className));
    },
    "test: hint not show up in fold": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(50) + "}";
        value = value.repeat(50);
        editor.session.setMode(new Mode());
        editor.setOption("showFoldedAnnotations", true);
        editor.setValue(value, -1);
        editor.session.setAnnotations([{ row: 1, column: 0, type: "hint", text: "suggestion test" }]);
        editor.renderer.$loop._flush();
        // Fold the line containing the annotation.
        var lines = editor.renderer.$gutterLayer.$lines;
        assert.equal(lines.cells[1].element.textContent, "2");
        var toggler = lines.cells[0].element.querySelector(".ace_fold-widget");
        var rect = toggler.getBoundingClientRect();
        if (!rect.left)
            rect.left = 100; // for mockdom
        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
        editor.renderer.$loop._flush();
        assert.ok(/ace_closed/.test(toggler.className));
        assert.equal(lines.cells[1].element.textContent, "51");
        // Annotation node should NOT have fold class.
        var annotation = lines.cells[0].element.childNodes[2];
        assert.notOk(/fold/.test(annotation.className));
    },
    "test: severities are correctly ordered/ranked when folding": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(50) + "}";
        value = value.repeat(50);
        editor.session.setMode(new Mode());
        editor.setOption("showFoldedAnnotations", true);
        editor.setValue(value, -1);
        // Rank is: Error > Security > Warning
        editor.session.setAnnotations([
            { row: 1, column: 0, type: "warning", text: "warning test" },
            { row: 1, column: 0, type: "security", text: "security finding test" },
            { row: 1, column: 0, type: "error", text: "error test" }
        ]);
        editor.renderer.$loop._flush();
        // Fold the line containing the annotation.
        var lines = editor.renderer.$gutterLayer.$lines;
        assert.equal(lines.cells[1].element.textContent, "2");
        var firstLineGutterElement = lines.cells[0].element;
        var toggler = firstLineGutterElement.querySelector(".ace_fold-widget");
        var rect = toggler.getBoundingClientRect();
        if (!rect.left)
            rect.left = 100; // for mockdom
        toggler.dispatchEvent(new MouseEvent("click", { x: rect.left, y: rect.top }));
        editor.renderer.$loop._flush();
        assert.ok(/ace_closed/.test(toggler.className));
        assert.equal(lines.cells[1].element.textContent, "51");
        // Annotation node should have Error fold class
        assert.ok(/ace_error_fold/.test(firstLineGutterElement.className));
        assert.notOk(/ace_security_fold/.test(firstLineGutterElement.className));
        assert.notOk(/ace_warning_fold/.test(firstLineGutterElement.className));
        // Annotation node should have Security fold class
        editor.session.setAnnotations([
            { row: 1, column: 0, type: "security", text: "security finding test" },
            { row: 1, column: 0, type: "warning", text: "warning test" }
        ]);
        editor.renderer.$loop._flush();
        assert.notOk(/ace_error_fold/.test(firstLineGutterElement.className));
        assert.ok(/ace_security_fold/.test(firstLineGutterElement.className));
        assert.notOk(/ace_warning_fold/.test(firstLineGutterElement.className));
        // Annotation node should have Warning fold class
        editor.session.setAnnotations([
            { row: 1, column: 0, type: "warning", text: "warning test" }
        ]);
        editor.renderer.$loop._flush();
        assert.notOk(/ace_error_fold/.test(firstLineGutterElement.className));
        assert.notOk(/ace_security_fold/.test(firstLineGutterElement.className));
        assert.ok(/ace_warning_fold/.test(firstLineGutterElement.className));
    },
    "test: gutter tooltip should properly display special characters (\" ' & <)": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "special characters \" ' & <", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_error/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/special characters " ' & </.test(tooltip.textContent));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter hover tooltip should remain open when pressing ctrl key combination": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, annotation, rect, tooltip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "error test", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        annotation = lines.cells[0].element;
                        assert.ok(/ace_error/.test(annotation.className));
                        rect = annotation.getBoundingClientRect();
                        annotation.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        tooltip.focus();
                        user.type("Ctrl-C");
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        // also verify if it closes when presses another key
                        user.type("Escape");
                        tooltip = document.body.querySelector(".ace_gutter-tooltip");
                        assert.strictEqual(tooltip.style.display, "none");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: gutter tooltip aria-describedby attribute": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, lines, element, annotation, rect, tooltip, ariaDescribedBy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "";
                        editor.session.setMode(new Mode());
                        editor.setValue(value, -1);
                        editor.session.setAnnotations([{ row: 0, column: 0, text: "error test", type: "error" }]);
                        editor.renderer.$loop._flush();
                        lines = editor.renderer.$gutterLayer.$lines;
                        element = lines.cells[0].element;
                        annotation = element.childNodes[2];
                        assert.ok(/ace_error/.test(element.className));
                        rect = element.getBoundingClientRect();
                        element.dispatchEvent(new MouseEvent("move", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
                        // Wait for the tooltip to appear after its timeout.
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait for the tooltip to appear after its timeout.
                        _a.sent();
                        editor.renderer.$loop._flush();
                        tooltip = findVisibleTooltip();
                        assert.ok(/error test/.test(tooltip.textContent));
                        ariaDescribedBy = annotation.getAttribute("aria-describedby");
                        assert.ok(ariaDescribedBy, "aria-describedby should be set when tooltip is shown");
                        assert.equal(ariaDescribedBy, tooltip.id, "aria-describedby should match tooltip id");
                        editor.container.dispatchEvent(new MouseEvent("wheel", {}));
                        return [4 /*yield*/, lang.sleep(100)];
                    case 2:
                        _a.sent();
                        editor.renderer.$loop._flush();
                        assert.equal(annotation.getAttribute("aria-describedby"), "", "aria-describedby should be removed when tooltip is hidden");
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