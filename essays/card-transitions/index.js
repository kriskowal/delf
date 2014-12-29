"use strict";

var Q = require("q");

var Slot = require("../../gutentag/slot");
var Scope = require("../../gutentag/scope");

var Repeat = require(".../../gutentag/repeat");
var WindowRegion = require("../../gutentag/window-region");

var Direction2 = require('../../direction2');

var Card = require('./card');

var slot = Slot.fromElement(document.body);
var scope = new Scope();

var root = new Repeat(slot, scope, Card);
root.values = ["Hello, World!", "Goodbye."];

var windowRegion = new WindowRegion(root, window);
windowRegion.redraw();

var hello = root.iterations[0];
var goodbye = root.iterations[1];
Q.try(function () {
    goodbye.hide();
    return hello.enter(Direction2.north.fromVector);
}).then(function () {
    goodbye.show();
    return Q.all([
        hello.exit(Direction2.north.toVector),
        goodbye.enter(Direction2.west.fromVector)
    ]);
}).then(function () {
    return Q.all([
        hello.enter(Direction2.west.fromVector),
        goodbye.exit(Direction2.east.toVector)
    ]);
}).then(function () {
    root.values.clear();
})
.done();

