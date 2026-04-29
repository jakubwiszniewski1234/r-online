define(function(require, exports, module){"use strict";
var event = require("../lib/event");
var nls = require("../config").nls;
var useragent = require("../lib/useragent");
var dom = require("../lib/dom");
var lang = require("../lib/lang");
var clipboard = require("../clipboard");
var BROKEN_SETDATA = useragent.isChrome < 18;
var USE_IE_MIME_TYPE = useragent.isIE;
var HAS_FOCUS_ARGS = useragent.isChrome > 63;
var MAX_LINE_LENGTH = 400;
/**
 *
 * @type {{[key: string]: any}}
 */
var KEYS = require("../lib/keys");
var MODS = KEYS.KEY_MODS;
var isIOS = useragent.isIOS;
var valueResetRegex = isIOS ? /\s/ : /\n/;
var isMobile = useragent.isMobile;
var TextInput = /** @class */ (function () {
    /**
     * @param {HTMLElement} parentNode
     * @param {import("../editor").Editor} host
     */
    function TextInput(parentNode, host) {
        var _this = this;
        this.host = host;
        /**@type {HTMLTextAreaElement & {msGetInputContext?: () => {compositionStartOffset: number}, getInputContext?: () => {compositionStartOffset: number}}}*/
        this.text = dom.createElement("textarea");
        this.text.className = "ace_text-input";
        this.text.setAttribute("wrap", "off");
        this.text.setAttribute("autocomplete", "off");
        this.text.setAttribute("autocorrect", "off");
        this.text.setAttribute("autocapitalize", "off");
        this.text.setAttribute("spellcheck", "false");
        this.text.style.opacity = "0";
        parentNode.insertBefore(this.text, parentNode.firstChild);
        /**@type{boolean|string}*/ this.copied = false;
        this.pasted = false;
        /**@type {(boolean|Object) & {context?: any, useTextareaForIME?: boolean, selectionStart?: number, markerRange?: any}}} */
        this.inComposition = false;
        this.sendingText = false;
        this.tempStyle = '';
        if (!isMobile)
            this.text.style.fontSize = "1px";
        this.commandMode = false;
        this.ignoreFocusEvents = false;
        this.lastValue = "";
        this.lastSelectionStart = 0;
        this.lastSelectionEnd = 0;
        this.lastRestoreEnd = 0;
        this.rowStart = Number.MAX_SAFE_INTEGER;
        this.rowEnd = Number.MIN_SAFE_INTEGER;
        this.numberOfExtraLines = 0;
        // FOCUS
        // ie9 throws error if document.activeElement is accessed too soon
        try {
            this.$isFocused = document.activeElement === this.text;
        }
        catch (e) {
        }
        this.cancelComposition = this.cancelComposition.bind(this);
        this.setAriaOptions({ role: "textbox" });
        event.addListener(this.text, "blur", function (e) {
            if (_this.ignoreFocusEvents)
                return;
            host.onBlur(e);
            _this.$isFocused = false;
        }, host);
        event.addListener(this.text, "focus", function (e) {
            if (_this.ignoreFocusEvents)
                return;
            _this.$isFocused = true;
            if (useragent.isEdge) {
                // on edge focus event is fired even if document itself is not focused
                try {
                    if (!document.hasFocus())
                        return;
                }
                catch (e) {
                }
            }
            host.onFocus(e);
            if (useragent.isEdge)
                setTimeout(_this.resetSelection.bind(_this));
            else
                _this.resetSelection();
        }, host);
        /**@type {boolean | string}*/ this.$focusScroll = false;
        host.on("beforeEndOperation", function () {
            var curOp = host.curOp;
            var commandName = curOp && curOp.command && curOp.command.name;
            if (commandName == "insertstring")
                return;
            var isUserAction = commandName && (curOp.docChanged || curOp.selectionChanged);
            if (_this.inComposition && isUserAction) {
                // exit composition from commands other than insertstring
                _this.lastValue = _this.text.value = "";
                _this.onCompositionEnd();
            }
            // sync value of textarea
            _this.resetSelection();
        });
        // if cursor changes position, we need to update the label with the correct row
        host.on("changeSelection", this.setAriaLabel.bind(this));
        this.resetSelection = isIOS ? this.$resetSelectionIOS : this.$resetSelection;
        if (this.$isFocused)
            host.onFocus();
        this.inputHandler = null;
        this.afterContextMenu = false;
        event.addCommandKeyListener(this.text, function (e, hashId, keyCode) {
            // ignore command events during composition as they will
            // either be handled by ime itself or fired again after ime end
            if (_this.inComposition)
                return;
            return host.onCommandKey(e, hashId, keyCode);
        }, host);
        event.addListener(this.text, "select", this.onSelect.bind(this), host);
        event.addListener(this.text, "input", this.onInput.bind(this), host);
        event.addListener(this.text, "cut", this.onCut.bind(this), host);
        event.addListener(this.text, "copy", this.onCopy.bind(this), host);
        event.addListener(this.text, "paste", this.onPaste.bind(this), host);
        // Opera has no clipboard events
        if (!('oncut' in this.text) || !('oncopy' in this.text) || !('onpaste' in this.text)) {
            event.addListener(parentNode, "keydown", function (e) {
                if ((useragent.isMac && !e.metaKey) || !e.ctrlKey)
                    return;
                switch (e.keyCode) {
                    case 67:
                        _this.onCopy(e);
                        break;
                    case 86:
                        _this.onPaste(e);
                        break;
                    case 88:
                        _this.onCut(e);
                        break;
                }
            }, host);
        }
        this.syncComposition = lang.delayedCall(this.onCompositionUpdate.bind(this), 50).schedule.bind(null, null); //TODO: check this
        event.addListener(this.text, "compositionstart", this.onCompositionStart.bind(this), host);
        event.addListener(this.text, "compositionupdate", this.onCompositionUpdate.bind(this), host);
        event.addListener(this.text, "keyup", this.onKeyup.bind(this), host);
        event.addListener(this.text, "keydown", this.syncComposition.bind(this), host);
        event.addListener(this.text, "compositionend", this.onCompositionEnd.bind(this), host);
        this.closeTimeout;
        event.addListener(this.text, "mouseup", this.$onContextMenu.bind(this), host);
        event.addListener(this.text, "mousedown", function (e) {
            e.preventDefault();
            _this.onContextMenuClose();
        }, host);
        event.addListener(host.renderer.scroller, "contextmenu", this.$onContextMenu.bind(this), host);
        event.addListener(this.text, "contextmenu", this.$onContextMenu.bind(this), host);
        if (isIOS)
            this.addIosSelectionHandler(parentNode, host, this.text);
    }
    /**
     * @internal
     * @param {HTMLElement} parentNode
     * @param {import("../editor").Editor} host
     * @param {HTMLTextAreaElement} text
     */
    TextInput.prototype.addIosSelectionHandler = function (parentNode, host, text) {
        var _this = this;
        var typingResetTimeout = null;
        var typing = false;
        text.addEventListener("keydown", function (e) {
            if (typingResetTimeout)
                clearTimeout(typingResetTimeout);
            typing = true;
        }, true);
        text.addEventListener("keyup", function (e) {
            typingResetTimeout = setTimeout(function () {
                typing = false;
            }, 100);
        }, true);
        // IOS doesn't fire events for arrow keys, but this unique hack changes everything!
        var detectArrowKeys = function (e) {
            if (document.activeElement !== text)
                return;
            if (typing || _this.inComposition || host.$mouseHandler.isMousePressed)
                return;
            if (_this.copied) {
                return;
            }
            var selectionStart = text.selectionStart;
            var selectionEnd = text.selectionEnd;
            var key = null;
            var modifier = 0;
            // console.log(selectionStart, selectionEnd);
            if (selectionStart == 0) {
                key = KEYS.up;
            }
            else if (selectionStart == 1) {
                key = KEYS.home;
            }
            else if (selectionEnd > _this.lastSelectionEnd && _this.lastValue[selectionEnd] == "\n") {
                key = KEYS.end;
            }
            else if (selectionStart < _this.lastSelectionStart && _this.lastValue[selectionStart - 1] == " ") {
                key = KEYS.left;
                modifier = MODS.option;
            }
            else if (selectionStart < _this.lastSelectionStart || (selectionStart == _this.lastSelectionStart
                && _this.lastSelectionEnd != _this.lastSelectionStart && selectionStart == selectionEnd)) {
                key = KEYS.left;
            }
            else if (selectionEnd > _this.lastSelectionEnd && _this.lastValue.slice(0, selectionEnd).split("\n").length > 2) {
                key = KEYS.down;
            }
            else if (selectionEnd > _this.lastSelectionEnd && _this.lastValue[selectionEnd - 1] == " ") {
                key = KEYS.right;
                modifier = MODS.option;
            }
            else if (selectionEnd > _this.lastSelectionEnd || (selectionEnd == _this.lastSelectionEnd
                && _this.lastSelectionEnd != _this.lastSelectionStart && selectionStart == selectionEnd)) {
                key = KEYS.right;
            }
            if (selectionStart !== selectionEnd)
                modifier |= MODS.shift;
            if (key) {
                var result = host.onCommandKey({}, modifier, key);
                if (!result && host.commands) {
                    key = KEYS.keyCodeToString(key);
                    var command = host.commands.findKeyCommand(modifier, key);
                    if (command)
                        host.execCommand(command);
                }
                _this.lastSelectionStart = selectionStart;
                _this.lastSelectionEnd = selectionEnd;
                _this.resetSelection("");
            }
        };
        // On iOS, "selectionchange" can only be attached to the document object...
        document.addEventListener("selectionchange", detectArrowKeys);
        host.on("destroy", function () {
            document.removeEventListener("selectionchange", detectArrowKeys);
        });
    };
    TextInput.prototype.onContextMenuClose = function () {
        var _this = this;
        clearTimeout(this.closeTimeout);
        this.closeTimeout = setTimeout(function () {
            if (_this.tempStyle) {
                _this.text.style.cssText = _this.tempStyle;
                _this.tempStyle = '';
            }
            _this.host.renderer.$isMousePressed = false;
            if (_this.host.renderer.$keepTextAreaAtCursor)
                _this.host.renderer.$moveTextAreaToCursor();
        }, 0);
    };
    TextInput.prototype.$onContextMenu = function (e) {
        this.host.textInput.onContextMenu(e);
        this.onContextMenuClose();
    };
    /**
     * @internal
     * @param e
     */
    TextInput.prototype.onKeyup = function (e) {
        // workaround for a bug in ie where pressing esc silently moves selection out of textarea
        if (e.keyCode == 27 && this.text.value.length < this.text.selectionStart) {
            if (!this.inComposition)
                this.lastValue = this.text.value;
            this.lastSelectionStart = this.lastSelectionEnd = -1;
            this.resetSelection();
        }
        this.syncComposition();
    };
    // COMPOSITION
    /**
     * @internal
     */
    TextInput.prototype.cancelComposition = function () {
        // force end composition
        this.ignoreFocusEvents = true;
        this.text.blur();
        this.text.focus();
        this.ignoreFocusEvents = false;
    };
    /**
     * @internal
     */
    TextInput.prototype.onCompositionStart = function (e) {
        if (this.inComposition || !this.host.onCompositionStart || this.host.$readOnly)
            return;
        this.inComposition = {};
        if (this.commandMode)
            return;
        if (e.data)
            this.inComposition.useTextareaForIME = false;
        setTimeout(this.onCompositionUpdate.bind(this), 0);
        this.host._signal("compositionStart");
        this.host.on("mousedown", this.cancelComposition); //TODO:
        var range = this.host.getSelectionRange();
        range.end.row = range.start.row;
        range.end.column = range.start.column;
        this.inComposition.markerRange = range;
        this.inComposition.selectionStart = this.lastSelectionStart;
        this.host.onCompositionStart(this.inComposition);
        if (this.inComposition.useTextareaForIME) {
            this.lastValue = this.text.value = "";
            this.lastSelectionStart = 0;
            this.lastSelectionEnd = 0;
        }
        else {
            if (this.text.msGetInputContext)
                this.inComposition.context = this.text.msGetInputContext();
            if (this.text.getInputContext)
                this.inComposition.context = this.text.getInputContext();
        }
    };
    /**
     * @internal
     */
    TextInput.prototype.onCompositionUpdate = function () {
        if (!this.inComposition || !this.host.onCompositionUpdate || this.host.$readOnly)
            return;
        if (this.commandMode)
            return this.cancelComposition();
        if (this.inComposition.useTextareaForIME) {
            this.host.onCompositionUpdate(this.text.value);
        }
        else {
            var data = this.text.value;
            this.sendText(data);
            if (this.inComposition.markerRange) {
                if (this.inComposition.context) {
                    this.inComposition.markerRange.start.column = this.inComposition.selectionStart = this.inComposition.context.compositionStartOffset;
                }
                this.inComposition.markerRange.end.column = this.inComposition.markerRange.start.column
                    + this.lastSelectionEnd - this.inComposition.selectionStart + this.lastRestoreEnd;
            }
        }
    };
    /**
     * @internal
     */
    TextInput.prototype.onCompositionEnd = function (e) {
        if (!this.host.onCompositionEnd || this.host.$readOnly)
            return;
        this.inComposition = false;
        this.host.onCompositionEnd();
        this.host.off("mousedown", this.cancelComposition);
        // note that resetting value of textarea at this point doesn't always work
        // because textarea value can be silently restored
        if (e)
            this.onInput();
    };
    /**
     * @internal
     */
    TextInput.prototype.onCut = function (e) {
        this.doCopy(e, true);
    };
    /**
     * @internal
     */
    TextInput.prototype.onCopy = function (e) {
        this.doCopy(e, false);
    };
    /**
     * @internal
     */
    TextInput.prototype.onPaste = function (e) {
        var data = this.handleClipboardData(e);
        if (clipboard.pasteCancelled())
            return;
        if (typeof data == "string") {
            if (data)
                this.host.onPaste(data, e);
            if (useragent.isIE)
                setTimeout(this.resetSelection);
            event.preventDefault(e);
        }
        else {
            this.text.value = "";
            this.pasted = true;
        }
    };
    /**
     * @internal
     * @param {ClipboardEvent} e
     * @param {boolean} isCut
     */
    TextInput.prototype.doCopy = function (e, isCut) {
        var _this = this;
        var data = this.host.getCopyText();
        if (!data)
            return event.preventDefault(e);
        if (this.handleClipboardData(e, data)) {
            if (isIOS) {
                this.resetSelection(data);
                this.copied = data;
                setTimeout(function () {
                    _this.copied = false;
                }, 10);
            }
            isCut ? this.host.onCut() : this.host.onCopy();
            event.preventDefault(e);
        }
        else {
            this.copied = true;
            this.text.value = data;
            this.text.select();
            setTimeout(function () {
                _this.copied = false;
                _this.resetSelection();
                isCut ? _this.host.onCut() : _this.host.onCopy();
            });
        }
    };
    /**
     *
     * @internal
     * @param {ClipboardEvent} e
     * @param {string} [data]
     * @param {boolean} [forceIEMime]
     */
    TextInput.prototype.handleClipboardData = function (e, data, forceIEMime) {
        var clipboardData = e.clipboardData || window["clipboardData"];
        if (!clipboardData || BROKEN_SETDATA)
            return;
        // using "Text" doesn't work on old webkit but ie needs it
        var mime = USE_IE_MIME_TYPE || forceIEMime ? "Text" : "text/plain";
        try {
            if (data) {
                // Safari 5 has clipboardData object, but does not handle setData()
                return clipboardData.setData(mime, data) !== false;
            }
            else {
                return clipboardData.getData(mime);
            }
        }
        catch (e) {
            if (!forceIEMime)
                return this.handleClipboardData(e, data, true);
        }
    };
    /**
     * @internal
     * @param e
     */
    TextInput.prototype.onInput = function (e) {
        if (this.inComposition)
            return this.onCompositionUpdate();
        if (e && e.inputType) {
            if (e.inputType == "historyUndo")
                return this.host.execCommand("undo");
            if (e.inputType == "historyRedo")
                return this.host.execCommand("redo");
        }
        var data = this.text.value;
        var inserted = this.sendText(data, true);
        if (data.length > MAX_LINE_LENGTH + 100 || valueResetRegex.test(inserted) || isMobile && this.lastSelectionStart
            < 1 && this.lastSelectionStart == this.lastSelectionEnd) {
            this.resetSelection();
        }
    };
    /**
     * @internal
     * @param {string} value
     * @param {boolean} [fromInput]
     * @return {string}
     */
    TextInput.prototype.sendText = function (value, fromInput) {
        if (this.afterContextMenu)
            this.afterContextMenu = false;
        if (this.pasted) {
            this.resetSelection();
            if (value)
                this.host.onPaste(value);
            this.pasted = false;
            return "";
        }
        else {
            var selectionStart = this.text.selectionStart;
            var selectionEnd = this.text.selectionEnd;
            var extendLeft = this.lastSelectionStart;
            var extendRight = this.lastValue.length - this.lastSelectionEnd;
            var inserted = value;
            var restoreStart = value.length - selectionStart;
            var restoreEnd = value.length - selectionEnd;
            var i = 0;
            while (extendLeft > 0 && this.lastValue[i] == value[i]) {
                i++;
                extendLeft--;
            }
            inserted = inserted.slice(i);
            i = 1;
            while (extendRight > 0 && this.lastValue.length - i > this.lastSelectionStart - 1
                && this.lastValue[this.lastValue.length - i] == value[value.length - i]) {
                i++;
                extendRight--;
            }
            restoreStart -= i - 1;
            restoreEnd -= i - 1;
            var endIndex = inserted.length - i + 1;
            if (endIndex < 0) {
                extendLeft = -endIndex;
                endIndex = 0;
            }
            inserted = inserted.slice(0, endIndex);
            // composition update can be called without any change
            if (!fromInput && !inserted && !restoreStart && !extendLeft && !extendRight && !restoreEnd)
                return "";
            this.sendingText = true;
            // some android keyboards converts two spaces into sentence end, which is not useful for code
            var shouldReset = false;
            if (useragent.isAndroid && inserted == ". ") {
                inserted = "  ";
                shouldReset = true;
            }
            if (inserted && !extendLeft && !extendRight && !restoreStart && !restoreEnd || this.commandMode) {
                this.host.onTextInput(inserted);
            }
            else {
                this.host.onTextInput(inserted, {
                    extendLeft: extendLeft,
                    extendRight: extendRight,
                    restoreStart: restoreStart,
                    restoreEnd: restoreEnd
                });
            }
            this.sendingText = false;
            this.lastValue = value;
            this.lastSelectionStart = selectionStart;
            this.lastSelectionEnd = selectionEnd;
            this.lastRestoreEnd = restoreEnd;
            return shouldReset ? "\n" : inserted;
        }
    };
    /**
     * @internal
     * @param e
     */
    TextInput.prototype.onSelect = function (e) {
        var _this = this;
        if (this.inComposition)
            return;
        var isAllSelected = function (text) {
            return text.selectionStart === 0 && text.selectionEnd >= _this.lastValue.length && text.value
                === _this.lastValue && _this.lastValue && text.selectionEnd !== _this.lastSelectionEnd;
        };
        if (this.copied) {
            this.copied = false;
        }
        else if (isAllSelected(this.text)) {
            this.host.selectAll();
            this.resetSelection();
        }
        else if (isMobile && this.text.selectionStart != this.lastSelectionStart) {
            this.resetSelection();
        }
    };
    TextInput.prototype.$resetSelectionIOS = function (value) {
        if (!this.$isFocused || (this.copied && !value) || this.sendingText)
            return;
        if (!value)
            value = "";
        var newValue = "\n ab" + value + "cde fg\n";
        if (newValue != this.text.value)
            this.text.value = this.lastValue = newValue;
        var selectionStart = 4;
        var selectionEnd = 4 + (value.length || (this.host.selection.isEmpty() ? 0 : 1));
        if (this.lastSelectionStart != selectionStart || this.lastSelectionEnd != selectionEnd) {
            this.text.setSelectionRange(selectionStart, selectionEnd);
        }
        this.lastSelectionStart = selectionStart;
        this.lastSelectionEnd = selectionEnd;
    };
    TextInput.prototype.$resetSelection = function () {
        var _this = this;
        if (this.inComposition || this.sendingText)
            return;
        // modifying selection of blured textarea can focus it (chrome mac/linux)
        if (!this.$isFocused && !this.afterContextMenu)
            return;
        // see https://github.com/ajaxorg/ace/issues/2114
        // this prevents infinite recursion on safari 8
        this.inComposition = true;
        var selectionStart = 0;
        var selectionEnd = 0;
        var line = "";
        // Convert from row,column position to the linear position with respect to the current
        // block of lines in the textarea.
        var positionToSelection = function (row, column) {
            var selection = column;
            for (var i = 1; i <= row - _this.rowStart && i < 2 * _this.numberOfExtraLines + 1; i++) {
                selection += _this.host.session.getLine(row - i).length + 1;
            }
            return selection;
        };
        if (this.host.session) {
            var selection = this.host.selection;
            var range = selection.getRange();
            var row = selection.cursor.row;
            // We keep 2*numberOfExtraLines + 1 lines in the textarea, if the new active row
            // is within the current block of lines in the textarea we do nothing. If the new row
            // is one row above or below the current block, move up or down to the next block of lines.
            // If the new row is further than 1 row away from the current block grab a new block centered
            // around the new row.
            if (row === this.rowEnd + 1) {
                this.rowStart = this.rowEnd + 1;
                this.rowEnd = this.rowStart + 2 * this.numberOfExtraLines;
            }
            else if (row === this.rowStart - 1) {
                this.rowEnd = this.rowStart - 1;
                this.rowStart = this.rowEnd - 2 * this.numberOfExtraLines;
            }
            else if (row < this.rowStart - 1 || row > this.rowEnd + 1) {
                this.rowStart = row > this.numberOfExtraLines ? row - this.numberOfExtraLines : 0;
                this.rowEnd = row > this.numberOfExtraLines ? row + this.numberOfExtraLines : 2
                    * this.numberOfExtraLines;
            }
            var lines = [];
            for (var i = this.rowStart; i <= this.rowEnd; i++) {
                lines.push(this.host.session.getLine(i));
            }
            line = lines.join('\n');
            selectionStart = positionToSelection(range.start.row, range.start.column);
            selectionEnd = positionToSelection(range.end.row, range.end.column);
            if (range.start.row < this.rowStart) {
                var prevLine = this.host.session.getLine(this.rowStart - 1);
                selectionStart = range.start.row < this.rowStart - 1 ? 0 : selectionStart;
                selectionEnd += prevLine.length + 1;
                line = prevLine + "\n" + line;
            }
            else if (range.end.row > this.rowEnd) {
                var nextLine = this.host.session.getLine(this.rowEnd + 1);
                selectionEnd = range.end.row > this.rowEnd + 1 ? nextLine.length : range.end.column;
                selectionEnd += line.length + 1;
                line = line + "\n" + nextLine;
            }
            else if (isMobile && row > 0) {
                line = "\n" + line;
                selectionEnd += 1;
                selectionStart += 1;
            }
            if (line.length > MAX_LINE_LENGTH) {
                if (selectionStart < MAX_LINE_LENGTH && selectionEnd < MAX_LINE_LENGTH) {
                    line = line.slice(0, MAX_LINE_LENGTH);
                }
                else {
                    line = "\n";
                    if (selectionStart == selectionEnd) {
                        selectionStart = selectionEnd = 0;
                    }
                    else {
                        selectionStart = 0;
                        selectionEnd = 1;
                    }
                }
            }
            var newValue = line + "\n\n";
            if (newValue != this.lastValue) {
                this.text.value = this.lastValue = newValue;
                this.lastSelectionStart = this.lastSelectionEnd = newValue.length;
            }
        }
        // contextmenu on mac may change the selection
        if (this.afterContextMenu) {
            this.lastSelectionStart = this.text.selectionStart;
            this.lastSelectionEnd = this.text.selectionEnd;
        }
        // on firefox this throws if textarea is hidden
        if (this.lastSelectionEnd != selectionEnd || this.lastSelectionStart != selectionStart || this.text.selectionEnd
            != this.lastSelectionEnd // on ie edge selectionEnd changes silently after the initialization
        ) {
            try {
                this.text.setSelectionRange(selectionStart, selectionEnd);
                this.lastSelectionStart = selectionStart;
                this.lastSelectionEnd = selectionEnd;
            }
            catch (e) {
            }
        }
        this.inComposition = false;
    };
    /**
     * @param {import("../editor").Editor} newHost
     */
    TextInput.prototype.setHost = function (newHost) {
        this.host = newHost;
    };
    /**
     * Sets the number of extra lines in the textarea to improve screen reader compatibility.
     * Extra lines can help screen readers perform better when reading text.
     *
     * @param {number} number - The number of extra lines to add. Must be non-negative.
     */
    TextInput.prototype.setNumberOfExtraLines = function (number) {
        this.rowStart = Number.MAX_SAFE_INTEGER;
        this.rowEnd = Number.MIN_SAFE_INTEGER;
        if (number < 0) {
            this.numberOfExtraLines = 0;
            return;
        }
        this.numberOfExtraLines = number;
    };
    TextInput.prototype.setAriaLabel = function () {
        var ariaLabel = "";
        if (this.host.$textInputAriaLabel) {
            ariaLabel += "".concat(this.host.$textInputAriaLabel, ", ");
        }
        if (this.host.session) {
            var row = this.host.session.selection.cursor.row;
            ariaLabel += nls("text-input.aria-label", "Cursor at row $0", [row + 1]);
        }
        this.text.setAttribute("aria-label", ariaLabel);
    };
    /**
     * @param {import("../../ace-internal").Ace.TextInputAriaOptions} options
     */
    TextInput.prototype.setAriaOptions = function (options) {
        if (options.activeDescendant) {
            this.text.setAttribute("aria-haspopup", "true");
            this.text.setAttribute("aria-autocomplete", options.inline ? "both" : "list");
            this.text.setAttribute("aria-activedescendant", options.activeDescendant);
        }
        else {
            this.text.setAttribute("aria-haspopup", "false");
            this.text.setAttribute("aria-autocomplete", "both");
            this.text.removeAttribute("aria-activedescendant");
        }
        if (options.role) {
            this.text.setAttribute("role", options.role);
        }
        if (options.setLabel) {
            this.text.setAttribute("aria-roledescription", nls("text-input.aria-roledescription", "editor"));
            this.setAriaLabel();
        }
    };
    TextInput.prototype.focus = function () {
        var _this = this;
        // On focusing on the textarea, read active row number to assistive tech.
        this.setAriaOptions({
            setLabel: this.host.renderer.enableKeyboardAccessibility
        });
        if (this.tempStyle || HAS_FOCUS_ARGS || this.$focusScroll == "browser")
            return this.text.focus({ preventScroll: true });
        var top = this.text.style.top;
        this.text.style.position = "fixed";
        this.text.style.top = "0px";
        try {
            var isTransformed = this.text.getBoundingClientRect().top != 0;
        }
        catch (e) {
            // getBoundingClientRect on IE throws error if element is not in the dom tree
            return;
        }
        var ancestors = [];
        if (isTransformed) {
            var t = this.text.parentElement;
            while (t && t.nodeType == 1) {
                ancestors.push(t);
                t.setAttribute("ace_nocontext", "true");
                if (!t.parentElement && t.getRootNode)
                    t = t.getRootNode()["host"];
                else
                    t = t.parentElement;
            }
        }
        this.text.focus({ preventScroll: true });
        if (isTransformed) {
            ancestors.forEach(function (p) {
                p.removeAttribute("ace_nocontext");
            });
        }
        setTimeout(function () {
            _this.text.style.position = "";
            if (_this.text.style.top == "0px")
                _this.text.style.top = top;
        }, 0);
    };
    TextInput.prototype.blur = function () {
        this.text.blur();
    };
    TextInput.prototype.isFocused = function () {
        return this.$isFocused;
    };
    TextInput.prototype.setInputHandler = function (cb) {
        this.inputHandler = cb;
    };
    TextInput.prototype.getInputHandler = function () {
        return this.inputHandler;
    };
    TextInput.prototype.getElement = function () {
        return this.text;
    };
    /**
     * allows to ignore composition (used by vim keyboard handler in the normal mode)
     * this is useful on mac, where with some keyboard layouts (e.g swedish) ^ starts composition
     * @param {boolean} value
     */
    TextInput.prototype.setCommandMode = function (value) {
        this.commandMode = value;
        this.text.readOnly = false;
    };
    TextInput.prototype.setReadOnly = function (readOnly) {
        if (!this.commandMode)
            this.text.readOnly = readOnly;
    };
    TextInput.prototype.setCopyWithEmptySelection = function (value) {
    };
    TextInput.prototype.onContextMenu = function (e) {
        this.afterContextMenu = true;
        this.resetSelection();
        this.host._emit("nativecontextmenu", {
            target: this.host,
            domEvent: e
        });
        this.moveToMouse(e, true);
    };
    /**
     * @param e
     * @param {boolean} bringToFront
     */
    TextInput.prototype.moveToMouse = function (e, bringToFront) {
        var _this = this;
        if (!this.tempStyle)
            this.tempStyle = this.text.style.cssText;
        this.text.style.cssText = (bringToFront ? "z-index:100000;" : "") + (useragent.isIE ? "opacity:0.1;" : "")
            + "text-indent: -" + (this.lastSelectionStart + this.lastSelectionEnd) * this.host.renderer.characterWidth
            * 0.5 + "px;";
        var rect = this.host.container.getBoundingClientRect();
        var style = dom.computedStyle(this.host.container);
        var top = rect.top + (parseInt(style.borderTopWidth) || 0);
        var left = rect.left + (parseInt(style.borderLeftWidth) || 0);
        var maxTop = rect.bottom - top - this.text.clientHeight - 2;
        var move = function (e) {
            dom.translate(_this.text, e.clientX - left - 2, Math.min(e.clientY - top - 2, maxTop));
        };
        move(e);
        if (e.type != "mousedown")
            return;
        this.host.renderer.$isMousePressed = true;
        clearTimeout(this.closeTimeout);
        // on windows context menu is opened after mouseup
        if (useragent.isWin)
            event.capture(this.host.container, move, this.onContextMenuClose.bind(this));
    };
    TextInput.prototype.destroy = function () {
        if (this.text.parentElement)
            this.text.parentElement.removeChild(this.text);
    };
    return TextInput;
}());
exports.TextInput = TextInput;
exports.$setUserAgentForTests = function (_isMobile, _isIOS) {
    isMobile = _isMobile;
    isIOS = _isIOS;
};

});