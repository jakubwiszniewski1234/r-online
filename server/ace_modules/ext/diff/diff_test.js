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
var assert = require("../../test/assertions");
require("../../test/mockdom");
var InlineDiffView = require("./inline_diff_view").InlineDiffView;
var SplitDiffView = require("./split_diff_view").SplitDiffView;
var DiffProvider = require("./providers/default").DiffProvider;
var ace = require("../../ace");
var Range = require("../../range").Range;
var editorA, editorB, diffView;
var Decorator = require("../../layer/decorators").Decorator;
var ScrollDiffDecorator = require("./scroll_diff_decorator").ScrollDiffDecorator;
var lang = require("../../lib/lang");
var DEBUG = false;
function createEditor() {
    var editor = ace.edit(null);
    document.body.appendChild(editor.container);
    setEditorPosition(editor);
    return editor;
}
function setEditorPosition(editor) {
    editor.container.style.height = "200px";
    editor.container.style.width = "300px";
    editor.container.style.position = "absolute";
    editor.container.style.outline = "solid";
}
function getValueA(lines) {
    return lines.map(function (v) {
        return v[0];
    }).filter(function (x) {
        return x != null;
    }).join("\n");
}
function getValueB(lines) {
    return lines.map(function (v) {
        return v.length == 2 ? v[1] : v[0];
    }).filter(function (x) {
        return x != null;
    }).join("\n");
}
var simpleDiff = [
    ["a"],
    ["b"],
    ["c"],
    [null, "inserted1"],
    [null, "inserted2"],
    ["e"],
    ["f"],
    ["g", "edited g"],
    ["h"],
    ["i"],
];
var diffAtEnds = [
    [null, "only new"],
    [null, "only new"],
    ["a"],
    ["b"],
    ["c"],
    ["d"],
    ["e"],
    ["f"],
    ["g"],
    ["h"],
    ["i"],
    ["j"],
    ["k"],
    ["only old", null],
    ["only old2", null],
];
var longLinesDiff = [
    [null, "0"],
    ["a"],
    ["b"],
    ["c", "edited c ".repeat(100)],
    ["e long ".repeat(100)],
    ["f"],
    ["g " + "to delete ".repeat(100), "edited g"],
    ["h"],
    ["i"],
];
module.exports = {
    setUpSuite: function () {
        ace.config.setLoader(function (moduleName, cb) {
            if (moduleName == "ace/ext/error_marker")
                return cb(null, require("../error_marker"));
            if (moduleName == "ace/theme/cloud_editor")
                return cb(null, require("../../theme/cloud_editor"));
        });
        editorA = createEditor();
        editorB = createEditor();
        editorB.container.style.left = "301px";
        editorA.focus();
    },
    tearDownSuite: function () {
        if (DEBUG)
            return;
        [editorA, editorB].forEach(function (editor) {
            if (editor) {
                editor.destroy();
                editor.container.remove();
                editor = null;
            }
        });
    },
    tearDown: function () {
        if (DEBUG)
            return;
        if (diffView) {
            diffView.detach();
            diffView = null;
        }
    },
    "test: clean detach": function () {
        var diffProvider = new DiffProvider();
        editorA.session.setValue(getValueA(simpleDiff));
        editorB.session.setValue(getValueB(simpleDiff));
        assert.ok(!!editorA.session.widgetManager);
        assert.ok(!!editorB.session.widgetManager);
        var uid = 0;
        var saved = {};
        function saveEventRegistry(object) {
            var id = object.id;
            if (!id) {
                id = object.id = "unknown" + (uid++);
            }
            var eventRegistry = {};
            for (var key in object._eventRegistry) {
                var handlers = object._eventRegistry[key];
                eventRegistry[key] = handlers.slice(0);
            }
            saved[id] = { eventRegistry: eventRegistry, object: object };
            if (/session/.test(id)) {
                saved[id].$frontMarkers = Object.keys(object.$frontMarkers);
            }
        }
        function checkEventRegistry() {
            for (var id in saved) {
                var object = saved[id].object;
                var eventRegistry = saved[id].eventRegistry;
                for (var eventName in object._eventRegistry) {
                    var handlers = object._eventRegistry[eventName];
                    var savedHandlers = eventRegistry[eventName] || [];
                    assert.notEqual(handlers, savedHandlers);
                    assert.equal(handlers.length, savedHandlers.length, id + ":" + eventName);
                    for (var j = 0; j < handlers.length; j++) {
                        assert.equal(handlers[j], eventRegistry[eventName][j], id + ":" + eventName);
                    }
                }
                if (saved[id].$frontMarkers) {
                    var frontMarkers = Object.keys(object.$frontMarkers);
                    assert.equal(frontMarkers + "", saved[id].$frontMarkers + "", id);
                }
            }
        }
        saveEventRegistry(editorA);
        saveEventRegistry(editorB);
        saveEventRegistry(editorA.session);
        saveEventRegistry(editorB.session);
        saveEventRegistry(editorA.renderer);
        saveEventRegistry(editorB.renderer);
        var diffView = new InlineDiffView({
            editorA: editorA,
            editorB: editorB,
            inline: "a",
            diffProvider: diffProvider,
        });
        editorA.session.addFold("---", new Range(0, 0, 2, 0));
        diffView.onInput();
        diffView.resize(true);
        assert.equal(editorA.session.$foldData.length, 1);
        assert.equal(editorB.session.$foldData.length, 1);
        diffView.detach();
        var sessionB = editorB.session;
        sessionB.widgetManager.attach(editorB);
        checkEventRegistry();
        diffView = new SplitDiffView({ editorA: editorA, editorB: editorB, diffProvider: diffProvider });
        editorB.session.addFold("---", new Range(5, 0, 7, 0));
        editorB.renderer.$loop._flush();
        editorA.renderer.$loop._flush();
        assert.equal(editorA.session.$foldData.length, 2);
        assert.equal(editorB.session.$foldData.length, 2);
        diffView.onInput();
        diffView.resize(true);
        diffView.setTheme("ace/theme/cloud_editor");
        assert.equal(diffView.editorA.getTheme(), "ace/theme/cloud_editor");
        assert.equal(diffView.editorB.getTheme(), "ace/theme/cloud_editor");
        diffView.editorB.setTheme("ace/theme/textmate");
        assert.equal(diffView.editorA.getTheme(), "ace/theme/textmate");
        assert.equal(diffView.editorB.getTheme(), "ace/theme/textmate");
        diffView.detach();
        checkEventRegistry();
        var diffView = new InlineDiffView({
            editorB: editorB,
            valueA: editorA.getValue(),
            inline: "b",
            diffProvider: diffProvider,
        });
        diffView.onInput();
        diffView.resize(true);
        diffView.detach();
        checkEventRegistry();
    },
    "test: diff at ends": function () {
        var diffProvider = new DiffProvider();
        var valueA = getValueA(diffAtEnds);
        var valueB = getValueB(diffAtEnds);
        diffView = new InlineDiffView({
            valueA: valueA,
            valueB: valueB,
            inline: "a",
            diffProvider: diffProvider,
        }, document.body);
        setEditorPosition(diffView.editorA);
        diffView.onInput();
        diffView.resize(true);
        var lineHeight = diffView.editorA.renderer.lineHeight;
        assert.ok(diffView.editorA.renderer.lineHeight > 0);
        assert.equal(diffView.chunks.length, 2);
        assert.equal(diffView.editorA.renderer.layerConfig.offset, 0);
        diffView.sessionA.setScrollTop(lineHeight * 1.5);
        diffView.resize(true);
        assert.equal(diffView.editorA.renderer.layerConfig.offset, 0.5 * lineHeight);
        diffView.detach();
        diffView = new SplitDiffView({
            valueA: valueA,
            valueB: valueB,
            diffProvider: diffProvider,
        }, document.body);
        setEditorPosition(diffView.editorA);
        setEditorPosition(diffView.editorB);
        diffView.onInput();
        diffView.resize(true);
        assert.equal(diffView.chunks.length, 2);
        diffView.detach();
        diffView = new InlineDiffView({
            valueA: valueA,
            valueB: valueB,
            inline: "b",
        }, document.body);
        setEditorPosition(diffView.editorB);
        diffView.onInput();
        diffView.resize(true);
        assert.equal(diffView.chunks.length, 0);
        diffView.detach();
    },
    "test scroll": function () {
        var diffProvider = new DiffProvider();
        var valueA = getValueA(diffAtEnds);
        var valueB = getValueB(diffAtEnds);
        editorA.session.setValue(valueA);
        editorB.session.setValue(valueB);
        diffView = new SplitDiffView({
            editorA: editorA,
            editorB: editorB,
            diffProvider: diffProvider,
        });
        diffView.onInput();
        diffView.resize(true);
        assert.equal(diffView.chunks.length, 2);
        diffView.setDiffSession({
            sessionA: ace.createEditSession(valueA.repeat(20)),
            sessionB: ace.createEditSession(valueB.repeat(20)),
        });
        diffView.onInput();
        diffView.resize(true);
        assert.equal(diffView.chunks.length, 21);
        diffView.editorA.setOption("animatedScroll", false);
        diffView.editorB.setOption("animatedScroll", false);
        diffView.editorA.execCommand("gotoend");
        diffView.editorB.renderer.$loop._flush();
        diffView.editorA.renderer.$loop._flush();
        assert.ok(diffView.sessionB.$scrollTop > 100);
        assert.ok(diffView.sessionA.$scrollTop == diffView.sessionB.$scrollTop);
        diffView.toggleFoldUnchanged();
        assert.equal(diffView.sessionA.$foldData.length, 20);
        assert.equal(diffView.sessionA.$foldData.length, 20);
        diffView.toggleFoldUnchanged();
        assert.equal(diffView.sessionA.$foldData.length, 0);
        assert.equal(diffView.sessionA.$foldData.length, 0);
    },
    "test line widget at both sides of line": function () {
        var diffProvider = new DiffProvider();
        editorA.session.setValue("a\n");
        editorB.session.setValue("\n\na\n\n");
        diffView = new SplitDiffView({
            editorA: editorA,
            editorB: editorB,
            diffProvider: diffProvider,
        });
        diffView.onInput();
        diffView.resize(true);
        var markers = diffView.editorA.renderer.$markerBack.element.childNodes;
        assert.equal(markers[0].className, "ace_diff aligned_diff");
        assert.equal(markers[1].className, "ace_diff aligned_diff");
        assert.equal(markers.length, 4);
    },
    "test: toggle wrap": function () {
        var diffProvider = new DiffProvider();
        editorA.session.setValue(getValueA(longLinesDiff));
        editorB.session.setValue(getValueB(longLinesDiff));
        diffView = new SplitDiffView({
            editorA: editorA,
            editorB: editorB,
            diffProvider: diffProvider,
        });
        diffView.onInput();
        diffView.setOptions({
            wrap: 20,
            syncSelections: true,
        });
        diffView.resize(true);
        diffView.gotoNext(1);
        diffView.gotoNext(1);
        var posA = diffView.sessionA.documentToScreenPosition(diffView.editorA.getCursorPosition());
        var posB = diffView.sessionB.documentToScreenPosition(diffView.editorB.getCursorPosition());
        assert.equal(posA.row, posB.row);
    },
    "test: restore options": function () {
        var diffProvider = new DiffProvider();
        editorA.session.setValue(getValueA(simpleDiff));
        editorB.session.setValue(getValueB(simpleDiff));
        editorA.setOption("customScrollbar", true);
        diffView = new InlineDiffView({
            editorA: editorA,
            editorB: editorB,
            inline: "a",
            diffProvider: diffProvider,
        });
        diffView.onInput();
        diffView.setOptions({
            wrap: true,
            folding: false,
            showOtherLineNumbers: false,
        });
        diffView.resize(true);
        assert.equal(diffView.chunks.length, 2);
        assert.equal(editorA.getOption("wrap"), "free");
        assert.equal(diffView.editorB.getOption("wrap"), "free");
        assert.equal(editorA.getOption("fadeFoldWidgets"), true);
        assert.equal(diffView.editorB.getOption("fadeFoldWidgets"), true);
        assert.equal(diffView.editorA.getOption("showFoldWidgets"), false);
        assert.equal(diffView.editorB.getOption("showFoldWidgets"), false);
        assert.ok(!!diffView.editorB.renderer.$gutterLayer.$renderer);
        assert.ok(editorA.renderer.$scrollDecorator instanceof ScrollDiffDecorator);
        diffView.detach();
        assert.equal(editorA.getOption("wrap"), "free");
        assert.equal(editorA.getOption("fadeFoldWidgets"), false);
        assert.equal(editorA.getOption("showFoldWidgets"), true);
        assert.equal(editorB.getOption("wrap"), "free");
        assert.equal(editorB.getOption("fadeFoldWidgets"), false);
        assert.equal(editorB.getOption("showFoldWidgets"), true);
        assert.ok(!editorB.renderer.$gutterLayer.$renderer);
        assert.ok(editorA.renderer.$scrollDecorator instanceof Decorator);
    },
    "test split diff scroll decorators": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editorA.session.setValue(["a", "b", "c"].join("\n"));
                        editorB.session.setValue(["a", "c", "X"].join("\n"));
                        diffView = new SplitDiffView({ editorA: editorA, editorB: editorB });
                        diffView.setProvider(new DiffProvider());
                        diffView.onInput();
                        editorA.renderer.$loop._flush();
                        editorB.renderer.$loop._flush();
                        return [4 /*yield*/, lang.sleep(0)];
                    case 1:
                        _a.sent();
                        assertDecoratorsPlacement(editorA, false);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test inline diff scroll decorators": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editorA.session.setValue(["a", "b", "c"].join("\n"));
                        editorB.session.setValue(["a", "c", "X"].join("\n"));
                        diffView = new InlineDiffView({ editorA: editorA, editorB: editorB, inline: "a" });
                        diffView.setProvider(new DiffProvider());
                        diffView.onInput();
                        editorA.renderer.$loop._flush();
                        return [4 /*yield*/, lang.sleep(0)];
                    case 1:
                        _a.sent();
                        assertDecoratorsPlacement(editorA, true);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    },
    "test: second editor destroyed on detach in inline diff view": function () {
        editorA.setOption("wrap", "free");
        diffView = new InlineDiffView({ editorA: editorA, inline: "a" });
        assert.equal(diffView.editorB.getOption("wrap"), "free");
        assert.ok(!diffView.otherEditor.destroyed);
        diffView.detach();
        assert.ok(diffView.otherEditor.destroyed);
    },
    "test: wrap stays in sync": function () {
        editorA.setOption("wrap", "off");
        diffView = new InlineDiffView({ editorA: editorA, inline: "a" });
        assert.equal(diffView.editorB.getOption("wrap"), "off");
        assert.equal(diffView.editorA.getOption("wrap"), "off");
        editorA.setOption("wrap", "free");
        assert.equal(diffView.editorB.getOption("wrap"), "free");
        assert.equal(diffView.editorA.getOption("wrap"), "free");
        diffView.detach();
        editorB.setOption("wrap", 40);
        diffView = new InlineDiffView({ editorB: editorB, inline: "b" });
        assert.equal(diffView.editorB.getOption("wrap"), 40);
        assert.equal(diffView.editorA.getOption("wrap"), 40);
        editorB.setOption("wrap", "free");
        assert.equal(diffView.editorB.getOption("wrap"), "free");
        assert.equal(diffView.editorA.getOption("wrap"), "free");
        editorB.setOption("wrap", 50);
        assert.equal(diffView.editorB.getOption("wrap"), 50);
        assert.equal(diffView.editorA.getOption("wrap"), 50);
        diffView.detach();
    }
};
function findPointFillStyle(imageData, y) {
    var data = imageData.slice(4 * y, 4 * (y + 1));
    var a = Math.round(data[3] / 256 * 100);
    if (a === 100)
        return "rgb(" + data.slice(0, 3).join(",") + ")";
    return "rgba(" + data.slice(0, 3).join(",") + "," + (a / 100) + ")";
}
function assertDecoratorsPlacement(editor, inlineDiff) {
    var decoA = editor.renderer.$scrollDecorator;
    var ctxA = decoA.canvas.getContext("2d");
    var delRow = 1;
    var offA = decoA.sessionA.documentToScreenRow(delRow, 0) * decoA.lineHeight;
    var centerA = offA + decoA.lineHeight / 2;
    var yA = Math.round(decoA.heightRatio * centerA);
    var imgA = ctxA.getImageData(decoA.oneZoneWidth, 0, 1, decoA.canvasHeight).data;
    assert.equal(findPointFillStyle(imgA, yA), decoA.colors.light.delete);
    if (inlineDiff) {
        //make sure that in inline diff, markers fills the whole line (except error decorators part)
        imgA = ctxA.getImageData(decoA.canvasWidth - 1, 0, 1, decoA.canvasHeight).data;
        assert.equal(findPointFillStyle(imgA, yA), decoA.colors.light.delete);
    }
    var xB = decoA.oneZoneWidth * 2;
    var imgB = ctxA.getImageData(xB, 0, 1, decoA.canvasHeight).data;
    var insRow = 2;
    var offB = decoA.sessionB.documentToScreenRow(insRow, 0) * decoA.lineHeight;
    var centerB = offB + decoA.lineHeight / 2;
    var yB = Math.round(decoA.heightRatio * centerB);
    assert.equal(findPointFillStyle(imgB, yB), decoA.colors.light.insert);
}
require("../../test/run")(module);

});