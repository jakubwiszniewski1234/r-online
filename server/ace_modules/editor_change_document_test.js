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
var EditSession = require("./edit_session").EditSession;
var Editor = require("./editor").Editor;
var Text = require("./mode/text").Mode;
var JavaScriptMode = require("./mode/javascript").Mode;
var CssMode = require("./mode/css").Mode;
var HtmlMode = require("./mode/html").Mode;
var MockRenderer = require("./test/mockrenderer").MockRenderer;
var assert = require("./test/assertions");
var lang = require("./lib/lang");
module.exports = {
    setUp: function () {
        this.session1 = new EditSession(["abc", "def"]);
        this.session2 = new EditSession(["ghi", "jkl"]);
        this.editor = new Editor(new MockRenderer());
    },
    "test: change document": function () {
        this.editor.setSession(this.session1);
        assert.equal(this.editor.getSession(), this.session1);
        this.editor.setSession(this.session2);
        assert.equal(this.editor.getSession(), this.session2);
    },
    "test: only changes to the new document should have effect": function () {
        var called = false;
        this.editor.onDocumentChange = function () {
            called = true;
        };
        this.editor.setSession(this.session1);
        this.editor.setSession(this.session2);
        this.session1.duplicateLines(0, 0);
        assert.notOk(called);
        this.session2.duplicateLines(0, 0);
        assert.ok(called);
    },
    "test: should use cursor of new document": function () {
        this.session1.getSelection().moveCursorTo(0, 1);
        this.session2.getSelection().moveCursorTo(1, 0);
        this.editor.setSession(this.session1);
        assert.position(this.editor.getCursorPosition(), 0, 1);
        this.editor.setSession(this.session2);
        assert.position(this.editor.getCursorPosition(), 1, 0);
    },
    "test: only changing the cursor of the new doc should not have an effect": function () {
        this.editor.onCursorChange = function () {
            called = true;
        };
        this.editor.setSession(this.session1);
        this.editor.setSession(this.session2);
        assert.position(this.editor.getCursorPosition(), 0, 0);
        var called = false;
        this.session1.getSelection().moveCursorTo(0, 1);
        assert.position(this.editor.getCursorPosition(), 0, 0);
        assert.notOk(called);
        this.session2.getSelection().moveCursorTo(1, 1);
        assert.position(this.editor.getCursorPosition(), 1, 1);
        assert.ok(called);
    },
    "test: should use selection of new document": function () {
        this.session1.getSelection().selectTo(0, 1);
        this.session2.getSelection().selectTo(1, 0);
        this.editor.setSession(this.session1);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 1);
        this.editor.setSession(this.session2);
        assert.position(this.editor.getSelection().getSelectionLead(), 1, 0);
    },
    "test: only changing the selection of the new doc should not have an effect": function () {
        this.editor.onSelectionChange = function () {
            called = true;
        };
        this.editor.setSession(this.session1);
        this.editor.setSession(this.session2);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 0);
        var called = false;
        this.session1.getSelection().selectTo(0, 1);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 0);
        assert.notOk(called);
        this.session2.getSelection().selectTo(1, 1);
        assert.position(this.editor.getSelection().getSelectionLead(), 1, 1);
        assert.ok(called);
    },
    "test: should use mode of new document": function () {
        this.editor.onChangeMode = function () {
            called = true;
        };
        this.editor.setSession(this.session1);
        this.editor.setSession(this.session2);
        var called = false;
        this.session1.setMode(new Text());
        assert.notOk(called);
        this.session2.setMode(new JavaScriptMode());
        assert.ok(called);
    },
    "test: should use stop worker of old document": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        // 1. Open an editor and set the session to CssMode
                        self.editor.setSession(self.session1);
                        self.session1.setMode(new CssMode());
                        // 2. Add a line or two of valid CSS.
                        self.session1.setValue("DIV { color: red; }");
                        // 3. Clear the session value.
                        self.session1.setValue("");
                        // 4. Set the session to HtmlMode
                        self.session1.setMode(new HtmlMode());
                        // 5. Try to type valid HTML
                        self.session1.insert({ row: 0, column: 0 }, "<html></html>");
                        return [4 /*yield*/, lang.sleep(600)];
                    case 1:
                        _a.sent();
                        assert.equal(Object.keys(self.session1.getAnnotations()).length, 0);
                        next();
                        return [2 /*return*/];
                }
            });
        });
    }
};
require("./test/run")(module);

});