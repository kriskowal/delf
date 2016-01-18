'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var View = require('./delf.html');
var enterCursorMode = require("./cursor-mode");
var Fusion = window.require('Fusion');

var Point2 = require('ndim/point2');
var temp = new Point2();

function main() {
    var scope = new Scope();
    var document = new Document(window.document.body);
    scope.animator = new Animator();
    var view = new View(document.documentElement, scope);
    var mode = enterCursorMode(view, view.viewport);

    var fusion = new Fusion("localhost:8181", {secure: false});
    var model = fusion("delf_worlds");

    model.subscribe({
        onAdded: function onAdded(record) {
            temp.x = record.x;
            temp.y = record.y;
            var tile = view.viewport.tiles.get(temp);
            if (record.value !== tile.value) {
                tile.value = record.value;
                view.viewport.animator.requestDraw();
            }
        },
        onRemoved: function onRemoved(record) {
            temp.x = record.x;
            temp.y = record.y;
            var tile = view.viewport.tiles.get(temp);
            tile.value = 0;
            view.viewport.animator.requestDraw();
        },
        onChanged: function onChanged(delta) {
            temp.x = delta.new_val.x;
            temp.y = delta.new_val.y;
            var tile = view.viewport.tiles.get(temp);
            tile.value = delta.new_val.value;
            view.viewport.animator.requestDraw();
        },
        onConnected: function (e) {
            console.log('connected');
        },
        onDisconnected: function (e) {
            console.log('disconnected');
        },
        onError: function (err) {
            console.log('error', err);
        }
    });

    view.viewport.storage = {
        update: function update(point, value) {
            if (value) {
                model.upsert({
                    id: point.x + ',' + point.y,
                    x: point.x,
                    y: point.y,
                    value: value
                });
            } else {
                model.remove({
                    id: point.x + ',' + point.y
                });
            }
            view.viewport.animator.requestDraw();
        }
    };

    // Event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyChange);
    window.addEventListener("keyup", keyChange);
    window.addEventListener("keypress", keyChange);
    window.addEventListener("mousedown", keyChange);
    window.addEventListener("mouseup", keyChange);
    window.addEventListener("mousemove", keyChange);

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
