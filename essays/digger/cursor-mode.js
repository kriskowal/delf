"use strict";

var enterKnobMode = require("./knob-mode");
var enterCursorOrKnobMode = require("./common-mode");
var enterInspectorMode = require("./inspector-mode");
//var enterFileMode = require("./file-mode");

module.exports = enterCursorMode;
function enterCursorMode(delf, viewport) {
    var cursorOrKnobMode = enterCursorOrKnobMode(delf, viewport);

    function cursorMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 13) {
                viewport.bottomCurb = 0;
                delf.blur();
                delf.draw();
                return enterInspectorMode(delf, function () {
                    viewport.bottomCurb = 40;
                    delf.focus();
                    delf.draw();
                    return cursorMode;
                });
            }
        } else if (event.type === "keypress") {
            if (delf.directionKeys[key]) {
                // move by stride
                delf.viewport.moveCursor(delf.directionKeys[key]);
                delf.draw();
            } else if (delf.directionKeys[key.toLowerCase()]) {
                // move by one
                delf.viewport.creepCursor(delf.directionKeys[key.toLowerCase()]);
                delf.draw();
            // } else if (/[1-9]/.test(key)) {
            //     return makeIntegerMode(key, function (number) {
            //         if (number) {
            //             return makeRepeatMode(number, function () {
            //                 return cursorMode;
            //             });
            //         } else {
            //             return cursorMode;
            //         }
            //     });
            } else if (key === "s") {
                return enterKnobMode(delf, viewport, function () {
                    return cursorMode;
                });
            } else if (key === "0") {
                delf.viewport.collapseCursor();
                delf.draw();
            } else if (key === "I") {
                delf.viewport.growCursor();
                delf.draw();
            } else if (key === "i") {
                delf.viewport.shrinkCursor();
                delf.draw();
            //} else if (key === ":") {
            //    return enterFileMode(function () {
            //        return cursorMode;
            //    });
            } else if (key === "g") { // go
                delf.viewport.moveCursorToOrigin();
                delf.draw();
            }
            // TODO "gg" for origin, "gX" for other marked locations
            // TODO "G" mark a location
            // TODO "GG" move origin
        }
        return cursorOrKnobMode(event, key, keyCode, cursorMode);
    }

    return cursorMode;
}

