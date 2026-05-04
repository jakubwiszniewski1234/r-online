define(function(require, exports, module){var dom = require("../../lib/dom");
var MinimalGutterDiffDecorator = /** @class */ (function () {
    /**
     * @param {import("../../editor").Editor} editor
     * @param {number} type
     */
    function MinimalGutterDiffDecorator(editor, type) {
        this.gutterClass = "ace_mini-diff_gutter-enabled";
        this.gutterCellsClasses = {
            add: "mini-diff-added",
            delete: "mini-diff-deleted",
        };
        this.editor = editor;
        this.type = type;
        this.chunks = [];
        this.attachToEditor();
    }
    MinimalGutterDiffDecorator.prototype.attachToEditor = function () {
        this.renderGutters = this.renderGutters.bind(this);
        dom.addCssClass(this.editor.renderer.$gutterLayer.element, this.gutterClass);
        this.editor.renderer.$gutterLayer.on("afterRender", this.renderGutters);
    };
    MinimalGutterDiffDecorator.prototype.renderGutters = function (e, gutterLayer) {
        var _this = this;
        var cells = this.editor.renderer.$gutterLayer.$lines.cells;
        cells.forEach(function (cell) {
            cell.element.classList.remove(Object.values(_this.gutterCellsClasses));
        });
        var dir = this.type === -1 ? "old" : "new";
        var diffClass = this.type === -1 ? this.gutterCellsClasses.delete : this.gutterCellsClasses.add;
        this.chunks.forEach(function (lineChange) {
            var startRow = lineChange[dir].start.row;
            var endRow = lineChange[dir].end.row - 1;
            cells.forEach(function (cell) {
                if (cell.row >= startRow && cell.row <= endRow) {
                    cell.element.classList.add(diffClass);
                }
            });
        });
    };
    MinimalGutterDiffDecorator.prototype.setDecorations = function (changes) {
        this.chunks = changes;
        this.renderGutters();
    };
    MinimalGutterDiffDecorator.prototype.dispose = function () {
        dom.removeCssClass(this.editor.renderer.$gutterLayer.element, this.gutterClass);
        this.editor.renderer.$gutterLayer.off("afterRender", this.renderGutters);
    };
    return MinimalGutterDiffDecorator;
}());
exports.MinimalGutterDiffDecorator = MinimalGutterDiffDecorator;

});