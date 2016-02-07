'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var View = require('./delf.html');
var enterCursorMode = require('./cursor-mode');
var Fusion = window.require('Fusion');

function main() {
    var scope = new Scope();
    var document = new Document(window.document.body);
    scope.animator = new Animator();
    var view = new View(document.documentElement, scope);
    var mode = enterCursorMode(view, view.viewport);

    // var storage = new Storage('gol01.aelf.land:8181', {secure: false});

    // Event listeners
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', keyChange);
    window.addEventListener('keyup', keyChange);
    window.addEventListener('keypress', keyChange);
    window.addEventListener('mousedown', keyChange);
    window.addEventListener('mouseup', keyChange);
    window.addEventListener('mousemove', keyChange);

    resize();
    view.focus();
    view.draw();

    function resize() {
        view.handleResize();
    }

    function keyChange(event) {
        var key = event.key || String.fromCharCode(event.charCode);
        var keyCode = event.keyCode || event.charCode;
        mode = mode(event, key, keyCode);
    }
}

main();
