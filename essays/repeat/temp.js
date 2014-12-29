"use strict";

var Demo = require("./demo.html");
var Slot = require("../../slot");
var Scope = require("../../scope");

var slot = Slot.fromElement(document.body);
var demo = new Demo(slot, new Scope());
slot.insert(demo.body);

setInterval(function () {
    demo.greetings.values.push(1);
}, 1000);

