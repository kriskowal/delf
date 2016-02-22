"use strict";

var enterKnobMode = require("./knob-mode");
var enterCursorOrKnobMode = require("./common-mode");
//var enterFileMode = require("./file-mode");

module.exports = enterCursorMode;
function enterCursorMode(delf, viewport) {
    var cursorOrKnobMode = enterCursorOrKnobMode(delf, viewport);

    function cursorMode(event, key, keyCode) {
        if (event.type === "keyup") {
        } else if (event.type === "keypress") {
            if (delf.directionKeys[key]) {
                // move by stride
                delf.viewport.moveCursor(delf.directionKeys[key]);
                delf.draw();
            } else if (delf.directionKeys[key.toLowerCase()]) {
                // move by one
                delf.viewport.creepCursor(delf.directionKeys[key.toLowerCase()]);
                delf.draw();
            } else if (key === "s") {
                return enterKnobMode(delf, viewport, function () {
                    return cursorMode;
                });
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
                return enterGoMode(delf, function exitGoMode() {
                    return cursorMode;
                });
            }
        }
        return cursorOrKnobMode(event, key, keyCode, cursorMode);
    }

    delf.modeLine.show(delf.cursorMode);
    return cursorMode;
}

function enterGoMode(delf, exit) {
    // TODO "gg" for origin, "gX" for other marked locations
    // TODO "G" mark a location
    // TODO "GG" move origin

    // TODO p: palette
    // TODO u: command log
    // TODO i: inventory (expanded, includes numbered, lettered, and named items)
    // TODO c: color picker
    // TODO l: layers
    // TODO L: levels
    // TODO w: worlds

    function goMode(event, key, keyCode) {
        if (event.type === "keypress") {
            if (key === "g") {
                delf.viewport.moveCursorToOrigin();
                delf.draw();
                return _exit();
            } else if (key === "0") {
                delf.viewport.collapseCursor();
                delf.draw();
                return _exit();
            } else if (key === "p") {
                delf.blur();
                return delf.palette.enterMode(function exitPaletteMode() {
                    delf.focus();
                    return _exit();
                });
            }
            return _exit()(event, key, keyCode);
        }
        return goMode;
    }

    function _exit() {
        delf.modeLine.hide(delf.goMode);
        return exit();
    }

    delf.modeLine.show(delf.goMode);
    return goMode;
}
