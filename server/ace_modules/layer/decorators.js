define(function(require, exports, module){"use strict";
var dom = require("../lib/dom");
var oop = require("../lib/oop");
var EventEmitter = require("../lib/event_emitter").EventEmitter;
var Decorator = /** @class */ (function () {
    /**
     * @param {import("../../ace-internal").Ace.VScrollbar} scrollbarV
     * @param {import("../virtual_renderer").VirtualRenderer} renderer
     */
    function Decorator(scrollbarV, renderer) {
        this.renderer = renderer;
        this.pixelRatio = 1;
        this.maxHeight = renderer.layerConfig.maxHeight;
        this.lineHeight = renderer.layerConfig.lineHeight;
        this.minDecorationHeight = (2 * this.pixelRatio) | 0;
        this.halfMinDecorationHeight = (this.minDecorationHeight / 2) | 0;
        this.colors = {};
        this.colors.dark = {
            "error": "rgba(255, 18, 18, 1)",
            "warning": "rgba(18, 136, 18, 1)",
            "info": "rgba(18, 18, 136, 1)",
        };
        this.colors.light = {
            "error": "rgb(255,51,51)",
            "warning": "rgb(32,133,72)",
            "info": "rgb(35,68,138)",
        };
        this.setScrollBarV(scrollbarV);
    }
    Decorator.prototype.$createCanvas = function () {
        this.canvas = dom.createElement("canvas");
        this.canvas.style.top = 0 + "px";
        this.canvas.style.right = 0 + "px";
        this.canvas.style.zIndex = "7";
        this.canvas.style.position = "absolute";
    };
    Decorator.prototype.setScrollBarV = function (scrollbarV) {
        this.$createCanvas();
        this.scrollbarV = scrollbarV;
        scrollbarV.element.appendChild(this.canvas);
        this.setDimensions();
    };
    Decorator.prototype.$updateDecorators = function (config) {
        if (typeof this.canvas.getContext !== "function") {
            return;
        }
        var colors = (this.renderer.theme.isDark === true) ? this.colors.dark : this.colors.light;
        this.setDimensions(config);
        var ctx = this.canvas.getContext("2d");
        function compare(a, b) {
            if (a.priority < b.priority)
                return -1;
            if (a.priority > b.priority)
                return 1;
            return 0;
        }
        var annotations = this.renderer.session.$annotations;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (annotations) {
            var priorities = {
                "info": 1,
                "warning": 2,
                "error": 3
            };
            annotations.forEach(function (item) {
                item["priority"] = priorities[item.type] || null;
            });
            annotations = annotations.sort(compare);
            for (var i = 0; i < annotations.length; i++) {
                var row = annotations[i].row;
                var offset1 = this.getVerticalOffsetForRow(row);
                var offset2 = offset1 + this.lineHeight;
                var y1 = Math.round(this.heightRatio * offset1);
                var y2 = Math.round(this.heightRatio * offset2);
                var ycenter = Math.round((y1 + y2) / 2);
                var halfHeight = (y2 - ycenter);
                if (halfHeight < this.halfMinDecorationHeight) {
                    halfHeight = this.halfMinDecorationHeight;
                }
                if (ycenter - halfHeight < 0) {
                    ycenter = halfHeight;
                }
                if (ycenter + halfHeight > this.canvasHeight) {
                    ycenter = this.canvasHeight - halfHeight;
                }
                var from = ycenter - halfHeight;
                var to = ycenter + halfHeight;
                var zoneHeight = to - from;
                ctx.fillStyle = colors[annotations[i].type] || null;
                ctx.fillRect(0, from, Math.round(this.oneZoneWidth - 1), zoneHeight);
            }
        }
        var cursor = this.renderer.session.selection.getCursor();
        if (cursor) {
            var currentY = Math.round(this.getVerticalOffsetForRow(cursor.row) * this.heightRatio);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, currentY, this.canvasWidth, 2);
        }
    };
    Decorator.prototype.getVerticalOffsetForRow = function (row) {
        row = row | 0;
        var offset = this.renderer.session.documentToScreenRow(row, 0) * this.lineHeight;
        return offset;
    };
    Decorator.prototype.setDimensions = function (config) {
        config = config || this.renderer.layerConfig;
        this.maxHeight = config.maxHeight;
        this.lineHeight = config.lineHeight;
        this.canvasHeight = config.height;
        this.canvasWidth = this.scrollbarV.width || this.canvasWidth;
        this.setZoneWidth();
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        if (this.maxHeight < this.canvasHeight) {
            this.heightRatio = 1;
        }
        else {
            this.heightRatio = this.canvasHeight / this.maxHeight;
        }
    };
    Decorator.prototype.setZoneWidth = function () {
        this.oneZoneWidth = this.canvasWidth;
    };
    Decorator.prototype.destroy = function () {
        this.canvas.parentNode.removeChild(this.canvas);
    };
    return Decorator;
}());
oop.implement(Decorator.prototype, EventEmitter);
exports.Decorator = Decorator;

});