"use strict";

var Slot = require("../../gutentag/slot");
var Scope = require("../../gutentag/scope");

var Repeat = require(".../../gutentag/repeat");
var WindowRegion = require("../../gutentag/window-region");
var Menu = require("./menu");

var slot = Slot.fromElement(document.body);
var scope = new Scope();
scope.document = document;

scope.redraw = function () {
    windowRegion.redraw();
};

scope.submit = function () {
    console.log(root.selection);
};

var root = new Menu(slot, scope, null, {
    size: 100,
    options: [
        'Fight',
        'Flee'
    ]
});

var windowRegion = new WindowRegion(root, window);
slot.insert(root.body);
windowRegion.redraw();
root.focus();

