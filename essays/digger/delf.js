'use strict';

var enterColorPickerMode = require('./color-picker-mode');

DelfView.prototype.directionKeys = {
    h: 'left',
    j: 'down',
    k: 'up',
    l: 'right'
};

module.exports = DelfView;
function DelfView(slot, scope) {
    this.isFileMenuMode = false;
    this.animator = scope.animator.add(this);
    this.fillValue = 1;
    this.pal = {};
}

DelfView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(component, scope);
    }
};

DelfView.prototype.focus = function focus() {
    this.viewport.focus();
};

DelfView.prototype.blur = function blur() {
    this.viewport.blur();
};

DelfView.prototype.hookupThis = function hookupThis(component, scope) {
    var components = scope.components;
    this.viewport = components.viewport;
    this.viewport.bottomCurb = 48;

    this.cursorMode = components.cursorMode;
    this.knobMode = components.knobMode;
    this.goMode = scope.components.goMode;
    this.colorMode = scope.components.colorMode;

    this.colorPicker = components.colorPicker;
    this.colorLine = components.colorLine;
    this.styleSheet = components.styleSheet.sheet;
    this.modeLine = components.modeLine;

    this.palette = components.palette;
    this.palette.delegate = this;
    this.palette.colorPicker = this.colorPicker;
    this.palette.styleSheet = this.styleSheet;
    this.palette.modeLine = this.modeLine;

    this.inventory = components.inventory;
    this.inventory.delegate = this;

    this.colorLine.style.visibility = 'hidden';

};

Object.defineProperty(DelfView.prototype, 'isCursorMode', {
    get: function () {
        return this.viewport.isCursorMode;
    },
    set: function (value) {
        this.viewport.isCursorMode = value;
    }
});

Object.defineProperty(DelfView.prototype, 'isKnobMode', {
    get: function () {
        return this.viewport.isKnobMode;
    },
    set: function (value) {
        this.viewport.isKnobMode = value;
    }
});

DelfView.prototype.handleColorChange = function handleColorChange(color) {
    // TODO: inventory based color selection, editing the palette
    this.palette.handleColorChange(color);
};

DelfView.prototype.handleActiveItemChange = function handleActiveItemChange(value) {
    this.fillValue = value;
};

DelfView.prototype.handleResize = function handleResize() {
    this.viewport.handleResize();
};

DelfView.prototype.draw = function draw() {

    this.viewport.draw();
};

DelfView.prototype.enterColorPickerMode = function enterDelfColorPickerMode(exit) {
    var delf = this;

    function exitColorPickerMode() {
        delf.focus();
        delf.colorLine.style.visibility = 'hidden';
        delf.modeLine.hide(delf.colorMode);
        return exit();
    }

    delf.blur();
    delf.colorLine.style.visibility = 'visible';
    delf.modeLine.show(delf.colorMode);
    return enterColorPickerMode(delf.colorPicker, exitColorPickerMode);
};
