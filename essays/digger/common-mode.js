"use strict";

var enterColorPickerMode = require('./color-picker-mode');

module.exports = enterCursorOrKnobMode;
function enterCursorOrKnobMode(delf, viewport) {

    function cursorOrKnobMode(event, key, keyCode, mode) {
        if (event.type === "keypress") {
            if (key === "d") {
                viewport.dig();
            } else if (key === "f") {
                viewport.fill();
            } else if (key === "c" || key === "y") {
                viewport.copy();
            } else if (key === "x") {
                viewport.cut();
                delf.draw();
            } else if (key === "v" || key === "p") {
                viewport.paste();
                delf.draw();
            } else if (key == "~") {
                viewport.flip();
                delf.draw();
            } else if (key === "-") {
                viewport.sub();
                delf.draw();
            } else if (key === "+") {
                viewport.add();
                delf.draw();
            } else if (key === "1") {
                delf.blur();
                delf.colorLine.style.visibility = 'visible';
                return enterColorPickerMode(delf.colorPicker, exitColorPickerMode);
            // TODO "G" mark a location
            }
            // enter - open inspector for commands to perform on the selected region
            // including the creation of a named region with triggers
            // set the cursor position to the origin
            // "(" begin macro end macro ")"
            // "." replay last command
            // "/" chat
            // "?" toggle help
            // number
            // save context (cursor etc)
            // restore context (cursor etc)
        }

        function exitColorPickerMode() {
            delf.focus();
            delf.colorLine.style.visibility = 'hidden';
            return mode;
        }

        return mode;
    }

    return cursorOrKnobMode;
}

