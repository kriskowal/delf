'use strict';

var enterColorPickerMode = require('./color-picker-mode');

module.exports = Palette;

function Palette(body, scope) {
    this.active = null;
    this.list = null;
    this.activeIndex = null;
    this.mode = null;
    // To be bound by creator:
    this.delegate = null;
    this.colorPicker = null;
    this.styleSheet = null;
    this.modeLine = null;
}

Palette.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(component, scope);
    } else if (id === 'list:entry') {
        this.hookupEntry(component, scope);
    }
};

Palette.prototype.hookupThis = function hookupThis(component, scope) {
    this.list = scope.components.list;
    this.list.entries = [
        new Entry({
            value: 0,
            name: 'background'
        })
    ];
    this.list.navigator = this;
    this.mode = scope.components.mode;
};

Palette.prototype.hookupEntry = function hookupEntry(entry, scope) {
    scope.components.label.value = entry.value.value;
    scope.components.swatch.classList.add("pal" + entry.value.value);
};

Palette.prototype.activate = function activate(entry) {
    this.activeIndex = entry.value;
};

Palette.prototype.deactivate = function deactivate(entry) {
    this.activeIndex = null;
};

Palette.prototype.navigate = function navigate(entry) {
};

Palette.prototype.add = function add() {
    var index = this.list.entriesComponent.iterations.length;
    this.list.entries.push(new Entry({
        value: index,
        name: ''
    }));
    var iteration = this.list.entriesComponent.iterations[index];
    this.list.activateIteration(iteration);
};

Palette.prototype.handleColorChange = function handleColorChange(color) {
    if (this.activeIndex == null) {
        // TODO warning: no active index, maybe create an entry for it
        return;
    }
    // TODO: inventory based color selection, editing the palette
    this.styleSheet.deleteRule(this.activeIndex);
    var className;
    if (this.activeIndex === 0) {
        className = 'body, .pal0';
    } else {
        className = '.pal' + this.activeIndex;
    }
    this.styleSheet.insertRule(className + " { background-color: " + color.toStyle() + " }", this.activeIndex);
};

Palette.prototype.focus = function focus() {
    this.list.focus();
    this.modeLine.show(this.mode);
};

Palette.prototype.blur = function blur() {
    this.list.blur();
    this.modeLine.hide(this.mode);
};

Palette.prototype.enterMode = function enterMode(exit) {
    return enterPaletteMode(this, exit);
};

function Entry(args) {
    this.value = args.value;
    this.name = args.name;
    this.color = args.color;
    this.image = args.image;
    this.procs = {};
    // TODO event hooks for the pathing layer
}

function enterPaletteMode(palette, exit) {

    function paletteMode(event, key, keyCode) {
        if (event.type === 'keyup') {
            if (keyCode === 27) { // escape
                return _exit();
            }
        } else if (event.type === 'keypress') {
            if (key === 'c') { // color picker
                palette.colorPicker.delegate = palette;
                palette.blur();
                return palette.delegate.enterColorPickerMode(function exitColorMode() {
                    palette.focus();
                    return _exit();
                });
            } else if (key === 'g') {
                // Replay go commands on parent since it is responsible for routing.
                return _exit()(event, key, keyCode);
            } else if (key === 'a') {
                palette.add();
            }
        }

        palette.list.directionEventTranslator.handleEvent(event);
        return paletteMode;
    }

    function _exit() {
        palette.blur();
        return exit();
    }

    palette.focus();
    return paletteMode;
}
