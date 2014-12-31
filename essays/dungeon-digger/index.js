"use strict";

var Slot = require("../../gutentag/slot");
var Scope = require("../../gutentag/scope");
var DelfView = require("./delf.html");
var enterCursorMode = require("./cursor-mode");
var delf;
var mode;

function main() {

    var slot = Slot.fromElement(document.body)

    var scope = new Scope();
    delf = new DelfView(slot, scope);
    slot.insert(delf.body);

    // Event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyChange);
    window.addEventListener("keyup", keyChange);
    window.addEventListener("keypress", keyChange);
    window.addEventListener("mousedown", keyChange);
    window.addEventListener("mouseup", keyChange);
    window.addEventListener("mousemove", keyChange);

    mode = enterCursorMode(delf, delf.viewport);

    resize();
    delf.draw();
}

function resize() {
    delf.handleResize();
}

function keyChange(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    mode = mode(event, key, keyCode);
}

main();
