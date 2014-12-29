"use strict";

module.exports = enterInspectorMode;
function enterInspectorMode(delf, exit) {

    delf.viewport.rightCurb = window.innerWidth / 3;
    delf.inspectorElement.style.visibility = "visible";
    delf.draw();

    function _exit() {
        delf.viewport.rightCurb = 0;
        delf.inspectorElement.style.visibility = "hidden";
        delf.draw();
        return exit();
    }

    function inspectorMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return _exit();
            }
        }
        return inspectorMode;
    }

    return inspectorMode;
}

