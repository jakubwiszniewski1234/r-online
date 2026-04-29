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
var assert = require("../test/assertions");
var AceInline = require("./inline").AceInline;
var Editor = require("../ace").Editor;
var EditSession = require("../ace").EditSession;
var VirtualRenderer = require("../ace").VirtualRenderer;
var lang = require("../lib/lang");
var editor;
var editor2;
var inline;
var textBase = "abc123\n\n    ";
var completions = [
    {
        value: "foo",
        score: 4
    },
    {
        value: "function",
        score: 3
    },
    {
        value: "foobar",
        score: 2
    },
    {
        snippet: "function foo() {\n    console.log('test');\n}",
        score: 1
    },
    {
        snippet: "foobar2",
        score: 0
    },
    {
        value: "f should not show inline",
        score: 0,
        hideInlinePreview: true
    },
    {
        value: "long\nlong\nlong\nlong\nlong\nlong",
        score: 0
    },
    {
        value: "long\nlong\nlong\nlong\nlong\nlong".repeat(100),
        score: 0
    },
    {
        value: "foo suggestion with a\n\n\ngap",
        score: 0
    }
];
var getAllLines = function (editorOverride) {
    editorOverride = editorOverride || editor;
    return Array.from(editorOverride.renderer.$textLayer.element.childNodes).map(function (node) {
        return node.textContent;
    }).join("\n");
};
var createEditor = function (element) {
    var renderer = new VirtualRenderer(element);
    var session = new EditSession("");
    return new Editor(renderer, session);
};
module.exports = {
    setUp: function () {
        var el = document.createElement("div");
        el.style.left = "20px";
        el.style.top = "30px";
        el.style.width = "500px";
        el.style.height = "500px";
        document.body.appendChild(el);
        editor = createEditor(el);
        editor.execCommand("insertstring", textBase + "f");
        inline = new AceInline();
        editor.getSelection().moveCursorFileEnd();
        editor.renderer.$loop._flush();
    },
    "test: displays the ghost text in the editor on show": function () {
        inline.show(editor, completions[0], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "foo");
    },
    "test: replaces the ghost text in the editor with the latest show": function () {
        inline.show(editor, completions[0], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "foo");
        inline.show(editor, completions[1], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "function");
    },
    "test: renders multi-line ghost text indentation": function () {
        assert.equal(editor.renderer.$ghostTextWidget, null);
        inline.show(editor, completions[3], "f");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "function foo() {");
        assert.strictEqual(editor.renderer.$ghostTextWidget.el.innerHTML, "<div><span class=\"ace_ghost_text\">        console.log('test');</span></div><div><span class=\"ace_ghost_text\">    }</span><span></span></div>");
    },
    "test: boundary tests": function () {
        var noRenderTestCases = [
            [null, null, null],
            [editor, null, null],
            [editor, null, ""],
            [null, completions[3], ""]
        ];
        var result;
        noRenderTestCases.forEach(function (params) {
            result = inline.show(params[0], params[1], params[2]);
            editor.renderer.$loop._flush();
            assert.notOk(result);
            assert.equal(editor.renderer.$ghostText, null);
            assert.equal(editor.renderer.$ghostTextWidget, null);
        });
        var renderTestCases = [
            [editor, completions[1], undefined],
            [editor, completions[1], null],
            [editor, completions[1], ""]
        ];
        renderTestCases.forEach(function (params) {
            result = inline.show(params[0], params[1], params[2]);
            editor.renderer.$loop._flush();
            assert.ok(result);
            assert.strictEqual(editor.renderer.$ghostText.text, "function");
            assert.strictEqual(getAllLines(), textBase + "ffunction");
            assert.equal(editor.renderer.$ghostTextWidget, null);
        });
        result = inline.show(editor, completions[0], "foo");
        editor.renderer.$loop._flush();
        assert.ok(result);
        assert.equal(editor.renderer.$ghostText, null);
        assert.equal(editor.renderer.$ghostTextWidget, null);
    },
    "test: only renders the ghost text without the prefix": function () {
        inline.show(editor, completions[1], "fun");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "fction");
    },
    "test: verify explicit and implicit hide": function () {
        inline.show(editor, completions[1], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "function");
        assert.strictEqual(inline.isOpen(), true);
        inline.hide();
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "f");
        assert.strictEqual(inline.isOpen(), false);
        inline.show(editor, completions[1], "function");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "f");
        assert.strictEqual(inline.isOpen(), false);
    },
    "test: does not hide previous ghost text if cannot show current one": function () {
        inline.show(editor, completions[1], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "function");
        assert.strictEqual(inline.isOpen(), true);
        inline.show(editor, null, "");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "function");
        assert.strictEqual(inline.isOpen(), true);
        inline.hide();
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "f");
        assert.strictEqual(inline.isOpen(), false);
    },
    "test: removes ghost text from previous editor if new valid editor is passed to show function": function () {
        var el = document.createElement("div");
        el.style.left = "520px";
        el.style.top = "530px";
        el.style.width = "500px";
        el.style.height = "500px";
        document.body.appendChild(el);
        editor2 = createEditor(el);
        var editor2Text = "different text\n\n    f";
        editor2.execCommand("insertstring", editor2Text);
        inline.show(editor, completions[1], "f");
        editor.renderer.$loop._flush();
        editor2.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "function");
        assert.strictEqual(getAllLines(editor2), editor2Text);
        assert.strictEqual(inline.isOpen(), true);
        inline.show(editor2, completions[2], "f");
        editor.renderer.$loop._flush();
        editor2.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "f");
        assert.strictEqual(getAllLines(editor2), editor2Text + "oobar");
        assert.strictEqual(inline.isOpen(), true);
        inline.show(null, completions[2], "f");
        editor.renderer.$loop._flush();
        editor2.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "f");
        assert.strictEqual(getAllLines(editor2), editor2Text + "oobar");
        assert.strictEqual(inline.isOpen(), true);
    },
    "test: verify destroy": function () {
        inline.show(editor, completions[0], "f");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "foo");
        inline.destroy();
        editor.renderer.$loop._flush();
        assert.strictEqual(inline.isOpen(), false);
        assert.strictEqual(getAllLines(), textBase + "f");
        inline.destroy();
        editor.renderer.$loop._flush();
        assert.strictEqual(inline.isOpen(), false);
        assert.strictEqual(getAllLines(), textBase + "f");
        inline.hide();
        editor.renderer.$loop._flush();
        assert.strictEqual(inline.isOpen(), false);
        assert.strictEqual(getAllLines(), textBase + "f");
    },
    "test: should respect hideInlinePreview": function () {
        // By default, this option is set to hide.
        inline.show(editor, completions[5], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "f");
        assert.strictEqual(inline.isOpen(), false);
        inline.hide();
        editor.renderer.$loop._flush();
        // Now it should be shown.
        completions[5].hideInlinePreview = false;
        inline.show(editor, completions[5], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "f should not show inline");
        assert.strictEqual(inline.isOpen(), true);
        inline.hide();
        editor.renderer.$loop._flush();
        // Now it should be shown.
        completions[5].hideInlinePreview = undefined;
        inline.show(editor, completions[5], "f");
        editor.renderer.$loop._flush();
        assert.equal(getAllLines(), textBase + "f should not show inline");
        assert.strictEqual(inline.isOpen(), true);
        inline.hide();
        editor.renderer.$loop._flush();
        // Reset to state before test.
        completions[5].hideInlinePreview = true;
    },
    "test: should scroll if inline preview outside": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var deltaY, row, initialScrollBy, initialScrollToRow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Fill the editor with new lines to get the cursor to the bottom
                        // of the container
                        editor.execCommand("insertstring", "\n".repeat(200));
                        initialScrollBy = editor.renderer.scrollBy;
                        initialScrollToRow = editor.renderer.scrollToRow;
                        editor.renderer.scrollBy = function (_, varY) {
                            deltaY = varY;
                        };
                        editor.renderer.scrollToRow = function (varRow) {
                            row = varRow;
                        };
                        inline.show(editor, completions[6], "l");
                        editor.renderer.$loop._flush();
                        return [4 /*yield*/, lang.sleep(50)];
                    case 1:
                        _a.sent();
                        // Should scroll 5 lines to get the inline preview into view
                        assert.strictEqual(deltaY, 50);
                        inline.hide();
                        editor.renderer.$loop._flush();
                        inline.show(editor, completions[7], "l");
                        editor.renderer.$loop._flush();
                        return [4 /*yield*/, lang.sleep(50)];
                    case 2:
                        _a.sent();
                        // Should scroll as much as possbile while keeping the cursor on screen
                        assert.strictEqual(row, 202);
                        editor.renderer.scrollBy = initialScrollBy;
                        editor.renderer.scrollToRow = initialScrollToRow;
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: renders multi-line ghost text with empty lines": function () {
        assert.equal(editor.renderer.$ghostTextWidget, null);
        inline.show(editor, completions[8], "f");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase + "foo suggestion with a");
        assert.strictEqual(editor.renderer.$ghostTextWidget.el.innerHTML, "<div><span class=\"ace_ghost_text\"> </span></div><div><span class=\"ace_ghost_text\"> </span></div><div><span class=\"ace_ghost_text\">gap</span><span></span></div>");
    },
    "test: moves tokens to the right of cursor to the end of ghost text for multi line ghost text": function () {
        editor.execCommand("removetolinestarthard");
        editor.execCommand("insertstring", "f hi I should be hidden");
        editor.execCommand("gotolinestart");
        editor.execCommand("gotoright");
        editor.renderer.$loop._flush();
        assert.equal(editor.renderer.$ghostTextWidget, null);
        inline.show(editor, completions[8], "f");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase.replaceAll(" ", "") + "foo suggestion with a hi I should be hidden");
        // The string to the right of the cursor should be hidden tokens now.
        var tokens = editor.session.getTokens(2);
        assert.strictEqual(tokens[2].value, " hi I should be hidden");
        assert.strictEqual(tokens[2].type, "hidden_token");
        // And should be added to the ghost text widget.
        assert.strictEqual(editor.renderer.$ghostTextWidget.el.textContent, "  gap hi I should be hidden");
        // Hide inline
        inline.hide();
        editor.renderer.$loop._flush();
        assert.equal(editor.renderer.$ghostTextWidget, null);
        // Text to the right of the cursor should be tokenized normally again.
        var tokens = editor.session.getTokens(2);
        assert.strictEqual(tokens[0].value, "f hi I should be hidden");
        assert.strictEqual(tokens[0].type, "text");
    },
    "test: moves tokens to the right of cursor to the end of ghost text for multi line ghost text when triggered inside token": function () {
        editor.execCommand("removetolinestarthard");
        editor.execCommand("insertstring", "fhi I should be hidden");
        editor.execCommand("gotolinestart");
        editor.execCommand("gotoright");
        editor.renderer.$loop._flush();
        assert.equal(editor.renderer.$ghostTextWidget, null);
        inline.show(editor, completions[8], "f");
        editor.renderer.$loop._flush();
        assert.strictEqual(getAllLines(), textBase.replaceAll(" ", "") + "foo suggestion with ahi I should be hidden");
        // The string to the right of the cursor should be hidden tokens now.
        var tokens = editor.session.getTokens(2);
        assert.strictEqual(tokens[2].value, "hi I should be hidden");
        assert.strictEqual(tokens[2].type, "hidden_token");
        // And should be added to the ghost text widget.
        assert.strictEqual(editor.renderer.$ghostTextWidget.el.textContent, "  gaphi I should be hidden");
        // Hide inline
        inline.hide();
        editor.renderer.$loop._flush();
        assert.equal(editor.renderer.$ghostTextWidget, null);
        // Text to the right of the cursor should be tokenized normally again.
        var tokens = editor.session.getTokens(2);
        assert.strictEqual(tokens[0].value, "fhi I should be hidden");
        assert.strictEqual(tokens[0].type, "text");
    },
    tearDown: function () {
        inline.destroy();
        editor.destroy();
        if (editor2) {
            editor2.destroy();
        }
    }
};
require("../test/run")(module);

});