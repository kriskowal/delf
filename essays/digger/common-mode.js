"use strict";

var colorKeys = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 0
};

var setColorKeys = {
    "!": 1,
    "@": 2,
    "#": 3,
    "$": 4,
    "%": 5,
    "^": 6,
    "&": 7,
    "*": 8,
    "(": 9,
    ")": 0
};

module.exports = enterCursorOrKnobMode;
function enterCursorOrKnobMode(delf, viewport) {

    function cursorOrKnobMode(event, key, keyCode, mode) {
        if (event.type === "keypress") {
            if (key === "d") {
                viewport.dig();
            } else if (key === "f") {
                viewport.fill(delf.fillValue);
            } else if (key === "y") {
                viewport.copy();
            } else if (key === "x") {
                viewport.cut();
                delf.draw();
            } else if (key === "p") {
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
            } else if (key === "c") {
                delf.colorPicker.delegate = delf; // Inventory-based color selection
                return delf.enterColorPickerMode(function exitColorPicker() {
                    return mode;
                });
            } else if (typeof colorKeys[key] === 'number') {
                var index = colorKeys[key];
                delf.inventory.setActiveItem(index);
                delf.fillValue = index;
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
            // TODO
            // "D" set dig value (transparent background)
            // "F" set fill value (foreground value for current number)
            // "e" open inventory
            // "E" edit inventory?
            // ? color
            // "G" mark location
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

        return mode;
    }

    return cursorOrKnobMode;
}
