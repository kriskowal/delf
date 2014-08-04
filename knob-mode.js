"use strict";

var enterCursorOrKnobMode = require("./common-mode");

module.exports = enterKnobMode;
function enterKnobMode(delf, viewport, exit) {
    var cursorOrKnobMode = enterCursorOrKnobMode(delf, viewport);

    function knobMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return _exit();
            }
        } else if (event.type === "keypress") {
            if (delf.directionKeys[key]) {
                // move
                viewport.moveKnob(delf.directionKeys[key]);
                delf.draw();
            } else if (delf.directionKeys[key.toLowerCase()]) {
                // creep
                viewport.creepKnob(delf.directionKeys[key.toLowerCase()]);
                delf.draw();
            } else if (key === "o") {
                viewport.rotateKnobClockwise();
                delf.draw();
            } else if (key === "O") {
                viewport.rotateKnobCounterClockwise();
                delf.draw();
            } else if (key === "g") { // center the knob on the origin
                // TODO "gg" for origin, "g." for other marked locations
                viewport.moveKnobToOrigin();
                delf.draw();
                // TODO "G" mark center of knob as location
            } else if (key === "r") {
                viewport.rotateCursorClockwise();
                delf.draw();
            } else if (key === "R") {
                viewport.rotateCursorCounterClockwise();
                delf.draw();
            } else if (key === "t") { // transpose
                viewport.transposeCursorAboutKnob();
                delf.draw();
            } else if (key === "I") { // push cursor stack
                viewport.growKnob();
                delf.draw();
            } else if (key === "i") { // pop cursor stack
                viewport.shrinkKnob();
                delf.draw();
            } else if (key === "0") {
                viewport.collapseCursor();
                return _exit();
            } else if (key === "s") {
                return _exit();
            }
        }
        return cursorOrKnobMode(event, key, keyCode, knobMode);
    }

    function _exit() {
        delf.isKnobMode = false;
        delf.draw();
        return exit();
    }

    delf.isKnobMode = true;
    delf.draw();
    return knobMode;
}

