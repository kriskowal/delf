"use strict";

module.exports = DelfView;
function DelfView(slot, scope, argument, attributes) {
    this.isFileMenuMode = false;
    this.viewport.bottomCurb = 40;
}

Object.defineProperty(DelfView.prototype, "isCursorMode", {
    get: function () {
        return this.viewport.isCursorMode;
    },
    set: function (value) {
        this.viewport.isCursorMode = value;
    }
});

Object.defineProperty(DelfView.prototype, "isKnobMode", {
    get: function () {
        return this.viewport.isKnobMode;
    },
    set: function (value) {
        this.viewport.isKnobMode = value;
    }
});

DelfView.prototype.handleResize = function () {
    this.viewport.handleResize();
};

DelfView.prototype.draw = function () {

    if (this.isCursorMode) {
        this.cursorMode.element.classList.add("shown");
    } else {
        this.cursorMode.element.classList.remove("shown");
    }
    if (this.isKnobMode) {
        this.knobMode.element.classList.add("shown");
    } else {
        this.knobMode.element.classList.remove("shown");
    }
    if (this.isFileMenuMode) {
        this.fileMode.element.classList.add("shown");
    } else {
        this.fileMode.element.classList.remove("shown");
    }

    this.viewport.draw();
};

DelfView.prototype.directionKeys = {
    h: "left",
    j: "down",
    k: "up",
    l: "right"
};

