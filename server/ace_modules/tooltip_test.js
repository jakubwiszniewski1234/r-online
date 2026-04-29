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
/*global CustomEvent*/
if (typeof process !== "undefined") {
    require("./test/mockdom");
}
"use strict";
var ace = require("./ace");
var assert = require("./test/assertions");
var HoverTooltip = require("./tooltip").HoverTooltip;
var Range = require("./range").Range;
var dom = require("./lib/dom");
var lang = require("./lib/lang");
var editor, docTooltip;
module.exports = {
    setUp: function () {
        docTooltip = new HoverTooltip();
        editor = ace.edit(null, {
            value: "Hello empty world"
        });
        document.body.appendChild(editor.container);
        editor.container.style.height = "200px";
        editor.container.style.width = "300px";
        editor.container.style.position = "absolute";
        docTooltip.setDataProvider(function (e, editor) {
            var session = editor.session;
            var docPos = e.getDocumentPosition();
            var range = session.getWordRange(docPos.row, docPos.column);
            var domNode = document.createElement("span");
            domNode.textContent = "tooltip " + range;
            domNode.className = "doc-tooltip";
            docTooltip.showForRange(editor, range, domNode, e);
        });
    },
    tearDown: function () {
        editor.destroy();
        docTooltip.destroy();
        editor = docTooltip = null;
    },
    "test: show doc tooltip": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        docTooltip.addToEditor(editor);
                        editor.resize(true);
                        docTooltip.idleTime = 3;
                        mouse("move", { row: 0, column: 1 });
                        return [4 /*yield*/, lang.sleep(6)];
                    case 1:
                        _a.sent();
                        nodes = document.querySelectorAll(".doc-tooltip");
                        assert.equal(nodes.length, 1);
                        assert.equal(nodes[0].textContent, "tooltip Range: [0/0] -> [0/5]");
                        assert.equal(docTooltip.$element.style.display, "block");
                        mouse("move", { row: 0, column: 9 });
                        assert.equal(docTooltip.$element.style.display, "none");
                        return [4 /*yield*/, lang.sleep(6)];
                    case 2:
                        _a.sent();
                        assert.equal(docTooltip.$element.textContent, "tooltip Range: [0/6] -> [0/11]");
                        assert.equal(docTooltip.$element.style.display, "block");
                        mouse("down", docTooltip.$element, { button: 0 });
                        mouse("up", docTooltip.$element, { button: 0 });
                        assert.equal(docTooltip.$element.style.display, "block");
                        mouse("down", { row: 0, column: 8 }, { button: 0 });
                        assert.ok(editor.$mouseHandler.isMousePressed);
                        assert.equal(docTooltip.$element.style.display, "none");
                        return [4 /*yield*/, lang.sleep(6)];
                    case 3:
                        _a.sent();
                        assert.equal(docTooltip.$element.style.display, "none");
                        assert.ok(editor.$mouseHandler.isMousePressed);
                        mouse("move", { row: 0, column: 13 }, { which: 1 });
                        assert.ok(editor.$mouseHandler.isMousePressed);
                        return [4 /*yield*/, lang.sleep(6)];
                    case 4:
                        _a.sent();
                        assert.equal(docTooltip.$element.style.display, "none");
                        mouse("up", { row: 0, column: 13 });
                        assert.ok(!editor.$mouseHandler.isMousePressed);
                        docTooltip.idleTime = 20;
                        assert.ok(!docTooltip.timeout);
                        mouse("move", { row: 0, column: 1 });
                        assert.ok(docTooltip.timeout);
                        docTooltip.lastT = Date.now();
                        docTooltip.waitForHover();
                        assert.equal(docTooltip.$element.style.display, "none");
                        mouse("move", { row: 0, column: 13 });
                        docTooltip.lastT = Date.now() - docTooltip.idleTime;
                        docTooltip.waitForHover();
                        assert.equal(docTooltip.$element.style.display, "block");
                        assert.equal(docTooltip.$element.textContent, "tooltip Range: [0/12] -> [0/17]");
                        mouse("out", docTooltip.$element, { relatedTarget: document.body });
                        assert.equal(docTooltip.$element.style.display, "none");
                        assert.ok(!docTooltip.timeout);
                        docTooltip.idleTime = 3;
                        mouse("move", editor.container);
                        return [4 /*yield*/, lang.sleep(6)];
                    case 5:
                        _a.sent();
                        mouse("move", { row: 0, column: 13 });
                        assert.equal(docTooltip.$element.style.display, "none");
                        return [4 /*yield*/, lang.sleep(6)];
                    case 6:
                        _a.sent();
                        assert.equal(docTooltip.$element.style.display, "block");
                        assert.equal(docTooltip.$element.textContent, "tooltip Range: [0/12] -> [0/17]");
                        mouse("move", editor.renderer.scroller);
                        assert.equal(docTooltip.$element.style.display, "none");
                        next();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: find best position": function () {
        editor.resize(true);
        editor.setValue("very long text ".repeat(100), 1);
        editor.renderer.scrollCursorIntoView();
        var domNode = dom.buildDom(["div"]);
        var w = window.innerWidth;
        var h = window.innerHeight;
        editor.resize(true);
        // workaround for css styles not being applied in mockdom
        docTooltip.$element.style.maxWidth = "300px";
        // prefer showing above if possible
        editor.container.style.top = 20 + "px";
        editor.container.style.top = h / 3 + "px";
        domNode.style.width = 2 * w + "px";
        domNode.style.height = h / 4 + "px";
        var range = new Range(0, 0, 0, editor.session.getLine(0).length);
        docTooltip.showForRange(editor, range, domNode);
        var position = editor.renderer.textToScreenCoordinates(range.start.row, range.start.column);
        assert.ok(position.pageX < 0);
        var rect = docTooltip.$element.getBoundingClientRect();
        assert.ok(rect.left > 0);
        assert.ok(rect.top < h / 3);
        // show below if height is large
        domNode.style.height = 2 * h + "px";
        docTooltip.showForRange(editor, range, domNode);
        rect = docTooltip.$element.getBoundingClientRect();
        assert.ok(rect.top > h / 3);
        // show above if there is more space there
        editor.container.style.top = h / 2 + "px";
        domNode.style.height = 2 * h + "px";
        docTooltip.showForRange(editor, range, domNode);
        rect = docTooltip.$element.getBoundingClientRect();
        assert.ok(rect.top < h / 3);
        editor.container.style.left = w - 20 + "px";
        docTooltip.showForRange(editor, range, domNode);
        rect = docTooltip.$element.getBoundingClientRect();
        assert.ok(rect.left < w - 100);
    },
    "test: remove listeners": function () {
        var l = editor._eventRegistry.mousemove.length;
        docTooltip.addToEditor(editor);
        assert.ok(!docTooltip.timeout);
        assert.equal(editor._eventRegistry.mousemove.length, l + 1);
        mouse("move", { row: 0, column: 1 });
        assert.ok(docTooltip.timeout);
        docTooltip.removeFromEditor(editor);
        assert.ok(!docTooltip.timeout);
        assert.equal(editor._eventRegistry.mousemove.length, l);
    }
};
function mouse(type, pos, properties) {
    var target = editor.renderer.getMouseEventTarget();
    var event = new CustomEvent("mouse" + type, { bubbles: true });
    if ("row" in pos) {
        var pagePos = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
        event.clientX = pagePos.pageX;
        event.clientY = pagePos.pageY;
    }
    else {
        target = pos;
        var rect = target.getBoundingClientRect();
        event.clientX = rect.left + rect.width / 2;
        event.clientY = rect.top + rect.height / 2;
    }
    Object.assign(event, properties);
    target.dispatchEvent(event);
}
require("./test/run")(module);

});