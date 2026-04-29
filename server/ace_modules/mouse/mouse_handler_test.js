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
var lang = require("../lib/lang");
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
function sendTouchEvent(type, opts, editor) {
    var e = new window.CustomEvent("touch" + type, { bubbles: true, cancelable: true });
    Object.defineProperties(e, Object.getOwnPropertyDescriptors(opts));
    editor.container.dispatchEvent(e);
}
function touchPos(row, column) {
    var pos = editor.renderer.textToScreenCoordinates(row, column);
    var h = editor.renderer.lineHeight / 2;
    return { clientX: pos.pageX, clientY: pos.pageY + h };
}
var editor;
module.exports = {
    setUp: function () {
        this.editor = new Editor(new VirtualRenderer());
        this.editor.session.setValue("Juhu kinners!");
        this.editor.container.style.position = "absolute";
        this.editor.container.style.height = "500px";
        this.editor.container.style.width = "500px";
        this.editor.container.style.left = "50px";
        this.editor.container.style.top = "10px";
        document.body.appendChild(this.editor.container);
        editor = this.editor;
    },
    "test: double tap. issue #956": function () {
        // mouse up fired immediately after mouse down
        this.editor.resize(true);
        var pos = this.editor.renderer.textToScreenCoordinates(0, 1);
        var target = this.editor.renderer.getMouseEventTarget();
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY }));
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY, detail: 2 }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY, detail: 2 }));
        assert.equal(this.editor.getSelectedText(), "Juhu");
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY }));
        assert.equal(this.editor.getSelectedText(), "");
    },
    "test: multiselect": function () {
        var target = this.editor.renderer.getMouseEventTarget();
        this.editor.session.setValue("xyz\n\nabc efg");
        this.editor.resize(true);
        var pos = this.editor.renderer.textToScreenCoordinates(0, 1);
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY }));
        pos = this.editor.renderer.textToScreenCoordinates(0, 2);
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY, ctrl: true }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY }));
        var selection = "Range: [0/2] -> [0/2],Range: [0/1] -> [0/1]";
        assert.equal(this.editor.selection.toJSON() + "", selection);
        pos = this.editor.renderer.textToScreenCoordinates(2, 2);
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY, detail: 2, ctrl: true }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY, detail: 2, ctrl: true }));
        selection = "Range: [2/0] -> [2/3]," + selection;
        assert.equal(this.editor.selection.toJSON() + "", selection);
        var pos = this.editor.renderer.textToScreenCoordinates(0, 1);
        target.dispatchEvent(MouseEvent("down", { x: pos.pageX, y: pos.pageY, ctrl: true }));
        target.dispatchEvent(MouseEvent("up", { x: pos.pageX, y: pos.pageY, ctrl: true }));
        selection = selection.split(",").slice(0, -1).join(",");
        assert.equal(this.editor.selection.toJSON() + "", selection);
        var pos1 = this.editor.renderer.textToScreenCoordinates(0, 2);
        var pos2 = this.editor.renderer.textToScreenCoordinates(2, 2);
        target.dispatchEvent(MouseEvent("down", { x: pos1.pageX, y: pos1.pageY, alt: true }));
        target.dispatchEvent(MouseEvent("move", { x: pos2.pageX, y: pos2.pageY + 1, alt: true }));
        target.dispatchEvent(MouseEvent("up", { x: pos2.pageX, y: pos2.pageY + 1, alt: true }));
        assert.equal(this.editor.selection.toJSON() + "", "Range: [2/2] -> [2/2],Range: [1/0] -> [1/0],Range: [0/2] -> [0/2]");
    },
    "test: gutter": function () {
        var editor = this.editor;
        var value = "x {" + "\n".repeat(50) + "}";
        value = value.repeat(50);
        editor.session.setMode(new Mode());
        editor.setValue(value, -1);
        editor.renderer.$loop._flush();
        var lines = editor.renderer.$gutterLayer.$lines;
        var toggler = lines.cells[0].element.childNodes[1];
        var rect = toggler.getBoundingClientRect();
        if (!rect.left)
            rect.left = 100; // for mockdom
        toggler.dispatchEvent(MouseEvent("down", { x: rect.left, y: rect.top }));
        toggler.dispatchEvent(MouseEvent("up", { x: rect.left, y: rect.top }));
        toggler.dispatchEvent(MouseEvent("click", { x: rect.left, y: rect.top }));
        editor.renderer.$loop._flush();
        assert.ok(/ace_gutter-active-line/.test(lines.cells[0].element.className));
        assert.ok(/ace_closed/.test(toggler.className));
        editor.execCommand("golinedown");
        editor.renderer.$loop._flush();
        assert.notOk(/ace_gutter-active-line/.test(lines.cells[0].element.className));
        assert.ok(/ace_gutter-active-line/.test(lines.cells[1].element.className));
        assert.equal(lines.cells[1].element.textContent, "51");
        // wheel event on toggler
        var e = WheelEvent({ mode: "pixel", y: 100 });
        toggler.dispatchEvent(e);
        editor.renderer.$loop._flush();
        assert.ok(parseInt(lines.cells[0].element.textContent) > 1);
    },
    "test: gutter click on wrapped line": function () {
        var editor = this.editor;
        var value = "x {\n" + "  abc".repeat(100) + "\n}";
        value = value.repeat(10);
        editor.setValue(value, -1);
        editor.setOption("wrap", 40);
        editor.renderer.$loop._flush();
        var lines = editor.renderer.$gutterLayer.$lines;
        var toggler = lines.cells[1].element;
        var rect = toggler.getBoundingClientRect();
        editor.isFocused = function () { return true; };
        editor.focus();
        assert.position(editor.getCursorPosition(), 0, 0);
        toggler.dispatchEvent(MouseEvent("down", { x: rect.left, y: rect.top + rect.height / 2 }));
        editor.renderer.$loop._flush();
        assert.position(editor.getCursorPosition(), 1, 0);
        toggler.dispatchEvent(MouseEvent("up", { x: rect.left, y: rect.top + rect.height }));
        editor.renderer.$loop._flush();
        assert.position(editor.getCursorPosition(), 2, 0);
    },
    "test: wheel": function () {
        var editor = this.editor;
        var lines = editor.renderer.$gutterLayer.$lines;
        editor.setValue("\n".repeat(100), -1);
        editor.renderer.$loop._flush();
        assert.ok(parseInt(lines.cells[0].element.textContent) == 1);
        var e = WheelEvent({ mode: "line", y: 2 });
        editor.container.dispatchEvent(e);
        editor.renderer.$loop._flush();
        assert.ok(parseInt(lines.cells[0].element.textContent) > 1);
        e = WheelEvent({ mode: "line", y: -2 });
        editor.container.dispatchEvent(e);
        editor.renderer.$loop._flush();
        assert.ok(parseInt(lines.cells[0].element.textContent) == 1);
        e = WheelEvent({ mode: "page", y: 1 });
        editor.container.dispatchEvent(e);
        editor.renderer.$loop._flush();
        assert.ok(parseInt(lines.cells[0].element.textContent) > 10);
    },
    "test: touch": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var editor, value, menu, button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = this.editor;
                        value = "x {" + "\n  abc".repeat(10) + "\n}";
                        value = value.repeat(10);
                        editor.setValue(value, -1);
                        editor.setOption("maxLines", 10);
                        editor.setOption("enableMobileMenu", false);
                        editor.renderer.$loop._flush();
                        window.editor = editor;
                        window.sendTouchEvent = sendTouchEvent;
                        // single tap moves cursor
                        sendTouchEvent("start", { touches: [touchPos(2, 1)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(2, 1)] }, editor);
                        editor.renderer.$loop._flush();
                        assert.position(editor.getCursorPosition(), 2, 1);
                        // two finger tap allows to zoom
                        sendTouchEvent("start", { touches: [touchPos(5, 5), touchPos(6, 6)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(5, 5)] }, editor);
                        editor.renderer.$loop._flush();
                        assert.position(editor.getCursorPosition(), 2, 1);
                        // tap and drag near cursor selects
                        sendTouchEvent("start", { touches: [touchPos(2, 1)] }, editor);
                        sendTouchEvent("move", { touches: [touchPos(2, 3)] }, editor);
                        sendTouchEvent("move", { touches: [touchPos(2, 4)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(2, 3)] }, editor);
                        editor.renderer.$loop._flush();
                        assert.equal(editor.getSelectedText(), " ab");
                        // double tap selects the word
                        sendTouchEvent("start", { touches: [touchPos(3, 3)] }, editor);
                        sendTouchEvent("move", { touches: [touchPos(3, 3)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(3, 3)] }, editor);
                        sendTouchEvent("start", { touches: [touchPos(3, 3)] }, editor);
                        sendTouchEvent("move", { touches: [touchPos(3, 3)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(3, 3)] }, editor);
                        editor.renderer.$loop._flush();
                        assert.equal(editor.getSelectedText(), "abc");
                        menu = editor.container.querySelector(".ace_mobile-menu");
                        assert.ok(menu == undefined);
                        editor.setOption("enableMobileMenu", true);
                        sendTouchEvent("end", { touches: [touchPos(3, 3)] }, editor);
                        editor.renderer.$loop._flush();
                        menu = editor.container.querySelector(".ace_mobile-menu");
                        assert.ok(menu != undefined);
                        // mobile menu works
                        sendTouchEvent("start", { touches: [touchPos(3, 3)] }, { container: menu });
                        sendTouchEvent("end", { touches: [touchPos(3, 3)] }, { container: menu });
                        button = editor.container.querySelectorAll(".ace_mobile-button")[1];
                        sendTouchEvent("start", { touches: [touchPos(3, 3)] }, { container: button });
                        sendTouchEvent("end", { touches: [touchPos(3, 3)] }, { container: button });
                        assert.equal(editor.getSelectedText(), "");
                        // tap and drag in other places scrolls
                        sendTouchEvent("start", { touches: [touchPos(8, 3)] }, editor);
                        sendTouchEvent("move", { touches: [touchPos(8, 3)] }, editor);
                        return [4 /*yield*/, lang.sleep(2)];
                    case 1:
                        _a.sent();
                        sendTouchEvent("move", { touches: [touchPos(1, 3)] }, editor);
                        sendTouchEvent("end", { touches: [touchPos(1, 3)] }, editor);
                        editor.renderer.$loop._flush();
                        assert.equal(editor.renderer.getFirstFullyVisibleRow(), 7);
                        // editor animates scrolling
                        return [4 /*yield*/, lang.sleep(50)];
                    case 2:
                        // editor animates scrolling
                        _a.sent();
                        assert.notOk(menu.clientHeight);
                        assert.ok(editor.renderer.getFirstFullyVisibleRow() > 7);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: touch selection with scrollMargin": function () {
        editor.renderer.setScrollMargin(50, 50, 0, 15);
        editor.setValue("Juhu Kinners!");
        editor.renderer.$loop._flush();
        var pos = editor.renderer.textToScreenCoordinates(0, 0);
        assert.equal(pos.pageY - editor.container.getBoundingClientRect().top, 50);
        sendTouchEvent("start", { touches: [touchPos(0, 0)] }, editor);
        sendTouchEvent("move", { touches: [touchPos(0, 5)] }, editor);
        editor.renderer.$loop._flush();
        sendTouchEvent("end", { touches: [touchPos(0, 5)] }, editor);
        editor.renderer.$loop._flush();
        sendTouchEvent("start", { touches: [touchPos(0, 12)] }, editor);
        sendTouchEvent("move", { touches: [touchPos(0, 8)] }, editor);
        editor.renderer.$loop._flush();
        sendTouchEvent("end", { touches: [touchPos(0, 8)] }, editor);
        assert.equal(editor.getSelectedText(), "Kin");
    },
    "test: destroy while mouse is pressed": function () {
        assert.ok(!this.editor.$mouseHandler.releaseMouse);
        var target = this.editor.renderer.getMouseEventTarget();
        target.dispatchEvent(MouseEvent("down", { x: 0, y: 0 }));
        assert.ok(this.editor.$mouseHandler.releaseMouse);
        this.editor.destroy();
        assert.ok(!this.editor.$mouseHandler.releaseMouse);
    },
    tearDown: function () {
        this.editor.destroy();
        document.body.removeChild(this.editor.container);
    }
};
require("../test/run")(module);

});