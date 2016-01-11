'use strict';

module.exports = enterColorPickerMode;

function enterColorPickerMode(colorPicker, exit) {

    function colorPickerMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27 || keyCode === 13) { // escape
                return exitColorPickerMode();
            }
        }
        colorPicker.handleEvent(event);
        return colorPickerMode;
    }

    function exitColorPickerMode() {
        colorPicker.blur();
        return exit();
    }

    colorPicker.focus();
    return colorPickerMode;
}
