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
var MockRenderer = require("./test/mockrenderer").MockRenderer;
var assert = require("./test/assertions");
var JavaScriptMode = require("./mode/javascript").Mode;
var PlaceHolder = require("./placeholder").PlaceHolder;
var UndoManager = require("./undomanager").UndoManager;
var lang = require("./lib/lang");
require("./multi_select");
module.exports = {
    "test: simple at the end appending of text": function () {
        var session = new EditSession("var a = 10;\nconsole.log(a, a);", new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), session);
        new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
        editor.moveCursorTo(0, 5);
        editor.insert('b');
        assert.equal(session.doc.getValue(), "var ab = 10;\nconsole.log(ab, ab);");
        editor.insert('cd');
        assert.equal(session.doc.getValue(), "var abcd = 10;\nconsole.log(abcd, abcd);");
        editor.remove('left');
        editor.remove('left');
        editor.remove('left');
        assert.equal(session.doc.getValue(), "var a = 10;\nconsole.log(a, a);");
    },
    "test: inserting text outside placeholder": function () {
        var session = new EditSession("var a = 10;\nconsole.log(a, a);\n", new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), session);
        new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
        editor.moveCursorTo(2, 0);
        editor.insert('b');
        assert.equal(session.doc.getValue(), "var a = 10;\nconsole.log(a, a);\nb");
    },
    "test: insertion at the beginning": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var session, editor, p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = new EditSession("var a = 10;\nconsole.log(a, a);", new JavaScriptMode());
                        editor = new Editor(new MockRenderer(), session);
                        p = new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
                        editor.moveCursorTo(0, 4);
                        editor.insert('$');
                        assert.equal(session.doc.getValue(), "var $a = 10;\nconsole.log($a, $a);");
                        editor.moveCursorTo(0, 4);
                        // Have to put this in a setTimeout because the anchor is only fixed later.
                        return [4 /*yield*/, lang.sleep(20)];
                    case 1:
                        // Have to put this in a setTimeout because the anchor is only fixed later.
                        _a.sent();
                        editor.insert('v');
                        assert.equal(session.doc.getValue(), "var v$a = 10;\nconsole.log(v$a, v$a);");
                        next();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: detaching placeholder": function () {
        var session = new EditSession("var a = 10;\nconsole.log(a, a);", new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), session);
        var p = new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
        editor.moveCursorTo(0, 5);
        editor.insert('b');
        assert.equal(session.doc.getValue(), "var ab = 10;\nconsole.log(ab, ab);");
        p.detach();
        editor.insert('cd');
        assert.equal(session.doc.getValue(), "var abcd = 10;\nconsole.log(ab, ab);");
    },
    "test: events": function () {
        var session = new EditSession("var a = 10;\nconsole.log(a, a);", new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), session);
        var p = new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
        var entered = false;
        var left = false;
        p.on("cursorEnter", function () {
            entered = true;
        });
        p.on("cursorLeave", function () {
            left = true;
        });
        editor.moveCursorTo(0, 0);
        editor.moveCursorTo(0, 4);
        p.onCursorChange(); // Have to do this by hand because moveCursorTo doesn't trigger the event
        assert.ok(entered);
        editor.moveCursorTo(1, 0);
        p.onCursorChange(); // Have to do this by hand because moveCursorTo doesn't trigger the event
        assert.ok(left);
    },
    "test: cancel": function (next) {
        return __awaiter(this, void 0, void 0, function () {
            var session, editor, p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = new EditSession("var a = 10;\nconsole.log(a, a);", new JavaScriptMode());
                        session.setUndoManager(new UndoManager());
                        editor = new Editor(new MockRenderer(), session);
                        p = new PlaceHolder(session, 1, { row: 0, column: 4 }, [{ row: 1, column: 12 }, { row: 1, column: 15 }]);
                        editor.moveCursorTo(0, 5);
                        editor.insert('b');
                        editor.insert('cd');
                        editor.remove('left');
                        assert.equal(session.doc.getValue(), "var abc = 10;\nconsole.log(abc, abc);");
                        // Wait a little for the changes to enter the undo stack
                        return [4 /*yield*/, lang.sleep(80)];
                    case 1:
                        // Wait a little for the changes to enter the undo stack
                        _a.sent();
                        p.cancel();
                        assert.equal(session.doc.getValue(), "var a = 10;\nconsole.log(a, a);");
                        next();
                        return [2 /*return*/];
                }
            });
        });
    }
};
require("./test/run")(module);

});