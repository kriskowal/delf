"use strict";

function getComponent(event) {
    var target = event.target;
    while (target) {
        if (target.component) {
            return target.component;
        }
        target = target.parentNode;
    }
}

function makeCountMode(mode, count) {
    return function (event, key, keyCode) {
        return mode(event, key, keyCode, count);
    };
}

function makeRepeatMode(number, callback) {
    function mode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return callback();
            }
        } else if (event.type === "keypress") {
            return callback();
        }
    }
    return mode;
}

function makeIntegerMode(number, callback) {
    function mode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) { // escape
                return callback();
            }
        } else if (event.type === "keypress") {
            if (/[0-9]/.test(key)) {
                number += key;
                return mode;
            } else {
                return callback(+number)(event, key, keyCode);
            }
        }
        return mode;
    }
    return mode;
}

function openFileMenu(callback) {
    delfView.isFileMenuMode = true;
    delfView.draw();
    function fileMenuMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return closeFileMenu();
            }
        } else if (event.type === "keypress") {
            if (key === "l") {
                loadFromLocalStorage();
                return closeFileMenu();
            } else if (key === "s") {
                saveToLocalStorage();
                return closeFileMenu();
            } else if (key === "1") {
                var generateDungeon = require("./generate-dungeon");
                generateDungeon(delfView.viewport.cursorArea);
                delfView.draw();
                return closeFileMenu();
            }
        }
        return fileMenuMode;
    }
    function closeFileMenu() {
        delfView.isFileMenuMode = false;
        delfView.draw();
        return callback();
    }
    return fileMenuMode;
}

function loadFromLocalStorage() {
    var delf = localStorage.getItem("delf");
    if (delf) {
        delfView.viewport.tiles.clear();
        delfView.viewport.tileViews.clear();
        JSON.parse(delf).tiles.forEach(function (tuple) {
            point.x = tuple[0];
            point.y = tuple[1];
            delfView.viewport.tiles.get(point).space = true;
        });
        delfView.draw();
    }
}

function saveToLocalStorage() {
    var x;
    localStorage.setItem("delf", x = JSON.stringify({
        tiles: delfView.viewport.tiles.filter(function (tile, point) {
            return tile.space;
        })
        .tiles(function (tile, point) {
            return [point.x, point.y];
        })
    }));
}

