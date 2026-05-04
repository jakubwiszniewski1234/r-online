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
var assert = require("./test/assertions");
var sendKey = require("./test/user").type;
var ace = require("./ace");
var lang = require("./lib/lang");
var editor;
function mouse(type, pos, properties) {
    var target = editor.renderer.getMouseEventTarget();
    var event = new CustomEvent("mouse" + type, { bubbles: true });
    if ("row" in pos) {
        var pagePos = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
        event.clientX = pagePos.pageX;
        event.clientY = pagePos.pageY;
    }
    else {
        target = pos;
        var rect = target.getBoundingClientRect();
        event.clientX = rect.left + rect.width / 2;
        event.clientY = rect.top + rect.height / 2;
    }
    Object.assign(event, properties);
    target.dispatchEvent(event);
}
module.exports = {
    setUp: function () {
        editor = ace.edit(null, {
            value: "999"
        });
        document.body.appendChild(editor.container);
        editor.container.style.height = "200px";
        editor.container.style.width = "300px";
        editor.focus();
    },
    tearDown: function () {
        editor.destroy();
        editor = null;
    },
    "test readOnly Option": function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, readOnly, nodes, nodes, nodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Array.from(document.querySelectorAll(".ace_editor")).forEach(function (el) {
                            if (el != editor.container)
                                el.remove();
                        });
                        nodes = document.querySelectorAll(".ace_tooltip");
                        assert.equal(nodes.length, 1);
                        readOnly = editor.getOption("readOnly");
                        assert.equal(editor.$hoverTooltip, null);
                        assert.equal(readOnly, false);
                        editor.setOption("readOnly", true);
                        readOnly = editor.getOption("readOnly");
                        assert.equal(readOnly, true);
                        sendKey("a");
                        return [4 /*yield*/, lang.sleep(6)];
                    case 1:
                        _a.sent();
                        assert.equal(editor.getValue(), "999");
                        assert.ok(editor.hoverTooltip != null);
                        nodes = document.querySelectorAll(".ace_tooltip");
                        assert.equal(nodes.length, 2);
                        assert.equal(editor.hoverTooltip.isOpen, true);
                        mouse("down", editor.container, { button: 0 });
                        return [4 /*yield*/, lang.sleep(6)];
                    case 2:
                        _a.sent();
                        assert.equal(editor.hoverTooltip.isOpen, false);
                        editor.setOption("readOnly", false);
                        sendKey("a");
                        return [4 /*yield*/, lang.sleep(6)];
                    case 3:
                        _a.sent();
                        assert.equal(editor.getValue(), "a999");
                        nodes = document.querySelectorAll(".ace_tooltip");
                        assert.equal(nodes.length, 2);
                        editor.destroy();
                        editor.container.remove();
                        nodes = document.querySelectorAll(".ace_tooltip");
                        assert.equal(nodes.length, 0);
                        done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
require("./test/run")(module);

});