define(function(require, exports, module){"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var dom = require("../../lib/dom");
var config = require("../../config");
var LineWidgets = require("../../line_widgets").LineWidgets;
var ScrollDiffDecorator = require("./scroll_diff_decorator").ScrollDiffDecorator;
// @ts-ignore
var css = require("./styles-css.js").cssText;
var Editor = require("../../editor").Editor;
var Renderer = require("../../virtual_renderer").VirtualRenderer;
var UndoManager = require("../../undomanager").UndoManager;
var Decorator = require("../../layer/decorators").Decorator;
require("../../theme/textmate");
// enable multiselect
require("../../multi_select");
var EditSession = require("../../edit_session").EditSession;
var MinimalGutterDiffDecorator = require("./gutter_decorator").MinimalGutterDiffDecorator;
var dummyDiffProvider = {
    compute: function (val1, val2, options) {
        return [];
    }
};
dom.importCssString(css, "diffview.css", false);
var BaseDiffView = /** @class */ (function () {
    /**
     * Constructs a new base DiffView instance.
     * @param {boolean} [inlineDiffEditor] - Whether to use an inline diff editor.
     * @param {HTMLElement} [container] - optional container element for the DiffView.
     */
    function BaseDiffView(inlineDiffEditor, container) {
        this.onChangeTheme = this.onChangeTheme.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onChangeFold = this.onChangeFold.bind(this);
        this.realign = this.realign.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onChangeWrapLimit = this.onChangeWrapLimit.bind(this);
        this.realignPending = false;
        /**@type{{sessionA: EditSession, sessionB: EditSession, chunks: DiffChunk[]}}*/ this.diffSession;
        /**@type DiffChunk[]*/ this.chunks;
        this.inlineDiffEditor = inlineDiffEditor || false;
        this.currentDiffIndex = 0;
        this.diffProvider = dummyDiffProvider;
        if (container) {
            this.container = container;
        }
        this.$ignoreTrimWhitespace = false;
        this.$maxDiffs = 5000;
        this.$maxComputationTimeMs = 150;
        this.$syncSelections = false;
        this.$foldUnchangedOnInput = false;
        this.markerB = new DiffHighlight(this, 1);
        this.markerA = new DiffHighlight(this, -1);
    }
    /**
     * @param {import("../diff").DiffModel} [diffModel] - The model for the diff view.
     */
    BaseDiffView.prototype.$setupModels = function (diffModel) {
        if (diffModel.diffProvider) {
            this.setProvider(diffModel.diffProvider);
        }
        this.showSideA = diffModel.inline == undefined ? true : diffModel.inline === "a";
        var diffEditorOptions = /**@type {Partial<import("../../../ace-internal").Ace.EditorOptions>}*/ ({
            scrollPastEnd: 0.5,
            highlightActiveLine: false,
            highlightGutterLine: false,
            animatedScroll: true,
            customScrollbar: true,
            vScrollBarAlwaysVisible: true,
            fadeFoldWidgets: true,
            showFoldWidgets: true,
            selectionStyle: "text",
        });
        this.savedOptionsA = diffModel.editorA && diffModel.editorA.getOptions(diffEditorOptions);
        this.savedOptionsB = diffModel.editorB && diffModel.editorB.getOptions(diffEditorOptions);
        if (!this.inlineDiffEditor || diffModel.inline === "a") {
            this.editorA = diffModel.editorA || this.$setupModel(diffModel.sessionA, diffModel.valueA);
            this.container && this.container.appendChild(this.editorA.container);
            this.editorA.setOptions(diffEditorOptions);
        }
        if (!this.inlineDiffEditor || diffModel.inline === "b") {
            this.editorB = diffModel.editorB || this.$setupModel(diffModel.sessionB, diffModel.valueB);
            this.container && this.container.appendChild(this.editorB.container);
            this.editorB.setOptions(diffEditorOptions);
        }
        if (this.inlineDiffEditor) {
            this.activeEditor = this.showSideA ? this.editorA : this.editorB;
            this.otherSession = this.showSideA ? this.sessionB : this.sessionA;
            var cloneOptions = this.activeEditor.getOptions();
            cloneOptions.readOnly = true;
            delete cloneOptions.mode;
            this.otherEditor = new Editor(new Renderer(null), undefined, cloneOptions);
            if (this.showSideA) {
                this.editorB = this.otherEditor;
            }
            else {
                this.editorA = this.otherEditor;
            }
        }
        this.setDiffSession({
            sessionA: diffModel.sessionA || (diffModel.editorA ? diffModel.editorA.session : new EditSession(diffModel.valueA || "")),
            sessionB: diffModel.sessionB || (diffModel.editorB ? diffModel.editorB.session : new EditSession(diffModel.valueB || "")),
            chunks: []
        });
        if (this.otherEditor && this.activeEditor) {
            this.otherSession.setOption("wrap", this.activeEditor.getOption("wrap"));
        }
        this.setupScrollbars();
    };
    BaseDiffView.prototype.addGutterDecorators = function () {
        if (!this.gutterDecoratorA)
            this.gutterDecoratorA = new MinimalGutterDiffDecorator(this.editorA, -1);
        if (!this.gutterDecoratorB)
            this.gutterDecoratorB = new MinimalGutterDiffDecorator(this.editorB, 1);
    };
    /**
     * @param {EditSession} [session]
     * @param {string} [value]
     */
    BaseDiffView.prototype.$setupModel = function (session, value) {
        var editor = new Editor(new Renderer(), session);
        editor.session.setUndoManager(new UndoManager());
        if (value != undefined) {
            editor.setValue(value, -1);
        }
        return editor;
    };
    BaseDiffView.prototype.foldUnchanged = function () {
        var chunks = this.chunks;
        var placeholder = "-".repeat(120);
        var prev = {
            old: new Range(0, 0, 0, 0),
            new: new Range(0, 0, 0, 0)
        };
        var foldsChanged = false;
        for (var i = 0; i < chunks.length + 1; i++) {
            var current = chunks[i] || {
                old: new Range(this.sessionA.getLength(), 0, this.sessionA.getLength(), 0),
                new: new Range(this.sessionB.getLength(), 0, this.sessionB.getLength(), 0)
            };
            var l = current.new.start.row - prev.new.end.row - 5;
            if (l > 2) {
                var s = prev.old.end.row + 2;
                var fold1 = this.sessionA.addFold(placeholder, new Range(s, 0, s + l, Number.MAX_VALUE));
                s = prev.new.end.row + 2;
                var fold2 = this.sessionB.addFold(placeholder, new Range(s, 0, s + l, Number.MAX_VALUE));
                if (fold1 || fold2)
                    foldsChanged = true;
                if (fold2 && fold1) {
                    fold1["other"] = fold2;
                    fold2["other"] = fold1;
                }
            }
            prev = current;
        }
        return foldsChanged;
    };
    BaseDiffView.prototype.unfoldUnchanged = function () {
        var folds = this.sessionA.getAllFolds();
        for (var i = folds.length - 1; i >= 0; i--) {
            var fold = folds[i];
            if (fold.placeholder.length == 120) {
                this.sessionA.removeFold(fold);
            }
        }
    };
    BaseDiffView.prototype.toggleFoldUnchanged = function () {
        if (!this.foldUnchanged()) {
            this.unfoldUnchanged();
        }
    };
    /**
     * @param {{ sessionA: any; sessionB: EditSession; chunks: DiffChunk[] }} session
     */
    BaseDiffView.prototype.setDiffSession = function (session) {
        if (this.diffSession) {
            this.$detachSessionsEventHandlers();
            this.clearSelectionMarkers();
        }
        this.diffSession = session;
        this.sessionA = this.sessionB = null;
        if (this.diffSession) {
            this.chunks = this.diffSession.chunks || [];
            this.editorA && this.editorA.setSession(session.sessionA);
            this.editorB && this.editorB.setSession(session.sessionB);
            this.sessionA = this.diffSession.sessionA;
            this.sessionB = this.diffSession.sessionB;
            this.$attachSessionsEventHandlers();
            this.initSelectionMarkers();
        }
        this.otherSession = this.showSideA ? this.sessionB : this.sessionA;
    };
    /**
     * @abstract
     */
    BaseDiffView.prototype.$attachSessionsEventHandlers = function () {
    };
    /**
     * @abstract
     */
    BaseDiffView.prototype.$detachSessionsEventHandlers = function () {
    };
    BaseDiffView.prototype.getDiffSession = function () {
        return this.diffSession;
    };
    BaseDiffView.prototype.setTheme = function (theme) {
        this.editorA && this.editorA.setTheme(theme);
        this.editorB && this.editorB.setTheme(theme);
    };
    BaseDiffView.prototype.getTheme = function () {
        return (this.editorA || this.editorB).getTheme();
    };
    BaseDiffView.prototype.onChangeTheme = function (e) {
        var theme = e && e.theme || this.getTheme();
        if (this.editorA && this.editorA.getTheme() !== theme) {
            this.editorA.setTheme(theme);
        }
        if (this.editorB && this.editorB.getTheme() !== theme) {
            this.editorB.setTheme(theme);
        }
    };
    BaseDiffView.prototype.resize = function (force) {
        this.editorA && this.editorA.resize(force);
        this.editorB && this.editorB.resize(force);
    };
    BaseDiffView.prototype.scheduleOnInput = function () {
        var _this = this;
        if (this.$onInputTimer)
            return;
        this.$onInputTimer = setTimeout(function () {
            _this.$onInputTimer = null;
            _this.onInput();
        });
    };
    BaseDiffView.prototype.onInput = function () {
        var _this = this;
        if (this.$onInputTimer)
            clearTimeout(this.$onInputTimer);
        var val1 = this.sessionA.doc.getAllLines();
        var val2 = this.sessionB.doc.getAllLines();
        this.selectionRangeA = null;
        this.selectionRangeB = null;
        var chunks = this.$diffLines(val1, val2);
        this.diffSession.chunks = this.chunks = chunks;
        this.gutterDecoratorA && this.gutterDecoratorA.setDecorations(chunks);
        this.gutterDecoratorB && this.gutterDecoratorB.setDecorations(chunks);
        // if we"re dealing with too many chunks, fail silently
        if (this.chunks && this.chunks.length > this.$maxDiffs) {
            return;
        }
        this.align();
        this.editorA && this.editorA.renderer.updateBackMarkers();
        this.editorB && this.editorB.renderer.updateBackMarkers();
        setTimeout(function () {
            _this.updateScrollBarDecorators();
        }, 0);
        if (this.$foldUnchangedOnInput) {
            this.foldUnchanged();
        }
    };
    BaseDiffView.prototype.setupScrollbars = function () {
        var _this = this;
        /**
         * @param {Renderer & {$scrollDecorator: ScrollDiffDecorator}} renderer
         */
        var setupScrollBar = function (renderer) {
            setTimeout(function () {
                _this.$setScrollBarDecorators(renderer);
                _this.updateScrollBarDecorators();
            }, 0);
        };
        if (this.inlineDiffEditor) {
            setupScrollBar(this.activeEditor.renderer);
        }
        else {
            setupScrollBar(this.editorA.renderer);
            setupScrollBar(this.editorB.renderer);
        }
    };
    BaseDiffView.prototype.$setScrollBarDecorators = function (renderer) {
        if (renderer.$scrollDecorator) {
            renderer.$scrollDecorator.destroy();
        }
        renderer.$scrollDecorator = new ScrollDiffDecorator(renderer.scrollBarV, renderer, this.inlineDiffEditor);
        renderer.$scrollDecorator.setSessions(this.sessionA, this.sessionB);
        renderer.scrollBarV.setVisible(true);
        renderer.scrollBarV.element.style.bottom = renderer.scrollBarH.getHeight() + "px";
    };
    BaseDiffView.prototype.$resetDecorators = function (renderer) {
        if (renderer.$scrollDecorator) {
            renderer.$scrollDecorator.destroy();
        }
        renderer.$scrollDecorator = new Decorator(renderer.scrollBarV, renderer);
    };
    BaseDiffView.prototype.updateScrollBarDecorators = function () {
        var _this = this;
        if (this.inlineDiffEditor) {
            if (!this.activeEditor) {
                return;
            }
            this.activeEditor.renderer.$scrollDecorator.$zones = [];
        }
        else {
            if (!this.editorA || !this.editorB) {
                return;
            }
            this.editorA.renderer.$scrollDecorator.$zones = [];
            this.editorB.renderer.$scrollDecorator.$zones = [];
        }
        /**
         * @param {DiffChunk} change
         */
        var updateDecorators = function (editor, change) {
            if (!editor) {
                return;
            }
            if (typeof editor.renderer.$scrollDecorator.addZone !== "function") {
                return;
            }
            if (change.old.start.row != change.old.end.row) {
                editor.renderer.$scrollDecorator.addZone(change.old.start.row, change.old.end.row - 1, "delete");
            }
            if (change.new.start.row != change.new.end.row) {
                editor.renderer.$scrollDecorator.addZone(change.new.start.row, change.new.end.row - 1, "insert");
            }
        };
        if (this.inlineDiffEditor) {
            this.chunks && this.chunks.forEach(function (lineChange) {
                updateDecorators(_this.activeEditor, lineChange);
            });
            this.activeEditor.renderer.$scrollDecorator.$updateDecorators(this.activeEditor.renderer.layerConfig);
        }
        else {
            this.chunks && this.chunks.forEach(function (lineChange) {
                updateDecorators(_this.editorA, lineChange);
                updateDecorators(_this.editorB, lineChange);
            });
            this.editorA.renderer.$scrollDecorator.$updateDecorators(this.editorA.renderer.layerConfig);
            this.editorB.renderer.$scrollDecorator.$updateDecorators(this.editorB.renderer.layerConfig);
        }
    };
    /**
     *
     * @param {string[]} val1
     * @param {string[]} val2
     * @return {DiffChunk[]}
     */
    BaseDiffView.prototype.$diffLines = function (val1, val2) {
        return this.diffProvider.compute(val1, val2, {
            ignoreTrimWhitespace: this.$ignoreTrimWhitespace,
            maxComputationTimeMs: this.$maxComputationTimeMs
        });
    };
    /**
     * @param {import("./providers/default").DiffProvider} provider
     */
    BaseDiffView.prototype.setProvider = function (provider) {
        this.diffProvider = provider;
    };
    /**
     * @param {EditSession} session
     * @param {{ rowCount: number; rowsAbove: number; row: number; }} w
     */
    BaseDiffView.prototype.$addWidget = function (session, w) {
        var lineWidget = session.lineWidgets[w.row];
        if (lineWidget) {
            w.rowsAbove += lineWidget.rowsAbove > w.rowsAbove ? lineWidget.rowsAbove : w.rowsAbove;
            w.rowCount += lineWidget.rowCount;
        }
        session.lineWidgets[w.row] = w;
        session.widgetManager.lineWidgets[w.row] = w;
        session.$resetRowCache(w.row);
        var fold = session.getFoldAt(w.row, 0);
        if (fold) {
            session.widgetManager.updateOnFold({
                data: fold,
                action: "add",
            }, session);
        }
    };
    /**
     * @param {Editor} editor
     */
    BaseDiffView.prototype.$initWidgets = function (editor) {
        var session = editor.session;
        if (!session)
            return;
        if (!session.widgetManager) {
            session.widgetManager = new LineWidgets(session);
            session.widgetManager.attach(editor);
        }
        session.lineWidgets = [];
        session.widgetManager.lineWidgets = [];
        session.$resetRowCache(0);
    };
    /**
     * @param {import("../../../ace-internal").Ace.Point} pos
     * @param {EditSession} session
     */
    BaseDiffView.prototype.$screenRow = function (pos, session) {
        var row = session.documentToScreenPosition(pos).row;
        var afterEnd = pos.row - session.getLength() + 1;
        if (afterEnd > 0) {
            row += afterEnd;
        }
        return row;
    };
    /**
     * scroll locking
     * @abstract
     **/
    BaseDiffView.prototype.align = function () { };
    BaseDiffView.prototype.onChangeWrapLimit = function (e, session) { };
    BaseDiffView.prototype.onSelect = function (e, selection) {
        this.searchHighlight(selection);
        this.syncSelect(selection);
    };
    BaseDiffView.prototype.syncSelect = function (selection) {
        if (this.$updatingSelection)
            return;
        var isOld = selection.session === this.sessionA;
        var selectionRange = selection.getRange();
        var currSelectionRange = isOld ? this.selectionRangeA : this.selectionRangeB;
        if (currSelectionRange && selectionRange.isEqual(currSelectionRange))
            return;
        if (isOld) {
            this.selectionRangeA = selectionRange;
        }
        else {
            this.selectionRangeB = selectionRange;
        }
        this.$updatingSelection = true;
        var newRange = this.transformRange(selectionRange, isOld);
        if (this.$syncSelections) {
            (isOld ? this.editorB : this.editorA).session.selection.setSelectionRange(newRange);
        }
        this.$updatingSelection = false;
        if (isOld) {
            this.selectionRangeA = selectionRange;
            this.selectionRangeB = newRange;
        }
        else {
            this.selectionRangeA = newRange;
            this.selectionRangeB = selectionRange;
        }
        this.updateSelectionMarker(this.syncSelectionMarkerA, this.sessionA, this.selectionRangeA);
        this.updateSelectionMarker(this.syncSelectionMarkerB, this.sessionB, this.selectionRangeB);
    };
    BaseDiffView.prototype.updateSelectionMarker = function (marker, session, range) {
        marker.setRange(range);
        session._signal("changeFrontMarker");
    };
    /**
     * @param ev
     * @param {EditSession} session
     */
    BaseDiffView.prototype.onChangeFold = function (ev, session) {
        var fold = ev.data;
        if (this.$syncingFold || !fold || !ev.action)
            return;
        this.scheduleRealign();
        var isOrig = session === this.sessionA;
        var other = isOrig ? this.sessionB : this.sessionA;
        if (ev.action === "remove") {
            if (fold.other) {
                fold.other.other = null;
                other.removeFold(fold.other);
            }
            else if (fold.lineWidget) {
                other.widgetManager.addLineWidget(fold.lineWidget);
                fold.lineWidget = null;
                if (other["$editor"]) {
                    other["$editor"].renderer.updateBackMarkers();
                }
            }
        }
        if (ev.action === "add") {
            var range = this.transformRange(fold.range, isOrig);
            if (range.isEmpty()) {
                var row = range.start.row + 1;
                if (other.lineWidgets[row]) {
                    fold.lineWidget = other.lineWidgets[row];
                    other.widgetManager.removeLineWidget(fold.lineWidget);
                    if (other["$editor"]) {
                        other["$editor"].renderer.updateBackMarkers();
                    }
                }
            }
            else {
                this.$syncingFold = true;
                fold.other = other.addFold(fold.placeholder, range);
                if (fold.other) {
                    fold.other.other = fold;
                }
                this.$syncingFold = false;
            }
        }
    };
    BaseDiffView.prototype.scheduleRealign = function () {
        if (!this.realignPending) {
            this.realignPending = true;
            this.editorA.renderer.on("beforeRender", this.realign);
            this.editorB.renderer.on("beforeRender", this.realign);
        }
    };
    BaseDiffView.prototype.realign = function () {
        this.realignPending = true;
        this.editorA.renderer.off("beforeRender", this.realign);
        this.editorB.renderer.off("beforeRender", this.realign);
        this.align();
        this.realignPending = false;
    };
    BaseDiffView.prototype.detach = function () {
        if (!this.editorA || !this.editorB)
            return;
        if (this.savedOptionsA)
            this.editorA.setOptions(this.savedOptionsA);
        if (this.savedOptionsB)
            this.editorB.setOptions(this.savedOptionsB);
        this.editorA.renderer.off("beforeRender", this.realign);
        this.editorB.renderer.off("beforeRender", this.realign);
        this.$detachEventHandlers();
        this.$removeLineWidgets(this.sessionA);
        this.$removeLineWidgets(this.sessionB);
        this.gutterDecoratorA && this.gutterDecoratorA.dispose();
        this.gutterDecoratorB && this.gutterDecoratorB.dispose();
        this.sessionA.selection.clearSelection();
        this.sessionB.selection.clearSelection();
        if (this.savedOptionsA && this.savedOptionsA.customScrollbar) {
            this.$resetDecorators(this.editorA.renderer);
        }
        if (this.savedOptionsB && this.savedOptionsB.customScrollbar) {
            this.$resetDecorators(this.editorB.renderer);
        }
        clearTimeout(this.$onInputTimer);
    };
    BaseDiffView.prototype.$removeLineWidgets = function (session) {
        // TODO remove only our widgets
        // session.widgetManager.removeLineWidget
        session.lineWidgets = [];
        session.widgetManager.lineWidgets = [];
        session._signal("changeFold", { data: { start: { row: 0 } } });
    };
    /**
     * @abstract
     */
    BaseDiffView.prototype.$detachEventHandlers = function () {
    };
    BaseDiffView.prototype.destroy = function () {
        this.detach();
        this.editorA && this.editorA.destroy();
        this.editorB && this.editorB.destroy();
        this.editorA = this.editorB = null;
    };
    BaseDiffView.prototype.gotoNext = function (dir) {
        var ace = this.activeEditor || this.editorA;
        if (this.inlineDiffEditor) {
            ace = this.editorA;
        }
        var sideA = ace == this.editorA;
        var row = ace.selection.lead.row;
        var i = this.findChunkIndex(this.chunks, row, sideA);
        var chunk = this.chunks[i + dir] || this.chunks[i];
        var scrollTop = ace.session.getScrollTop();
        if (chunk) {
            var range = chunk[sideA ? "old" : "new"];
            var line = Math.max(range.start.row, range.end.row - 1);
            ace.selection.setRange(new Range(line, 0, line, 0));
        }
        ace.renderer.scrollSelectionIntoView(ace.selection.lead, ace.selection.anchor, 0.5);
        ace.renderer.animateScrolling(scrollTop);
    };
    BaseDiffView.prototype.firstDiffSelected = function () {
        return this.currentDiffIndex <= 1;
    };
    BaseDiffView.prototype.lastDiffSelected = function () {
        return this.currentDiffIndex > this.chunks.length - 1;
    };
    /**
     * @param {Range} range
     * @param {boolean} isOriginal
     */
    BaseDiffView.prototype.transformRange = function (range, isOriginal) {
        return Range.fromPoints(this.transformPosition(range.start, isOriginal), this.transformPosition(range.end, isOriginal));
    };
    /**
     * @param {import("ace-code").Ace.Point} pos
     * @param {boolean} isOriginal
     * @return {import("ace-code").Ace.Point}
     */
    BaseDiffView.prototype.transformPosition = function (pos, isOriginal) {
        var chunkIndex = this.findChunkIndex(this.chunks, pos.row, isOriginal);
        var chunk = this.chunks[chunkIndex];
        var clonePos = this.sessionB.doc.clonePos;
        var result = clonePos(pos);
        var _a = __read(isOriginal ? ["old", "new"] : ["new", "old"], 2), from = _a[0], to = _a[1];
        var deltaChar = 0;
        var ignoreIndent = false;
        if (chunk) {
            if (chunk[from].end.row <= pos.row) {
                result.row -= chunk[from].end.row - chunk[to].end.row;
            }
            else if (chunk.charChanges) {
                for (var i = 0; i < chunk.charChanges.length; i++) {
                    var change = chunk.charChanges[i];
                    var fromRange = change[from];
                    var toRange = change[to];
                    if (fromRange.end.row < pos.row)
                        continue;
                    if (fromRange.start.row > pos.row)
                        break;
                    if (fromRange.isMultiLine() && fromRange.contains(pos.row, pos.column)) {
                        result.row = toRange.start.row + pos.row - fromRange.start.row;
                        var maxRow = toRange.end.row;
                        if (toRange.end.column === 0)
                            maxRow--;
                        if (result.row > maxRow) {
                            result.row = maxRow;
                            result.column = (isOriginal ? this.sessionB : this.sessionA).getLine(maxRow).length;
                            ignoreIndent = true;
                        }
                        result.row = Math.min(result.row, maxRow);
                    }
                    else {
                        result.row = toRange.start.row;
                        if (fromRange.start.column > pos.column)
                            break;
                        ignoreIndent = true;
                        if (!fromRange.isEmpty() && fromRange.contains(pos.row, pos.column)) {
                            result.column = toRange.start.column;
                            deltaChar = pos.column - fromRange.start.column;
                            deltaChar = Math.min(deltaChar, toRange.end.column - toRange.start.column);
                        }
                        else {
                            result = clonePos(toRange.end);
                            deltaChar = pos.column - fromRange.end.column;
                        }
                    }
                }
            }
            else if (chunk[from].start.row <= pos.row) {
                result.row += chunk[to].start.row - chunk[from].start.row;
                if (result.row >= chunk[to].end.row) {
                    result.row = chunk[to].end.row - 1;
                    result.column = (isOriginal ? this.sessionB : this.sessionA).getLine(result.row).length;
                }
            }
        }
        if (!ignoreIndent) { //TODO:
            var _b = __read(isOriginal ? [this.sessionA, this.sessionB] : [
                this.sessionB, this.sessionA
            ], 2), fromEditSession = _b[0], toEditSession = _b[1];
            deltaChar -= this.$getDeltaIndent(fromEditSession, toEditSession, pos.row, result.row);
        }
        result.column += deltaChar;
        return result;
    };
    /**
     * @param {EditSession} fromEditSession
     * @param {EditSession} toEditSession
     * @param {number} fromLine
     * @param {number} toLine
     */
    BaseDiffView.prototype.$getDeltaIndent = function (fromEditSession, toEditSession, fromLine, toLine) {
        var origIndent = this.$getIndent(fromEditSession, fromLine);
        var editIndent = this.$getIndent(toEditSession, toLine);
        return origIndent - editIndent;
    };
    /**
     * @param {EditSession} editSession
     * @param {number} line
     */
    BaseDiffView.prototype.$getIndent = function (editSession, line) {
        return editSession.getLine(line).match(/^\s*/)[0].length;
    };
    BaseDiffView.prototype.printDiffs = function () {
        this.chunks.forEach(function (diff) {
            console.log(diff.toString());
        });
    };
    /**
     *
     * @param {DiffChunk[]} chunks
     * @param {number} row
     * @param {boolean} isOriginal
     * @return {number}
     */
    BaseDiffView.prototype.findChunkIndex = function (chunks, row, isOriginal) {
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            var chunk = isOriginal ? ch.old : ch.new;
            if (chunk.end.row < row)
                continue;
            if (chunk.start.row > row)
                break;
        }
        this.currentDiffIndex = i;
        return i - 1;
    };
    BaseDiffView.prototype.searchHighlight = function (selection) {
        if (this.$syncSelections || this.inlineDiffEditor) {
            return;
        }
        var currSession = selection.session;
        var otherSession = currSession === this.sessionA
            ? this.sessionB : this.sessionA;
        otherSession.highlight(currSession.$searchHighlight.regExp);
        otherSession._signal("changeBackMarker");
    };
    BaseDiffView.prototype.initSelectionMarkers = function () {
        this.syncSelectionMarkerA = new SyncSelectionMarker();
        this.syncSelectionMarkerB = new SyncSelectionMarker();
        this.sessionA.addDynamicMarker(this.syncSelectionMarkerA, true);
        this.sessionB.addDynamicMarker(this.syncSelectionMarkerB, true);
    };
    BaseDiffView.prototype.clearSelectionMarkers = function () {
        this.sessionA.removeMarker(this.syncSelectionMarkerA.id);
        this.sessionB.removeMarker(this.syncSelectionMarkerB.id);
    };
    return BaseDiffView;
}());
/*** options ***/
config.defineOptions(BaseDiffView.prototype, "DiffView", {
    showOtherLineNumbers: {
        set: function (value) {
            if (this.gutterLayer) {
                this.gutterLayer.$renderer = value ? null : emptyGutterRenderer;
                this.editorA.renderer.updateFull();
            }
        },
        initialValue: true
    },
    folding: {
        set: function (value) {
            this.editorA.setOption("showFoldWidgets", value);
            this.editorB.setOption("showFoldWidgets", value);
            if (!value) {
                var posA = [];
                var posB = [];
                if (this.chunks) {
                    this.chunks.forEach(function (x) {
                        posA.push(x.old.start, x.old.end);
                        posB.push(x.new.start, x.new.end);
                    });
                }
                this.sessionA.unfold(posA);
                this.sessionB.unfold(posB);
            }
        }
    },
    syncSelections: {
        set: function (value) {
        },
    },
    ignoreTrimWhitespace: {
        set: function (value) {
            this.scheduleOnInput();
        },
    },
    wrap: {
        set: function (value) {
            this.sessionA.setOption("wrap", value);
            this.sessionB.setOption("wrap", value);
        }
    },
    maxDiffs: {
        value: 5000,
    },
    theme: {
        set: function (value) {
            this.setTheme(value);
        },
        get: function () {
            return this.editorA.getTheme();
        }
    },
});
var emptyGutterRenderer = {
    getText: function name(params) {
        return "";
    },
    getWidth: function () {
        return 0;
    }
};
exports.BaseDiffView = BaseDiffView;
var DiffChunk = /** @class */ (function () {
    /**
     * @param {Range} originalRange
     * @param {Range} modifiedRange
     * @param {{originalStartLineNumber: number, originalStartColumn: number,
     * originalEndLineNumber: number, originalEndColumn: number, modifiedStartLineNumber: number,
     * modifiedStartColumn: number, modifiedEndLineNumber: number, modifiedEndColumn: number}[]} [charChanges]
     */
    function DiffChunk(originalRange, modifiedRange, charChanges) {
        this.old = originalRange;
        this.new = modifiedRange;
        this.charChanges = charChanges && charChanges.map(function (m) { return new DiffChunk(new Range(m.originalStartLineNumber, m.originalStartColumn, m.originalEndLineNumber, m.originalEndColumn), new Range(m.modifiedStartLineNumber, m.modifiedStartColumn, m.modifiedEndLineNumber, m.modifiedEndColumn)); });
    }
    return DiffChunk;
}());
var DiffHighlight = /** @class */ (function () {
    /**
     * @param {import("./base_diff_view").BaseDiffView} diffView
     * @param type
     */
    function DiffHighlight(diffView, type) {
        /**@type{number}*/ this.id;
        this.diffView = diffView;
        this.type = type;
    }
    DiffHighlight.prototype.update = function (html, markerLayer, session, config) {
        var dir, operation, opOperation;
        var diffView = this.diffView;
        if (this.type === -1) { // original editor
            dir = "old";
            operation = "delete";
            opOperation = "insert";
        }
        else { //modified editor
            dir = "new";
            operation = "insert";
            opOperation = "delete";
        }
        var ignoreTrimWhitespace = diffView.$ignoreTrimWhitespace;
        var lineChanges = diffView.chunks;
        if (session.lineWidgets && !diffView.inlineDiffEditor) {
            for (var row = config.firstRow; row <= config.lastRow; row++) {
                var lineWidget = session.lineWidgets[row];
                if (!lineWidget || lineWidget.hidden)
                    continue;
                var start = session.documentToScreenRow(row, 0);
                if (lineWidget.rowsAbove > 0) {
                    var range = new Range(start - lineWidget.rowsAbove, 0, start - 1, Number.MAX_VALUE);
                    markerLayer.drawFullLineMarker(html, range, "ace_diff aligned_diff", config);
                }
                var end = start + lineWidget.rowCount - (lineWidget.rowsAbove || 0);
                var range = new Range(start + 1, 0, end, Number.MAX_VALUE);
                markerLayer.drawFullLineMarker(html, range, "ace_diff aligned_diff", config);
            }
        }
        lineChanges.forEach(function (lineChange) {
            var startRow = lineChange[dir].start.row;
            var endRow = lineChange[dir].end.row;
            if (endRow < config.firstRow || startRow > config.lastRow)
                return;
            var range = new Range(startRow, 0, endRow - 1, 1 << 30);
            if (startRow !== endRow) {
                range = range.toScreenRange(session);
                markerLayer.drawFullLineMarker(html, range, "ace_diff " + operation, config);
            }
            if (lineChange.charChanges) {
                for (var i = 0; i < lineChange.charChanges.length; i++) {
                    var changeRange = lineChange.charChanges[i][dir];
                    if (changeRange.end.column == 0 && changeRange.end.row > changeRange.start.row && changeRange.end.row == lineChange[dir].end.row) {
                        changeRange.end.row--;
                        changeRange.end.column = Number.MAX_VALUE;
                    }
                    if (ignoreTrimWhitespace) {
                        for (var lineNumber = changeRange.start.row; lineNumber <= changeRange.end.row; lineNumber++) {
                            var startColumn = void 0;
                            var endColumn = void 0;
                            var sessionLineStart = session.getLine(lineNumber).match(/^\s*/)[0].length;
                            var sessionLineEnd = session.getLine(lineNumber).length;
                            if (lineNumber === changeRange.start.row) {
                                startColumn = changeRange.start.column;
                            }
                            else {
                                startColumn = sessionLineStart;
                            }
                            if (lineNumber === changeRange.end.row) {
                                endColumn = changeRange.end.column;
                            }
                            else {
                                endColumn = sessionLineEnd;
                            }
                            var range_1 = new Range(lineNumber, startColumn, lineNumber, endColumn);
                            var screenRange = range_1.toScreenRange(session);
                            if (sessionLineStart === startColumn && sessionLineEnd === endColumn) {
                                continue;
                            }
                            var cssClass = "inline " + operation;
                            if (range_1.isEmpty() && startColumn !== 0) {
                                cssClass = "inline " + opOperation + " empty";
                            }
                            markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff " + cssClass, config);
                        }
                    }
                    else {
                        var range_2 = new Range(changeRange.start.row, changeRange.start.column, changeRange.end.row, changeRange.end.column);
                        var screenRange = range_2.toScreenRange(session);
                        var cssClass = "inline " + operation;
                        if (range_2.isEmpty() && changeRange.start.column !== 0) {
                            cssClass = "inline empty " + opOperation;
                        }
                        if (screenRange.isMultiLine()) {
                            markerLayer.drawTextMarker(html, screenRange, "ace_diff " + cssClass, config);
                        }
                        else {
                            markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff " + cssClass, config);
                        }
                    }
                }
            }
        });
    };
    return DiffHighlight;
}());
var SyncSelectionMarker = /** @class */ (function () {
    function SyncSelectionMarker() {
        /**@type{number}*/ this.id;
        this.type = "fullLine";
        this.clazz = "ace_diff-active-line";
    }
    SyncSelectionMarker.prototype.update = function (html, markerLayer, session, config) {
    };
    /**
     * @param {Range} range
     */
    SyncSelectionMarker.prototype.setRange = function (range) {
        var newRange = range.clone();
        newRange.end.column++;
        this.range = newRange;
    };
    return SyncSelectionMarker;
}());
exports.DiffChunk = DiffChunk;
exports.DiffHighlight = DiffHighlight;

});