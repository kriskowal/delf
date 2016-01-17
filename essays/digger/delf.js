'use strict';

module.exports = DelfView;
function DelfView(slot, scope) {
    this.isFileMenuMode = false;
    this.animator = scope.animator.add(this);
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
    this.viewport.bottomCurb = 40;

    this.cursorMode = components.cursorMode;
    this.knobMode = components.knobMode;
    this.fileMode = components.fileMode;
    this.colorPicker = components.colorPicker;
    this.colorLine = components.colorLine;
    this.styleSheet = components.styleSheet.sheet;
    this.inspector = components.inspector;

    this.colorLine.style.visibility = 'hidden';
    this.colorPicker.delegate = this;
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
    this.styleSheet.deleteRule(0);
    this.styleSheet.insertRule(".tile1 { background-color: " + color.toStyle() + " }", 0);
};

DelfView.prototype.handleResize = function handleResize() {
    this.viewport.handleResize();
};

DelfView.prototype.draw = function draw() {

    if (this.isCursorMode) {
        this.cursorMode.scope.components.element.classList.add('shown');
    } else {
        this.cursorMode.scope.components.element.classList.remove('shown');
    }
    if (this.isKnobMode) {
        this.knobMode.scope.components.element.classList.add('shown');
    } else {
        this.knobMode.scope.components.element.classList.remove('shown');
    }
    if (this.isFileMenuMode) {
        this.fileMode.scope.components.element.classList.add('shown');
    } else {
        this.fileMode.scope.components.element.classList.remove('shown');
    }

    this.viewport.draw();
};

DelfView.prototype.directionKeys = {
    h: 'left',
    j: 'down',
    k: 'up',
    l: 'right'
};

