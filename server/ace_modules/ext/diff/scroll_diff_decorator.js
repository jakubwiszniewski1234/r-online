define(function(require, exports, module){var __extends = (this && this.__extends) || (function () {
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
var Decorator = require("../../layer/decorators").Decorator;
var ScrollDiffDecorator = /** @class */ (function (_super) {
    __extends(ScrollDiffDecorator, _super);
    /**
     * @param {import("../../../ace-internal").Ace.VScrollbar} scrollbarV
     * @param {import("../../virtual_renderer").VirtualRenderer} renderer
     * @param {boolean} [forInlineDiff]
     */
    function ScrollDiffDecorator(scrollbarV, renderer, forInlineDiff) {
        var _this = _super.call(this, scrollbarV, renderer) || this;
        _this.colors.dark["delete"] = "rgba(255, 18, 18, 1)";
        _this.colors.dark["insert"] = "rgba(18, 136, 18, 1)";
        _this.colors.light["delete"] = "rgb(255,51,51)";
        _this.colors.light["insert"] = "rgb(32,133,72)";
        _this.$zones = [];
        _this.$forInlineDiff = forInlineDiff;
        return _this;
    }
    /**
     * @param {number} startRow
     * @param {number} endRow
     * @param {"delete"|"insert"} type
     */
    ScrollDiffDecorator.prototype.addZone = function (startRow, endRow, type) {
        this.$zones.push({
            startRow: startRow,
            endRow: endRow,
            type: type
        });
    };
    /**
     * @param {import("../../edit_session").EditSession} sessionA
     * @param {import("../../edit_session").EditSession} sessionB
     */
    ScrollDiffDecorator.prototype.setSessions = function (sessionA, sessionB) {
        this.sessionA = sessionA;
        this.sessionB = sessionB;
    };
    ScrollDiffDecorator.prototype.$updateDecorators = function (config) {
        if (typeof this.canvas.getContext !== "function") {
            return;
        }
        _super.prototype.$updateDecorators.call(this, config);
        if (this.$zones.length > 0) {
            var colors = (this.renderer.theme.isDark === true) ? this.colors.dark : this.colors.light;
            var ctx = this.canvas.getContext("2d");
            this.$setDiffDecorators(ctx, colors);
        }
    };
    /**
     * @param {number} row
     * @param {string} type
     */
    ScrollDiffDecorator.prototype.$transformPosition = function (row, type) {
        if (type == "delete") {
            return this.sessionA.documentToScreenRow(row, 0);
        }
        else {
            return this.sessionB.documentToScreenRow(row, 0);
        }
    };
    ScrollDiffDecorator.prototype.$setDiffDecorators = function (ctx, colors) {
        var e_1, _a;
        var _this = this;
        function compare(a, b) {
            if (a.from === b.from) {
                return a.to - b.to;
            }
            return a.from - b.from;
        }
        var zones = this.$zones;
        if (zones) {
            var resolvedZones = [];
            var deleteZones = zones.filter(function (z) { return z.type === "delete"; });
            var insertZones = zones.filter(function (z) { return z.type === "insert"; });
            [deleteZones, insertZones].forEach(function (typeZones) {
                typeZones.forEach(function (zone, i) {
                    var offset1 = _this.$transformPosition(zone.startRow, zone.type) * _this.lineHeight;
                    var offset2 = _this.$transformPosition(zone.endRow, zone.type) * _this.lineHeight + _this.lineHeight;
                    var y1 = Math.round(_this.heightRatio * offset1);
                    var y2 = Math.round(_this.heightRatio * offset2);
                    var padding = 1;
                    var ycenter = Math.round((y1 + y2) / 2);
                    var halfHeight = (y2 - ycenter);
                    if (halfHeight < _this.halfMinDecorationHeight) {
                        halfHeight = _this.halfMinDecorationHeight;
                    }
                    var previousZone = resolvedZones[resolvedZones.length - 1];
                    if (i > 0 && previousZone && previousZone.type === zone.type && ycenter - halfHeight < previousZone.to + padding) {
                        ycenter = resolvedZones[resolvedZones.length - 1].to + padding + halfHeight;
                    }
                    if (ycenter - halfHeight < 0) {
                        ycenter = halfHeight;
                    }
                    if (ycenter + halfHeight > _this.canvasHeight) {
                        ycenter = _this.canvasHeight - halfHeight;
                    }
                    resolvedZones.push({
                        type: zone.type,
                        from: ycenter - halfHeight,
                        to: ycenter + halfHeight,
                        color: colors[zone.type] || null
                    });
                });
            });
            resolvedZones = resolvedZones.sort(compare);
            try {
                for (var resolvedZones_1 = __values(resolvedZones), resolvedZones_1_1 = resolvedZones_1.next(); !resolvedZones_1_1.done; resolvedZones_1_1 = resolvedZones_1.next()) {
                    var zone = resolvedZones_1_1.value;
                    ctx.fillStyle = zone.color || null;
                    var zoneFrom = zone.from;
                    var zoneTo = zone.to;
                    var zoneHeight = zoneTo - zoneFrom;
                    if (this.$forInlineDiff) {
                        ctx.fillRect(this.oneZoneWidth, zoneFrom, 2 * this.oneZoneWidth, zoneHeight);
                    }
                    else {
                        if (zone.type == "delete") {
                            ctx.fillRect(this.oneZoneWidth, zoneFrom, this.oneZoneWidth, zoneHeight);
                        }
                        else {
                            ctx.fillRect(2 * this.oneZoneWidth, zoneFrom, this.oneZoneWidth, zoneHeight);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (resolvedZones_1_1 && !resolvedZones_1_1.done && (_a = resolvedZones_1.return)) _a.call(resolvedZones_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    ScrollDiffDecorator.prototype.setZoneWidth = function () {
        this.oneZoneWidth = Math.round(this.canvasWidth / 3);
    };
    return ScrollDiffDecorator;
}(Decorator));
exports.ScrollDiffDecorator = ScrollDiffDecorator;

});