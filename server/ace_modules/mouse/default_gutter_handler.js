define(function(require, exports, module){"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
/**
 * @typedef {import("./mouse_handler").MouseHandler} MouseHandler
 */
var dom = require("../lib/dom");
var MouseEvent = require("./mouse_event").MouseEvent;
var HoverTooltip = require("../tooltip").HoverTooltip;
var nls = require("../config").nls;
var Range = require("../range").Range;
/**
 * @param {MouseHandler} mouseHandler
 * @this {MouseHandler}
 */
function GutterHandler(mouseHandler) {
    var editor = mouseHandler.editor;
    var gutter = editor.renderer.$gutterLayer;
    mouseHandler.$tooltip = new GutterTooltip(editor);
    mouseHandler.$tooltip.addToEditor(editor);
    mouseHandler.$tooltip.setDataProvider(function (e, editor) {
        var row = e.getDocumentPosition().row;
        mouseHandler.$tooltip.showTooltip(row);
    });
    mouseHandler.editor.setDefaultHandler("guttermousedown", function (e) {
        if (!editor.isFocused() || e.getButton() != 0)
            return;
        var gutterRegion = gutter.getRegion(e);
        if (gutterRegion == "foldWidgets")
            return;
        var row = e.getDocumentPosition().row;
        var selection = editor.session.selection;
        if (e.getShiftKey())
            selection.selectTo(row, 0);
        else {
            if (e.domEvent.detail == 2) {
                editor.selectAll();
                return e.preventDefault();
            }
            mouseHandler.$clickSelection = editor.selection.getLineRange(row);
        }
        mouseHandler.setState("selectByLines");
        mouseHandler.captureMouse(e);
        return e.preventDefault();
    });
}
exports.GutterHandler = GutterHandler;
var GutterTooltip = /** @class */ (function (_super) {
    __extends(GutterTooltip, _super);
    /**
     * @param {import("../editor").Editor} editor
     */
    function GutterTooltip(editor) {
        var _this = _super.call(this, editor.container) || this;
        _this.id = "gt" + (++GutterTooltip.$uid);
        _this.editor = editor;
        /**@type {Number | Undefined}*/
        _this.visibleTooltipRow;
        var el = _this.getElement();
        el.setAttribute("role", "tooltip");
        el.setAttribute("id", _this.id);
        el.style.pointerEvents = "auto";
        _this.idleTime = 50;
        _this.onDomMouseMove = _this.onDomMouseMove.bind(_this);
        _this.onDomMouseOut = _this.onDomMouseOut.bind(_this);
        _this.setClassName("ace_gutter-tooltip");
        return _this;
    }
    GutterTooltip.prototype.onDomMouseMove = function (domEvent) {
        var aceEvent = new MouseEvent(domEvent, this.editor);
        this.onMouseMove(aceEvent, this.editor);
    };
    GutterTooltip.prototype.onDomMouseOut = function (domEvent) {
        var aceEvent = new MouseEvent(domEvent, this.editor);
        this.onMouseOut(aceEvent);
    };
    GutterTooltip.prototype.addToEditor = function (editor) {
        var gutter = editor.renderer.$gutter;
        gutter.addEventListener("mousemove", this.onDomMouseMove);
        gutter.addEventListener("mouseout", this.onDomMouseOut);
        _super.prototype.addToEditor.call(this, editor);
    };
    GutterTooltip.prototype.removeFromEditor = function (editor) {
        var gutter = editor.renderer.$gutter;
        gutter.removeEventListener("mousemove", this.onDomMouseMove);
        gutter.removeEventListener("mouseout", this.onDomMouseOut);
        _super.prototype.removeFromEditor.call(this, editor);
    };
    GutterTooltip.prototype.destroy = function () {
        if (this.editor) {
            this.removeFromEditor(this.editor);
        }
        _super.prototype.destroy.call(this);
    };
    Object.defineProperty(GutterTooltip, "annotationLabels", {
        get: function () {
            return {
                error: {
                    singular: nls("gutter-tooltip.aria-label.error.singular", "error"),
                    plural: nls("gutter-tooltip.aria-label.error.plural", "errors")
                },
                security: {
                    singular: nls("gutter-tooltip.aria-label.security.singular", "security finding"),
                    plural: nls("gutter-tooltip.aria-label.security.plural", "security findings")
                },
                warning: {
                    singular: nls("gutter-tooltip.aria-label.warning.singular", "warning"),
                    plural: nls("gutter-tooltip.aria-label.warning.plural", "warnings")
                },
                info: {
                    singular: nls("gutter-tooltip.aria-label.info.singular", "information message"),
                    plural: nls("gutter-tooltip.aria-label.info.plural", "information messages")
                },
                hint: {
                    singular: nls("gutter-tooltip.aria-label.hint.singular", "suggestion"),
                    plural: nls("gutter-tooltip.aria-label.hint.plural", "suggestions")
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param {number} row
     */
    GutterTooltip.prototype.showTooltip = function (row) {
        var _a;
        var gutter = this.editor.renderer.$gutterLayer;
        var annotationsInRow = gutter.$annotations[row];
        var annotation;
        if (annotationsInRow)
            annotation = {
                displayText: Array.from(annotationsInRow.displayText),
                type: Array.from(annotationsInRow.type)
            };
        else
            annotation = { displayText: [], type: [] };
        // If the tooltip is for a row which has a closed fold, check whether there are
        // annotations in the folded lines. If so, add a summary to the list of annotations.
        var fold = gutter.session.getFoldLine(row);
        if (fold && gutter.$showFoldedAnnotations) {
            var annotationsInFold = { error: [], security: [], warning: [], info: [], hint: [] };
            var severityRank = { error: 1, security: 2, warning: 3, info: 4, hint: 5 };
            var mostSevereAnnotationTypeInFold;
            for (var i = row + 1; i <= fold.end.row; i++) {
                if (!gutter.$annotations[i])
                    continue;
                for (var j = 0; j < gutter.$annotations[i].text.length; j++) {
                    var annotationType = gutter.$annotations[i].type[j];
                    annotationsInFold[annotationType].push(gutter.$annotations[i].text[j]);
                    if (!mostSevereAnnotationTypeInFold ||
                        severityRank[annotationType] < severityRank[mostSevereAnnotationTypeInFold]) {
                        mostSevereAnnotationTypeInFold = annotationType;
                    }
                }
            }
            if (["error", "security", "warning"].includes(mostSevereAnnotationTypeInFold)) {
                var summaryFoldedAnnotations = "".concat(GutterTooltip.annotationsToSummaryString(annotationsInFold), " in folded code.");
                annotation.displayText.push(summaryFoldedAnnotations);
                annotation.type.push(mostSevereAnnotationTypeInFold + "_fold");
            }
        }
        if (annotation.displayText.length === 0)
            return this.hide();
        var annotationMessages = { error: [], security: [], warning: [], info: [], hint: [] };
        var iconClassName = gutter.$useSvgGutterIcons ? "ace_icon_svg" : "ace_icon";
        // Construct the contents of the tooltip.
        for (var i = 0; i < annotation.displayText.length; i++) {
            var lineElement = dom.createElement("span");
            var iconElement = dom.createElement("span");
            (_a = iconElement.classList).add.apply(_a, ["ace_".concat(annotation.type[i]), iconClassName]);
            iconElement.setAttribute("aria-label", "".concat(GutterTooltip.annotationLabels[annotation.type[i].replace("_fold", "")].singular));
            iconElement.setAttribute("role", "img");
            // Set empty content to the img span to get it to show up
            iconElement.appendChild(dom.createTextNode(" "));
            lineElement.appendChild(iconElement);
            lineElement.appendChild(dom.createTextNode(annotation.displayText[i]));
            lineElement.appendChild(dom.createElement("br"));
            annotationMessages[annotation.type[i].replace("_fold", "")].push(lineElement);
        }
        var tooltipElement = dom.createElement("span");
        // Update the tooltip content
        annotationMessages.error.forEach(function (el) { return tooltipElement.appendChild(el); });
        annotationMessages.security.forEach(function (el) { return tooltipElement.appendChild(el); });
        annotationMessages.warning.forEach(function (el) { return tooltipElement.appendChild(el); });
        annotationMessages.info.forEach(function (el) { return tooltipElement.appendChild(el); });
        annotationMessages.hint.forEach(function (el) { return tooltipElement.appendChild(el); });
        tooltipElement.setAttribute("aria-live", "polite");
        var annotationNode = this.$findLinkedAnnotationNode(row);
        if (annotationNode) {
            annotationNode.setAttribute("aria-describedby", this.id);
        }
        var range = Range.fromPoints({ row: row, column: 0 }, { row: row, column: 0 });
        this.showForRange(this.editor, range, tooltipElement);
        this.visibleTooltipRow = row;
        this.editor._signal("showGutterTooltip", this);
    };
    GutterTooltip.prototype.$setPosition = function (editor, _ignoredPosition, _withMarker, range) {
        var gutterCell = this.$findCellByRow(range.start.row);
        if (!gutterCell)
            return;
        var el = gutterCell && gutterCell.element;
        var anchorEl = el && (el.querySelector(".ace_gutter_annotation"));
        if (!anchorEl)
            return;
        var r = anchorEl.getBoundingClientRect();
        if (!r)
            return;
        var position = {
            pageX: r.right,
            pageY: r.top
        };
        //we don't need marker for gutter
        return _super.prototype.$setPosition.call(this, editor, position, false, range);
    };
    GutterTooltip.prototype.$shouldPlaceAbove = function (labelHeight, anchorTop, spaceBelow) {
        return spaceBelow < labelHeight;
    };
    GutterTooltip.prototype.$findLinkedAnnotationNode = function (row) {
        var cell = this.$findCellByRow(row);
        if (cell) {
            var element = cell.element;
            if (element.childNodes.length > 2) {
                return element.childNodes[2];
            }
        }
    };
    GutterTooltip.prototype.$findCellByRow = function (row) {
        return this.editor.renderer.$gutterLayer.$lines.cells.find(function (el) { return el.row === row; });
    };
    GutterTooltip.prototype.hide = function (e) {
        if (!this.isOpen) {
            return;
        }
        this.$element.removeAttribute("aria-live");
        if (this.visibleTooltipRow != undefined) {
            var annotationNode = this.$findLinkedAnnotationNode(this.visibleTooltipRow);
            if (annotationNode) {
                annotationNode.removeAttribute("aria-describedby");
            }
        }
        this.visibleTooltipRow = undefined;
        this.editor._signal("hideGutterTooltip", this);
        _super.prototype.hide.call(this, e);
    };
    GutterTooltip.annotationsToSummaryString = function (annotations) {
        var e_1, _a;
        var summary = [];
        var annotationTypes = ["error", "security", "warning", "info", "hint"];
        try {
            for (var annotationTypes_1 = __values(annotationTypes), annotationTypes_1_1 = annotationTypes_1.next(); !annotationTypes_1_1.done; annotationTypes_1_1 = annotationTypes_1.next()) {
                var annotationType = annotationTypes_1_1.value;
                if (!annotations[annotationType].length)
                    continue;
                var label = annotations[annotationType].length === 1 ? GutterTooltip.annotationLabels[annotationType].singular : GutterTooltip.annotationLabels[annotationType].plural;
                summary.push("".concat(annotations[annotationType].length, " ").concat(label));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (annotationTypes_1_1 && !annotationTypes_1_1.done && (_a = annotationTypes_1.return)) _a.call(annotationTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return summary.join(", ");
    };
    /**
     * Check if cursor is outside gutter
     * @param e
     * @return {boolean}
     */
    GutterTooltip.prototype.isOutsideOfText = function (e) {
        var editor = e.editor;
        var rect = editor.renderer.$gutter.getBoundingClientRect();
        return !(e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom);
    };
    return GutterTooltip;
}(HoverTooltip));
GutterTooltip.$uid = 0;
exports.GutterTooltip = GutterTooltip;

});