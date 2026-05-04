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
var sendKey = require("./test/user").type;
var ace = require("./ace");
var assert = require("./test/assertions");
var user = require("./test/user");
var Range = require("./range").Range;
var lang = require("./lib/lang");
require("./ext/language_tools");
var Autocomplete = require("./autocomplete").Autocomplete;
var config = require("./config");
var MouseEvent = function (type, opts) {
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(/click|wheel/.test(type) ? type : "mouse" + type, true, true, window, opts.detail, opts.x, opts.y, opts.x, opts.y, opts.ctrl, opts.alt, opts.shift, opts.meta, opts.button || 0, opts.relatedTarget);
    return e;
};
var editor;
function initEditor(value) {
    if (editor) {
        editor.destroy();
        editor.container.remove();
        editor = null;
    }
    editor = ace.edit(null, {
        value: value,
        minLines: 10,
        maxLines: 10,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    });
    document.body.appendChild(editor.container);
    editor.focus();
    return editor;
}
var slowCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var completions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        completions = [
                            {
                                caption: "slow option 1",
                                value: "s1",
                                score: 3
                            }, {
                                caption: "slow option 2",
                                value: "s2",
                                score: 0
                            }
                        ];
                        return [4 /*yield*/, lang.sleep(200)];
                    case 1:
                        _a.sent();
                        callback(null, completions);
                        return [2 /*return*/];
                }
            });
        });
    }
};
var fastCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        var completions = [
            {
                caption: "fast option 1",
                value: "f1",
                score: 2
            }, {
                caption: "fast option 2",
                value: "f2",
                score: 1
            }, {
                caption: "fast option 3",
                value: "f3",
                score: 1
            }
        ];
        callback(null, completions);
    }
};
module.exports = {
    tearDown: function () {
        if (editor) {
            editor.destroy();
            editor.container.remove();
            editor = null;
        }
    },
    "test: highlighting in the popup": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function checkInnerHTML(expected) {
                return __awaiter(this, void 0, void 0, function () {
                    var popup, innerHTML;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                popup = editor.completer.popup;
                                _a.label = 1;
                            case 1: return [4 /*yield*/, popup.renderer.once("afterRender")];
                            case 2:
                                _a.sent();
                                innerHTML = popup.renderer.$textLayer.element.innerHTML
                                    .replace(/\s*style="[^"]+"|class=|(d)iv|(s)pan/g, "$1$2");
                                _a.label = 3;
                            case 3:
                                if (innerHTML == last) return [3 /*break*/, 1];
                                _a.label = 4;
                            case 4:
                                assert.equal(innerHTML, expected);
                                last = innerHTML;
                                return [2 /*return*/];
                        }
                    });
                });
            }
            var last;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("\narraysort alooooooooooooooooooooooooooooong_word");
                        assert.ok(!editor.container.querySelector("style"));
                        sendKey("a");
                        return [4 /*yield*/, checkInnerHTML('<d "ace_line ace_selected" role="option" aria-roledescription="item" aria-setsize="2" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="arraysort, local" id="suggest-aria-id:0" aria-selected="true"><s "ace_completion-highlight" role="mark">a</s><s "ace_">rraysort</s><s "ace_completion-spacer"> </s><s "ace_completion-meta">local</s></d><d "ace_line" role="option" aria-roledescription="item" aria-setsize="2" aria-describedby="doc-tooltip" aria-posinset="2" aria-label="alooooooooooooooooooooooooooooong_word, local"><s "ace_completion-highlight" role="mark">a</s><s "ace_">looooooooooooooooooooooooooooong_word</s><s "ace_completion-spacer"> </s><s "ace_completion-meta">local</s></d>')];
                    case 1:
                        _a.sent();
                        sendKey("rr");
                        return [4 /*yield*/, checkInnerHTML('<d "ace_line ace_selected" role="option" aria-roledescription="item" aria-setsize="1" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="arraysort, local" id="suggest-aria-id:0" aria-selected="true"><s "ace_completion-highlight" role="mark">arr</s><s "ace_">aysort</s><s "ace_completion-spacer"> </s><s "ace_completion-meta">local</s></d>')];
                    case 2:
                        _a.sent();
                        sendKey("r");
                        return [4 /*yield*/, checkInnerHTML('<d "ace_line ace_selected" role="option" aria-roledescription="item" aria-setsize="1" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="arraysort, local" id="suggest-aria-id:0" aria-selected="true"><s "ace_completion-highlight" role="mark">arr</s><s "ace_">ayso</s><s "ace_completion-highlight" role="mark">r</s><s "ace_">t</s><s "ace_completion-spacer"> </s><s "ace_completion-meta">local</s></d>')];
                    case 3:
                        _a.sent();
                        sendKey("Return");
                        assert.equal(editor.getValue(), "arraysort\narraysort alooooooooooooooooooooooooooooong_word");
                        editor.execCommand("insertstring", " looooooooooooooooooooooooooooong_");
                        return [4 /*yield*/, checkInnerHTML('<d "ace_line ace_selected" role="option" aria-roledescription="item" aria-setsize="1" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="alooooooooooooooooooooooooooooong_word, local" id="suggest-aria-id:0" aria-selected="true"><s "ace_">a</s><s "ace_completion-highlight" role="mark">looooooooooooooooooooooooooooong_</s><s "ace_">word</s><s "ace_completion-spacer"> </s><s "ace_completion-meta">local</s></d>')];
                    case 4:
                        _a.sent();
                        sendKey("Return");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: completions range and command properties": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("goods ");
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "will",
                                            snippet: "will: $1",
                                            meta: "snippet",
                                            command: "startAutocomplete",
                                            range: new Range(0, 4, 0, 7)
                                        }, {
                                            caption: "here",
                                            value: "-here",
                                            range: new Range(0, 8, 0, 10)
                                        }
                                    ];
                                    callback(null, completions);
                                }
                            }
                        ];
                        editor.moveCursorTo(0, 6);
                        sendKey("w");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 1);
                        editor.onCommandKey(null, 0, 13);
                        assert.equal(popup.data.length, 2);
                        assert.equal(editor.getValue(), "goodwill: ");
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 2:
                        _a.sent();
                        editor.onCommandKey(null, 0, 13);
                        assert.equal(editor.getValue(), "goodwill-here");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: correct completion replacement range when completion prefix has more than one letter": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("<");
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "div",
                                            value: "div",
                                            range: new Range(0, 1, 0, 3)
                                        }, {
                                            caption: "dialog",
                                            value: "dialog",
                                            range: new Range(0, 1, 0, 3)
                                        }
                                    ];
                                    callback(null, completions);
                                }
                            }
                        ];
                        editor.moveCursorTo(0, 1);
                        sendKey("di");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, lang.sleep(10)];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 2);
                        editor.onCommandKey(null, 0, 13);
                        return [4 /*yield*/, lang.sleep(10)];
                    case 2:
                        _a.sent();
                        assert.equal(editor.getValue(), "<dialog");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: symbols after selection are not removed when replacement range is present": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("{}");
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "apple",
                                            snippet: "apple: $1",
                                            meta: "snippet",
                                            range: new Range(0, 1, 0, 2)
                                        }, {
                                            caption: "pineapple",
                                            value: "pineapple",
                                            range: new Range(0, 1, 0, 2)
                                        }
                                    ];
                                    callback(null, completions);
                                }
                            }
                        ];
                        editor.moveCursorTo(0, 1);
                        sendKey("a");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 2);
                        editor.onCommandKey(null, 0, 13);
                        assert.equal(editor.getValue(), "{apple: }");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should set correct aria attributes for popup items": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function checkAria(htmlElement, expected) {
                var actual = htmlElement.replace(/\s*style="[^"]+"|class="[^"]+"|(d)iv|(s)pan/g, "$1$2");
                return actual === expected;
            }
            var newLineCharacter, popup, prevSelected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        newLineCharacter = editor.session.doc.getNewLineCharacter();
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = Array(10).fill(null).map(function (i, n) { return { caption: String(n), value: String(n) }; });
                                    callback(null, completions);
                                },
                                triggerCharacters: [".", newLineCharacter]
                            }
                        ];
                        sendKey('Return');
                        popup = editor.completer.popup;
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 10);
                        // check that the aria attributes have been set on  all the elements of the popup and that aria selected attributes are set on the first item
                        assert.ok(checkAria(popup.renderer.$textLayer.element.innerHTML, '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="0" id="suggest-aria-id:0" aria-selected="true"><s >0</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="2" aria-label="1"><s >1</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="3" aria-label="2"><s >2</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="4" aria-label="3"><s >3</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="5" aria-label="4"><s >4</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="6" aria-label="5"><s >5</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="7" aria-label="6"><s >6</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="8" aria-label="7"><s >7</s><s > </s></d>'
                            + '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="9" aria-label="8"><s >8</s><s > </s></d>'));
                        prevSelected = popup.selectedNode;
                        sendKey('Down');
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 2:
                        _a.sent();
                        assert.ok(checkAria(popup.selectedNode.outerHTML, '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="2" aria-label="1" id="suggest-aria-id:1" aria-selected="true"><s >1</s><s > </s></d>'));
                        // check that the aria selected attributes have been removed from the previously selected element
                        assert.ok(checkAria(prevSelected.outerHTML, '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="1" aria-label="0"><s >0</s><s > </s></d>'));
                        sendKey('Down');
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 3:
                        _a.sent();
                        assert.ok(checkAria(popup.selectedNode.outerHTML, '<d  role="option" aria-roledescription="item" aria-setsize="10" aria-describedby="doc-tooltip" aria-posinset="3" aria-label="2" id="suggest-aria-id:2" aria-selected="true"><s >2</s><s > </s></d>'));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: different completers tooltips": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var firstDoc, secondDoc, popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        firstDoc = "<b>First</b>";
                        secondDoc = "Second";
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "abc",
                                            snippet: "ab: $1",
                                            meta: "snippet",
                                            completerId: "firstCompleter"
                                        }, {
                                            caption: "cde",
                                            value: "cde",
                                            completerId: "firstCompleter"
                                        }
                                    ];
                                    callback(null, completions);
                                },
                                getDocTooltip: function (item) {
                                    if (!item.docHTML) {
                                        item.docHTML = firstDoc;
                                    }
                                },
                                id: "firstCompleter"
                            }, {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "abcd",
                                            snippet: "abcd: $1",
                                            meta: "snippet",
                                            completerId: "secondCompleter"
                                        }, {
                                            caption: "cdef",
                                            value: "cdef",
                                            completerId: "secondCompleter"
                                        }
                                    ];
                                    callback(null, completions);
                                },
                                getDocTooltip: function (item) {
                                    if (!item.docText) {
                                        item.docText = secondDoc;
                                    }
                                },
                                id: "secondCompleter"
                            }
                        ];
                        sendKey("c");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, lang.sleep(10)];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 4);
                        assert.equal(popup.container.lastChild.innerHTML, firstDoc);
                        sendKey("Down");
                        return [4 /*yield*/, lang.sleep(10)];
                    case 2:
                        _a.sent();
                        assert.equal(popup.container.lastChild.innerHTML, secondDoc);
                        sendKey("Down");
                        return [4 /*yield*/, lang.sleep(10)];
                    case 3:
                        _a.sent();
                        assert.equal(popup.container.lastChild.innerHTML, firstDoc);
                        sendKey("Down");
                        return [4 /*yield*/, lang.sleep(10)];
                    case 4:
                        _a.sent();
                        assert.equal(popup.container.lastChild.innerHTML, secondDoc);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: completers tooltip filtering": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var firstDoc, secondDoc, popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        firstDoc = "First tooltip";
                        secondDoc = "Second tooltip";
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "case",
                                            value: "case"
                                        }, {
                                            caption: "catch",
                                            value: "catch"
                                        }
                                    ];
                                    callback(null, completions);
                                },
                                getDocTooltip: function (item) {
                                    if (item.value === 'case') {
                                        item.docHTML = firstDoc;
                                    }
                                    if (item.value === 'catch') {
                                        item.docHTML = secondDoc;
                                    }
                                }
                            }
                        ];
                        sendKey("ca");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, lang.sleep(10)];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 2);
                        assert.equal(popup.container.lastChild.innerHTML, firstDoc);
                        sendKey("t");
                        return [4 /*yield*/, lang.sleep(10)];
                    case 2:
                        _a.sent();
                        assert.equal(popup.data.length, 1);
                        assert.equal(popup.container.lastChild.innerHTML, secondDoc);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: slow and fast completers": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var syncCompleter, asyncCompleter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        syncCompleter = {
                            getCompletions: function (editor, session, pos, prefix, callback) {
                                callback(null, [{
                                        value: "test"
                                    }]);
                            },
                            id: "asyncCompleter"
                        };
                        asyncCompleter = {
                            getCompletions: function (editor, session, pos, prefix, callback) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, lang.sleep(10)];
                                            case 1:
                                                _a.sent();
                                                callback(null, [
                                                    {
                                                        value: "some"
                                                    }
                                                ]);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            id: "asyncCompleter"
                        };
                        editor = initEditor("");
                        editor.completers = [
                            syncCompleter, asyncCompleter
                        ];
                        editor.resize(true);
                        editor.execCommand("insertstring", "o");
                        assert.notOk(!!editor.completer.popup);
                        return [4 /*yield*/, lang.sleep(10)];
                    case 1:
                        _a.sent();
                        assert.ok(editor.completer.popup.isOpen);
                        assert.equal(editor.completer.popup.renderer.scrollTop, 0);
                        editor.completer.popup.renderer.$loop._flush();
                        assert.equal(editor.completer.popup.renderer.scrollTop, 0);
                        assert.equal(editor.completer.popup.renderer.scroller.textContent, "some ");
                        sendKey("Return");
                        assert.equal(editor.getValue(), "some");
                        sendKey(" ");
                        assert.equal(editor.completer.popup.isOpen, false);
                        sendKey("t");
                        assert.equal(editor.completer.popup.isOpen, true);
                        sendKey("Return");
                        sendKey(" ");
                        sendKey("q");
                        assert.equal(editor.completer.popup.isOpen, false);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: trigger autocomplete for specific characters": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var newLineCharacter, popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("document");
                        newLineCharacter = editor.session.doc.getNewLineCharacter();
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "append",
                                            value: "append"
                                        }, {
                                            caption: "all",
                                            value: "all"
                                        }
                                    ];
                                    callback(null, completions);
                                },
                                triggerCharacters: [".", newLineCharacter]
                            }
                        ];
                        editor.moveCursorTo(0, 8);
                        user.type(".");
                        popup = editor.completer.popup;
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 2);
                        user.type("Return"); // Accept suggestion
                        assert.equal(editor.getValue(), "document.all");
                        user.type(Array(4).fill("Backspace")); // Delete '.all'
                        user.type("Return"); // Enter new line
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 2:
                        _a.sent();
                        assert.equal(popup.data.length, 2);
                        user.type("Return"); // Accept suggestion
                        assert.equal(editor.getValue(), "document".concat(newLineCharacter, "all"));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: empty message if no suggestions available": function () {
        editor = initEditor("");
        var emptyMessageText = "No suggestions.";
        var autocomplete = Autocomplete.for(editor);
        autocomplete.emptyMessage = function () { return emptyMessageText; };
        user.type("thereisnoautosuggestionforthisword");
        // Open autocompletion via key-binding and verify empty message
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.data[0].caption, emptyMessageText);
        assert.ok(editor.completer.popup.renderer.container.classList.contains("ace_empty-message"));
        user.type("Return");
        assert.equal(editor.completer.popup.isOpen, false);
    },
    "test: no empty message class if suggestions available": function () {
        editor = initEditor("");
        var emptyMessageText = "No suggestions.";
        var autocomplete = Autocomplete.for(editor);
        autocomplete.emptyMessage = function () { return emptyMessageText; };
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "append",
                            value: "append"
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        user.type("b");
        // Open autocompletion via key-binding and verify empty message class
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.data[0].caption, emptyMessageText);
        assert.ok(editor.completer.popup.renderer.container.classList.contains("ace_empty-message"));
        user.type("Backspace");
        assert.equal(editor.completer.popup.isOpen, false);
        // Open autocompletion via key-binding and verify no empty message class
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.data[0].caption, "append");
        assert.ok(!editor.completer.popup.renderer.container.classList.contains("ace_empty-message"));
    },
    "test: liveAutocompleteDelay": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world ");
                        editor.setOptions({
                            liveAutocompletionDelay: 10,
                            liveAutocompletionThreshold: 2
                        });
                        editor.completers = [{
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    callback(null, [{
                                            value: "test"
                                        }]);
                                }
                            },
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    this.timeout = setTimeout(function () {
                                        callback(null, [{
                                                value: "slow test"
                                            }]);
                                    }, 50);
                                },
                                cancel: function () {
                                    clearTimeout(this.timeout);
                                    this.timeout = null;
                                }
                            }
                        ];
                        user.type(" ");
                        user.type("t");
                        user.type("e");
                        popup = editor.completer.popup;
                        assert.ok(!popup || !popup.isOpen);
                        return [4 /*yield*/, lang.sleep(11)];
                    case 1:
                        _a.sent();
                        assert.ok(editor.completer.popup.isOpen);
                        assert.ok(editor.completers[1].timeout);
                        user.type("Home");
                        return [4 /*yield*/, lang.sleep(0)];
                    case 2:
                        _a.sent();
                        assert.ok(editor.completer.popup.isOpen);
                        assert.ok(editor.completers[1].timeout);
                        user.type("Left");
                        return [4 /*yield*/, lang.sleep(0)];
                    case 3:
                        _a.sent();
                        assert.ok(!editor.completer.popup.isOpen);
                        assert.ok(!editor.completers[1].timeout);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: scroll and resize": function () {
        editor = initEditor("hello world\n");
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        var called = false;
        editor.completer.$updatePopupPosition = function () {
            called = true;
        };
        editor.container.parentNode.dispatchEvent(new CustomEvent("scroll"));
        assert.ok(called);
        editor.destroy();
        editor.container.remove();
    },
    "test: selection should follow hovermarker if setSelectOnHover true": function () {
        editor = initEditor("hello world\n");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "option 1",
                            value: "one"
                        }, {
                            caption: "option 2",
                            value: "two"
                        }, {
                            caption: "option 3",
                            value: "three"
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        completer.setSelectOnHover = true;
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(completer.popup.getRow(), 0);
        editor.completer.popup.renderer.$loop._flush();
        var text = completer.popup.renderer.content.childNodes[2];
        var rect = text.getBoundingClientRect();
        // We need two mouse events to trigger the updating of the hover marker.
        text.dispatchEvent(new MouseEvent("move", { x: rect.left, y: rect.top }));
        // Hover over the second row.
        var lineHeight = completer.popup.renderer.lineHeight;
        text.dispatchEvent(new MouseEvent("move", { x: rect.left + 1, y: rect.top + 1.5 * lineHeight }));
        // Selected row should follow mouse.
        editor.completer.popup.renderer.$loop._flush();
        assert.equal(completer.popup.getRow(), 1);
    },
    "test: selection should not follow hovermarker if setSelectOnHover not set": function () {
        editor = initEditor("hello world\n");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "option 1",
                            value: "one"
                        }, {
                            caption: "option 2",
                            value: "two"
                        }, {
                            caption: "option 3",
                            value: "three"
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(completer.popup.getRow(), 0);
        var text = completer.popup.renderer.content.childNodes[2];
        var rect = text.getBoundingClientRect();
        // We need two mouse events to trigger the updating of the hover marker.
        text.dispatchEvent(new MouseEvent("move", { x: rect.left, y: rect.top }));
        // Hover over the second row.
        text.dispatchEvent(new MouseEvent("move", { x: rect.left + 1, y: rect.top + 20 }));
        // Selected row should not follow mouse.
        editor.completer.popup.renderer.$loop._flush();
        assert.equal(completer.popup.getRow(), 0);
    },
    "test: should respect hideInlinePreview": function () {
        editor = initEditor("hello world\n");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "option 1",
                            value: "one",
                            score: 3
                        }
                    ];
                    callback(null, completions);
                },
                hideInlinePreview: true
            }, {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "option 2",
                            value: "two",
                            score: 2
                        }
                    ];
                    callback(null, completions);
                },
                hideInlinePreview: false
            }, {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "option 3",
                            value: "three",
                            score: 1
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        completer.inlineEnabled = true;
        user.type("Ctrl-Space");
        var inline = completer.inlineRenderer;
        assert.equal(editor.completer.popup.isOpen, true);
        // Row 0, should hide inline preview.
        assert.equal(completer.popup.getRow(), 0);
        assert.strictEqual(inline.isOpen(), false);
        sendKey("Down");
        // Row 1, should show inline preview.
        assert.equal(completer.popup.getRow(), 1);
        assert.strictEqual(inline.isOpen(), true);
        sendKey("Down");
        // Row 2, should show inline preview.
        assert.equal(completer.popup.getRow(), 2);
        assert.strictEqual(inline.isOpen(), true);
    },
    "test: should maintain selection on fast completer item when slow completer results come in": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        editor.completers = [fastCompleter, slowCompleter];
                        completer = Autocomplete.for(editor);
                        completer.stickySelectionDelay = 100;
                        user.type("Ctrl-Space");
                        assert.equal(completer.popup.isOpen, true);
                        assert.equal(completer.popup.data.length, 3);
                        assert.equal(completer.popup.getRow(), 0);
                        return [4 /*yield*/, lang.sleep(300)];
                    case 1:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 5);
                        assert.equal(completer.popup.getRow(), 1);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should not maintain selection on fast completer item when slow completer results come in when stickySelectionDelay negative": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var slowCompleter, completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        slowCompleter = {
                            getCompletions: function (editor, session, pos, prefix, callback) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var completions;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                completions = [
                                                    {
                                                        caption: "slow option 1",
                                                        value: "s1",
                                                        score: 3
                                                    }, {
                                                        caption: "slow option 2",
                                                        value: "s2",
                                                        score: 0
                                                    }
                                                ];
                                                return [4 /*yield*/, lang.sleep(200)];
                                            case 1:
                                                _a.sent();
                                                callback(null, completions);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        };
                        editor.completers = [fastCompleter, slowCompleter];
                        completer = Autocomplete.for(editor);
                        completer.stickySelectionDelay = -1;
                        user.type("Ctrl-Space");
                        assert.equal(completer.popup.isOpen, true);
                        assert.equal(completer.popup.data.length, 3);
                        assert.equal(completer.popup.getRow(), 0);
                        return [4 /*yield*/, lang.sleep(300)];
                    case 1:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 5);
                        assert.equal(completer.popup.getRow(), 0);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should filter using caption if ignoreCaption false": function () {
        editor = initEditor("hello world\n");
        var completer = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        caption: "caption",
                        value: "value"
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [completer];
        var completer = Autocomplete.for(editor);
        // Should filter using the caption if set to false.
        completer.ignoreCaption = false;
        user.type("cap");
        assert.equal(completer.popup.isOpen, true);
    },
    "test: should filter using value if ignoreCaption true": function () {
        editor = initEditor("hello world\n");
        var completer = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        caption: "caption",
                        value: "value"
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [completer];
        var completer = Autocomplete.for(editor);
        // Should not filter using the caption if set to true.
        completer.ignoreCaption = true;
        user.type("cap");
        assert.equal(completer.popup, undefined);
        // Should filter using the value instead.
        user.type(" value");
        assert.equal(completer.popup.isOpen, true);
    },
    "test: should skip filter if skipFilter flag is set to true in completion": function () {
        editor = initEditor("hello world\n");
        var completer = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        value: "example value",
                        skipFilter: true
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [completer];
        var completer = Autocomplete.for(editor);
        // should not do filter out the completion item where skipFilter is true
        user.type("notMatchingText");
        assert.equal(completer.popup.data.length, 1);
        assert.equal(completer.popup.isOpen, true);
    },
    "test: should use filter if skipFilter flag is set to false in completion": function () {
        editor = initEditor("hello world\n");
        var completer = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        value: "example value",
                        skipFilter: false
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [completer];
        var completer = Autocomplete.for(editor);
        // should do filter out the completion item where skipFilter is false
        user.type("notMatchingText");
        assert.equal(completer.popup, undefined);
        // normal filtering mechanism should work fine
        user.type(" ex");
        assert.equal(completer.popup.isOpen, true);
        assert.equal(completer.popup.data.length, 1);
    },
    "test: should add inline preview content to aria-describedby": function () {
        editor = initEditor("fun");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "function",
                            value: "function\nthat does something\ncool"
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        completer.inlineEnabled = true;
        user.type("Ctrl-Space");
        var inline = completer.inlineRenderer;
        // Popup should be open, with inline text renderered.
        assert.equal(completer.popup.isOpen, true);
        assert.equal(completer.popup.getRow(), 0);
        assert.strictEqual(inline.isOpen(), true);
        assert.strictEqual(editor.renderer.$ghostText.text, "function\nthat does something\ncool");
        completer.popup.renderer.$loop._flush();
        // aria-describedby of selected popup item should have aria-describedby set to the offscreen inline screen reader div and doc-tooltip.
        assert.strictEqual(completer.popup.selectedNode.getAttribute("aria-describedby"), "doc-tooltip ace-inline-screenreader-line-0 ace-inline-screenreader-line-1 ace-inline-screenreader-line-2 ");
        // The elements with these IDs should have the correct content.
        assert.strictEqual(document.getElementById("ace-inline-screenreader-line-0").textContent, "function");
        assert.strictEqual(document.getElementById("ace-inline-screenreader-line-1").textContent, "that does something");
        assert.strictEqual(document.getElementById("ace-inline-screenreader-line-2").textContent, "cool");
    },
    "test: update popup position only on mouse out when inline enabled and setSelectOnHover true": function () {
        editor = initEditor("fun");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            caption: "functionshort",
                            value: "function that does something uncool",
                            score: 1
                        },
                        {
                            caption: "functionlong",
                            value: "function\nthat does something\ncool",
                            score: 0
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        completer.setSelectOnHover = true;
        completer.inlineEnabled = true;
        user.type("Ctrl-Space");
        assert.equal(editor.completer.popup.isOpen, true);
        var called = false;
        editor.completer.$updatePopupPosition = function () {
            called = true;
        };
        var inline = completer.inlineRenderer;
        assert.equal(completer.popup.getRow(), 0);
        assert.strictEqual(inline.isOpen(), true);
        assert.strictEqual(editor.renderer.$ghostText.text, "function that does something uncool");
        var text = completer.popup.renderer.content.childNodes[2];
        var rect = text.getBoundingClientRect();
        // We need two mouse events to trigger the updating of the hover marker.
        text.dispatchEvent(new MouseEvent("move", { x: rect.left, y: rect.top }));
        // Hover over the second row.
        text.dispatchEvent(new MouseEvent("move", { x: rect.left + 1, y: rect.top + 20 }));
        editor.completer.popup.renderer.$loop._flush();
        // Check that the completion item changed to the longer item.
        assert.equal(completer.popup.getRow(), 1);
        assert.strictEqual(inline.isOpen(), true);
        assert.strictEqual(editor.renderer.$ghostText.text, "function\nthat does something\ncool");
        // Check that position update of popup is not called.
        assert.ok(!called);
        text.dispatchEvent(new MouseEvent("out", { x: rect.left, y: rect.top }));
        editor.completer.popup.renderer.$loop._flush();
        // Check that position update of popup is called after the mouseout.
        assert.ok(called);
        editor.destroy();
        editor.container.remove();
    },
    "test: should display loading state": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function isLoading() {
                return completer.popup.renderer.container.classList.contains("ace_loading");
            }
            var completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        editor.completers = [slowCompleter];
                        completer = Autocomplete.for(editor);
                        completer.stickySelectionDelay = 100;
                        completer.showLoadingState = true;
                        user.type("Ctrl-Space");
                        assert.ok(!(completer.popup && completer.popup.isOpen));
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 1);
                        assert.ok(isLoading());
                        return [4 /*yield*/, lang.sleep(150)];
                    case 2:
                        _a.sent();
                        assert.equal(completer.popup.data.length, 2);
                        assert.ok(!isLoading());
                        user.type("Escape");
                        assert.ok(!(completer.popup && completer.popup.isOpen));
                        editor.completers = [fastCompleter, slowCompleter];
                        user.type("Ctrl-Space");
                        assert.equal(completer.popup.data.length, 4);
                        // Should have top row saying 'Loading...' together with results.
                        assert.ok(isLoading());
                        assert.equal(completer.popup.data[0].caption, "Loading...");
                        return [4 /*yield*/, lang.sleep(250)];
                    case 3:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 5);
                        assert.ok(!isLoading());
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should not display loading state on no suggestion state": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function isLoading() {
                return completer.popup.renderer.container.classList.contains("ace_loading");
            }
            var completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        editor.completers = [slowCompleter];
                        completer = Autocomplete.for(editor);
                        completer.stickySelectionDelay = 100;
                        completer.emptyMessage = "no completions";
                        completer.showLoadingState = true;
                        user.type("doesntmatchanything");
                        user.type("Ctrl-Space");
                        assert.ok(!(completer.popup && completer.popup.isOpen));
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 1);
                        assert.ok(isLoading());
                        return [4 /*yield*/, lang.sleep(150)];
                    case 2:
                        _a.sent();
                        // Should show no suggestions state without loading indicator
                        assert.equal(completer.popup.data.length, 1);
                        assert.equal(completer.popup.data[0].caption, "no completions");
                        assert.ok(!isLoading());
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should display ghost text after loading state if inline preview enabled": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function isLoading() {
                return completer.popup.renderer.container.classList.contains("ace_loading");
            }
            var completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        editor.completers = [slowCompleter];
                        completer = Autocomplete.for(editor);
                        completer.stickySelectionDelay = 100;
                        completer.inlineEnabled = true;
                        completer.showLoadingState = true;
                        user.type("Ctrl-Space");
                        assert.ok(!(completer.popup && completer.popup.isOpen));
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        assert.equal(completer.popup.data.length, 1);
                        assert.ok(isLoading());
                        return [4 /*yield*/, lang.sleep(150)];
                    case 2:
                        _a.sent();
                        assert.equal(completer.popup.data.length, 2);
                        assert.ok(!isLoading());
                        assert.strictEqual(editor.renderer.$ghostText.text, "s1");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: when completion gets inserted and call the onInsert method": function () {
        var isInserted = false;
        editor = initEditor("hello world");
        var completer = {
            onInsert: function (_editor, el) {
                assert.ok(!isInserted, "should not have inserted something already");
                isInserted = el.value === "one";
            },
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        caption: "option 1",
                        value: "one",
                        completer: completer
                    }, {
                        caption: "option 2",
                        value: "two",
                        completer: completer
                    }, {
                        caption: "option 3",
                        value: "three",
                        completer: completer
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [completer];
        user.type("Ctrl-Space");
        editor.completer.popup.renderer.$loop._flush();
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.getRow(), 0);
        user.type("Return");
        assert.ok(isInserted);
    },
    "test: when completions get shown, call the onSeen method": function () {
        var seen = [false, false, false];
        editor = initEditor("hello world");
        var completer = {
            onSeen: function (_editor, el) {
                var index = ["one", "two", "three"].indexOf(el.value);
                if (index >= 0) {
                    assert.ok(!seen[index], "should not be called double");
                    seen[index] = true;
                }
            },
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        caption: "option 1",
                        value: "one",
                        completer: completer
                    }, {
                        caption: "option 2",
                        value: "two",
                        completer: completer
                    }, {
                        caption: "option 3",
                        value: "three",
                        completer: completer
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [
            completer
        ];
        Autocomplete.for(editor).inlineEnabled = true;
        user.type("Ctrl-Space");
        editor.completer.popup.renderer.$loop._flush();
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.getRow(), 0);
        assert.deepEqual(seen, [true, false, false]);
    },
    "test: when inline completions get shown, call the onSeen method": function () {
        var seen = [false, false, false];
        var calledDouble = false;
        editor = initEditor("hello world");
        var completer = {
            onSeen: function (_editor, el) {
                var index = ["one", "two", "three"].indexOf(el.value);
                if (index >= 0) {
                    if (seen[index])
                        calledDouble = true;
                    seen[index] = true;
                }
            },
            getCompletions: function (editor, session, pos, prefix, callback) {
                var completions = [
                    {
                        caption: "option 1",
                        value: "one",
                        completer: completer
                    }, {
                        caption: "option 2",
                        value: "two",
                        completer: completer
                    }, {
                        caption: "option 3",
                        value: "three",
                        completer: completer
                    }
                ];
                callback(null, completions);
            }
        };
        editor.completers = [
            completer
        ];
        user.type("Ctrl-Space");
        editor.completer.popup.renderer.$loop._flush();
        assert.equal(editor.completer.popup.isOpen, true);
        assert.equal(editor.completer.popup.getRow(), 0);
        assert.deepEqual(seen, [true, true, true]);
        assert.ok(!calledDouble);
    },
    "test: if there is very long ghost text, popup should be rendered at the bottom of the editor container": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var initialDocumentHeight, longCompleter, completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("hello world\n");
                        initialDocumentHeight = document.body.style.height;
                        document.body.style.height = editor.container.getBoundingClientRect().height + 200 + "px";
                        editor.renderer.$loop._flush();
                        longCompleter = {
                            getCompletions: function (editor, session, pos, prefix, callback) {
                                var completions = [
                                    {
                                        caption: "loooooong",
                                        value: "line\n".repeat(20),
                                        score: 0
                                    }
                                ];
                                callback(null, completions);
                            }
                        };
                        editor.completers = [longCompleter];
                        completer = Autocomplete.for(editor);
                        completer.inlineEnabled = true;
                        user.type("Ctrl-Space");
                        assert.ok(completer.popup && completer.popup.isOpen);
                        // Wait to account for the renderer scrolling for the virtual renderer
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait to account for the renderer scrolling for the virtual renderer
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        // Popup should start one pixel below the bottom of the editor container
                        assert.equal(completer.popup.container.getBoundingClientRect().top, editor.container.getBoundingClientRect().bottom + 1);
                        // Reset back to initial values
                        document.body.style.height = initialDocumentHeight;
                        editor.renderer.$loop._flush();
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: if there is ghost text, popup should be rendered at the bottom of the ghost text": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var longCompleter, completer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        longCompleter = {
                            getCompletions: function (editor, session, pos, prefix, callback) {
                                var completions = [
                                    {
                                        caption: "loooooong",
                                        value: "line\n".repeat(5),
                                        score: 0
                                    }
                                ];
                                callback(null, completions);
                            }
                        };
                        editor.completers = [longCompleter];
                        completer = Autocomplete.for(editor);
                        completer.inlineEnabled = true;
                        user.type("Ctrl-Space");
                        assert.ok(completer.popup && completer.popup.isOpen);
                        // Wait to account for the renderer scrolling for the virtual renderer
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        // Wait to account for the renderer scrolling for the virtual renderer
                        _a.sent();
                        completer.popup.renderer.$loop._flush();
                        // Popup should start one pixel below the bottom of the ghost text
                        assert.equal(completer.popup.container.getBoundingClientRect().top, editor.renderer.$ghostTextWidget.el.getBoundingClientRect().bottom + 1);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should not show loading state when empty completer array is provided": function () {
        editor = initEditor("");
        editor.completers = [];
        var completer = Autocomplete.for(editor);
        completer.showLoadingState = true;
        user.type("Ctrl-Space");
        // Tooltip should not be open
        assert.ok(!(completer.popup && completer.popup.isOpen));
    },
    "test: should update inline preview when typing when it's the only item in the popup": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var completer, inline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            caption: "function",
                                            value: "function\nthat does something\ncool"
                                        }
                                    ];
                                    callback(null, completions);
                                }
                            }
                        ];
                        completer = Autocomplete.for(editor);
                        completer.inlineEnabled = true;
                        user.type("f");
                        inline = completer.inlineRenderer;
                        // Popup should be open, with inline text renderered.
                        assert.equal(completer.popup.isOpen, true);
                        assert.equal(completer.popup.getRow(), 0);
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "unction\nthat does something\ncool");
                        // when you keep typing, the ghost text should update accordingly
                        user.type("unc");
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        _a.sent();
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "tion\nthat does something\ncool");
                        user.type("tio");
                        return [4 /*yield*/, lang.sleep(100)];
                    case 2:
                        _a.sent();
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "n\nthat does something\ncool");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: should keep showing ghost text when typing ahead with whitespace": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var completer, inline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = [
                                        {
                                            value: "function that does something cool"
                                        }
                                    ];
                                    callback(null, completions);
                                }
                            }
                        ];
                        completer = Autocomplete.for(editor);
                        completer.inlineEnabled = true;
                        user.type("f");
                        inline = completer.inlineRenderer;
                        // Popup should be open, with inline text renderered.
                        assert.equal(completer.popup.isOpen, true);
                        assert.equal(completer.popup.getRow(), 0);
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "unction that does something cool");
                        // when you keep typing, the ghost text should update accordingly
                        user.type("unction th");
                        return [4 /*yield*/, lang.sleep(100)];
                    case 1:
                        _a.sent();
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "at does something cool");
                        user.type("at do");
                        return [4 /*yield*/, lang.sleep(100)];
                    case 2:
                        _a.sent();
                        assert.strictEqual(inline.isOpen(), true);
                        assert.strictEqual(editor.renderer.$ghostText.text, "es something cool");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: passing matches from execCommand": function () {
        editor = initEditor("");
        editor.execCommand('startAutocomplete', {
            matches: [
                { value: 'example value' }
            ]
        });
        user.type("\n");
        assert.equal(editor.getValue(), "example value");
        editor.resize(true);
        editor.insertSnippet("<$1-${1|a1,b2,c3|}>");
        user.type("Down");
        user.type("\n");
        assert.equal(editor.getValue(), "example value<b2-b2>");
    },
    "test: should close popup if backspacing until input is fully deleted": function () {
        editor = initEditor("");
        editor.completers = [
            {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    var completions = [
                        {
                            value: "tabularhappiness"
                        }
                    ];
                    callback(null, completions);
                }
            }
        ];
        var completer = Autocomplete.for(editor);
        completer.inlineEnabled = true;
        user.type("tab");
        // Popup should be open
        assert.equal(completer.popup.isOpen, true);
        user.type("Backspace");
        user.type("Backspace");
        // Popup should still be open
        assert.equal(completer.popup.isOpen, true);
        user.type("Backspace");
        // Popup should be closed now
        assert.equal(completer.popup.isOpen, false);
    },
    "test: should set create shared Autocomplete with sharedPopups on": function () {
        assert.equal(Autocomplete.$sharedInstance == undefined, true);
        config.set("sharedPopups", true);
        var editor = initEditor("");
        var completer = Autocomplete.for(editor);
        assert.equal(Autocomplete.$sharedInstance == undefined, false);
        config.set("sharedPopups", false);
    },
    "test: changing completion should render scrollbars correctly": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var newLineCharacter, initialCompletions, longCompletions, currentCompletions, popup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("document");
                        newLineCharacter = editor.session.doc.getNewLineCharacter();
                        initialCompletions = [
                            {
                                caption: "small",
                                meta: "small",
                                value: "small"
                            }
                        ];
                        longCompletions = Array(10)
                            .fill(null)
                            .map(function (_, i) { return ({
                            caption: "this is a really long string that I want to use for testing horizontal scroll ".concat(i),
                            meta: "meta ".concat(i),
                            value: "value ".concat(i)
                        }); });
                        currentCompletions = initialCompletions;
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    var completions = currentCompletions;
                                    callback(null, completions);
                                },
                                triggerCharacters: [newLineCharacter]
                            }
                        ];
                        editor.moveCursorTo(0, 8);
                        user.type("Return"); // Accept suggestion
                        popup = editor.completer.popup;
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        assert.equal(popup.data.length, 1);
                        assert.notOk(popup.renderer.scrollBar.isVisible);
                        user.type("Return"); // Accept suggestion
                        assert.equal(editor.getValue(), "document".concat(newLineCharacter, "small"));
                        // change completion values
                        currentCompletions = longCompletions;
                        user.type("Return"); // Enter new line
                        assert.equal(popup.renderer.layerConfig.height, popup.renderer.lineHeight * 1);
                        assert.equal(popup.data.length, 10);
                        return [4 /*yield*/, popup.renderer.once("afterRender")];
                    case 2:
                        _a.sent();
                        assert.ok(popup.renderer.scrollBar.isVisible);
                        assert.equal(popup.renderer.layerConfig.height, popup.renderer.lineHeight * 8);
                        user.type("Return"); // Accept suggestion
                        assert.equal(editor.getValue(), "document".concat(newLineCharacter, "small").concat(newLineCharacter, "value 0"));
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: doc tooltip positioning": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            function waitForDocTooltip() {
                return __awaiter(this, void 0, void 0, function () {
                    var tooltipNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                editor.renderer.$loop._flush();
                                return [4 /*yield*/, lang.sleep(50)];
                            case 1:
                                _a.sent();
                                editor.completer.onLayoutChange();
                                tooltipNode = editor.completer.tooltipNode;
                                popupRect = popup.container.getBoundingClientRect();
                                tooltipRect = tooltipNode.getBoundingClientRect();
                                return [2 /*return*/];
                        }
                    });
                });
            }
            var editor, longDoc, popup, popupRect, tooltipRect, editorWidth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = initEditor("");
                        longDoc = "This is a very long documentation text that should wrap and test the tooltip width constraints.";
                        editor.completers = [
                            {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    callback(null, [
                                        {
                                            caption: "completion1",
                                            value: "completion1",
                                            docHTML: longDoc
                                        },
                                        {
                                            caption: "completion2",
                                            value: "completion2"
                                        },
                                        {
                                            caption: "completion3",
                                            value: "completion3"
                                        }
                                    ]);
                                }
                            }
                        ];
                        editor.resize();
                        return [4 /*yield*/, editor.renderer.once("afterRender")];
                    case 1:
                        _a.sent();
                        editor.completer.showPopup(editor);
                        popup = editor.completer.popup;
                        // Mock the CSS behaviour
                        popup.container.style.width = "300px";
                        popup.container.style.height = "300px";
                        editorWidth = 400;
                        editor.container.style.width = editorWidth + "px";
                        editor.container.style.height = "100px";
                        editor.container.style.left = "0px";
                        editor.container.style.top = "0px";
                        popup.container.style.positionHint = "fixed";
                        user.type("c");
                        return [4 /*yield*/, waitForDocTooltip()];
                    case 2:
                        _a.sent();
                        assert.ok(tooltipRect.left > popupRect.right, "Tooltip should appear on the right");
                        editor.container.style.left = (window.innerWidth - editorWidth) + "px";
                        user.type("o");
                        return [4 /*yield*/, waitForDocTooltip()];
                    case 3:
                        _a.sent();
                        assert.ok(tooltipRect.right <= popupRect.left, "Tooltip should appear on the left");
                        editor.container.style.left = "400px";
                        editor.container.style.top = "0px";
                        popup.container.style.width = (window.innerWidth - 100) + "px";
                        user.type("Escape");
                        user.type("Enter");
                        user.type("c");
                        return [4 /*yield*/, waitForDocTooltip()];
                    case 4:
                        _a.sent();
                        assert.ok(tooltipRect.top >= popupRect.bottom, "Tooltip should appear below");
                        editor.container.style.top = (window.innerHeight - 100) + "px";
                        editor.container.style.left = "0px";
                        user.type("Escape");
                        user.type("Enter");
                        user.type("c");
                        return [4 /*yield*/, waitForDocTooltip()];
                    case 5:
                        _a.sent();
                        assert.ok(tooltipRect.bottom <= popupRect.top, "Tooltip should appear above");
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
};
require("./test/run")(module);

});