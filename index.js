"use strict";

var Slot = require("./slot");

require("collections/shim-array");
var FastMap = require("collections/fast-map");
var FastSet = require("collections/fast-set");
var Point2 = require("./point2");
var Region2 = require("./region2");
var TileView = require("./tile-view");
var Tile = require("./tile");
var Area = require("./area");

var tileViews = new FastMap(); // point to tile view
var freeTileViews = [];
var tiles = new FastMap(); // point to tile model
tiles.getDefault = function (point) {
    var tile = new Tile(point);
    this.set(point.clone(), tile);
    return tile;
};

var viewport = new Region2(new Point2(0, 0), new Point2());
var cursor = new Region2(new Point2(0, 0), new Point2(1, 1));
var knob = new Region2(new Point2(0, 0), new Point2(1, 1));
var cursorStack = [];
var cursorIndex = 0; // The position of the next available cursor slot to push
                     // One past the position of the next cursor to pop
var cursorArea = new Area(cursor.size, cursor.position, tiles, tileViews);

var isCursorMode = true;
var isKnobMode = false;
var isFileMenuMode = false;

var directions = {
    left: new Point2(-1, 0),
    right: new Point2(1, 0),
    up: new Point2(0, -1),
    down: new Point2(0, 1)
};

var directionKeys = {
    h: "left",
    j: "down",
    k: "up",
    l: "right"
};

var nextCursorQuadrant = {
    "cc": "cc",
    "cw": "ce",
    "ce": "cw",
    "nc": "sc",
    "sc": "nc",
    "nw": "ne",
    "ne": "se",
    "se": "sw",
    "sw": "nw"
};

var prevCursorQuadrant = {
    "cc": "cc",
    "cw": "ce",
    "ce": "cw",
    "nc": "sc",
    "wc": "nc",
    "nw": "sw",
    "ne": "nw",
    "se": "ne",
    "sw": "se"
};

var bottomCurb = 40;
var topCurb = 0;
var leftCurb = 0;
var rightCurb = 0;
// TODO convert this to a mode line
var helpShown = true;

var tileViewsToFree = [];

// temporary point used in many functions
var point = new Point2();

var mode = cursorMode;
var hold = false;

// TODO use a Bin abstraction that captures the data and dimensions and has the
// methods for transpose etc
var buffer = new FastMap();
var bufferSize = new Point2();
var bufferArea = new Area(bufferSize);
var tempBuffer = new FastMap();
var tempBufferSize = new Point2();

var knobElement;
var cursorElement;
var originElement;
var centerElement;
var inspectorElement;
var cursorModeElement;
var knobModeElement;
var fileMenuModeElement;

var DelfView = require("./delf.html");
var delfView;

function main() {

    delfView = new DelfView(Slot.fromElement(document.body));

    knobElement = delfView.viewport.knob;
    cursorElement = delfView.viewport.cursor;
    originElement = delfView.viewport.origin;
    centerElement = delfView.viewport.center;

    cursorModeElement = delfView.cursorMode.element;
    knobModeElement = delfView.knobMode.element;
    fileMenuModeElement = delfView.fileMode.element;
    inspectorElement = delfView.inspector;

    // Event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyChange);
    window.addEventListener("keyup", keyChange);
    window.addEventListener("keypress", keyChange);
    window.addEventListener("mousedown", keyChange);
    window.addEventListener("mouseup", keyChange);
    window.addEventListener("mousemove", keyChange);

    resize();
    draw();
}

var windowSize = new Point2();
var frustum = new Region2(new Point2(), new Point2());
var marginLength = 30;
var margin = new Point2(marginLength, marginLength);
var offset = new Point2();
offset.become(Point2.zero).subThis(margin).scaleThis(.5);
function drawFrustum() {
    windowSize.x = window.innerWidth;
    windowSize.y = window.innerHeight;
    frustum.size.become(windowSize)
        .scaleThis(1/TileView.size)
        .floorThis()
        .addThis(margin);
    frustum.position.become(Point2.zero)
        .subThis(frustum.size)
        .scaleThis(.5)
        .floorThis()
        .addThis(cursor.position);

    // Mark all visible tileViews as unused
    tileViews.forEach(function (tileView) {
        tileView.mark = false;
    });

    var created = 0;
    var recycled = 0;
    var reused = 0;

    var left = frustum.position.x;
    var top = frustum.position.y;
    var width = frustum.size.x;
    var height = frustum.size.y;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            point.x = left + x;
            point.y = top + y;
            var tileView = tileViews.get(point);
            if (!tileView) {
                if (freeTileViews.length) {
                    tileView = freeTileViews.pop();
                    recycled++;
                } else {
                    tileView = new TileView();
                    created++;
                }
                tileView.reset();
                tileView.mark = true;
                tileView.point.become(point);
                tileView.tile = tiles.get(tileView.point);
                tileView.draw();
                originElement.insertBefore(tileView.element, cursorElement);
                tileViews.set(tileView.point, tileView);
            } else {
                reused++;
            }
            // Mark the used tile to be retained
            tileView.mark = true;
        }
    }

    // Collect the garbage for recycling
    tileViewsToFree.length = 0;
    tileViews.forEach(function (tileView) {
        if (!tileView.mark) {
            tileViewsToFree.push(tileView);
        }
    });
    freeTileViews.swap(freeTileViews.length, 0, tileViewsToFree);
    tileViewsToFree.forEach(function (tileView) {
        tileViews.delete(tileView.point);
        originElement.removeChild(tileView.element);
    });

    //console.log("CREATED", created, "UNCHANGED", reused, "RECYCLED", recycled, "DISPOSED", tileViewsToFree.length, "USED", tileViews.length, "FREE", freeTileViews.length);
}

// TODO top down resize all views
var centerPx = new Point2();
function resize() {
    centerPx.x = window.innerWidth;
    centerPx.y = window.innerHeight;
    centerPx.scaleThis(.5);
    centerElement.style.top = centerPx.y + "px";
    centerElement.style.left = centerPx.x + "px";
    drawFrustum();
}

var cursorPx = new Region2(new Point2(), new Point2());
var halfCursorSizePx = new Point2();
var knobPx = new Region2(new Point2(), new Point2());
var originPx = new Point2();
function draw() {
    knobPx.become(knob).scaleThis(TileView.size);
    knobPx.size.x -= 12;
    knobPx.size.y -= 12;
    knobElement.style.opacity = isKnobMode ? 1 : 0;
    knobElement.style.left = knobPx.position.x + "px";
    knobElement.style.top = knobPx.position.y + "px";
    knobElement.style.width = knobPx.size.x + "px";
    knobElement.style.height = knobPx.size.y + "px";

    if (isCursorMode) {
        cursorModeElement.classList.add("shown");
    } else {
        cursorModeElement.classList.remove("shown");
    }
    if (isKnobMode) {
        knobModeElement.classList.add("shown");
    } else {
        knobModeElement.classList.remove("shown");
    }
    if (isFileMenuMode) {
        fileMenuModeElement.classList.add("shown");
    } else {
        fileMenuModeElement.classList.remove("shown");
    }

    cursorPx.become(cursor).scaleThis(TileView.size);
    cursorElement.style.left = cursorPx.position.x + "px";
    cursorElement.style.top = cursorPx.position.y + "px";
    cursorElement.style.width = cursorPx.size.x + "px";
    cursorElement.style.height = cursorPx.size.y + "px";

    halfCursorSizePx.become(cursor.size).scaleThis(TileView.size).scaleThis(.5);

    if (!hold) {
        originPx.x = (leftCurb - rightCurb) / 2;
        originPx.y = (topCurb - bottomCurb) / 2;
        originPx.subThis(cursorPx.position).subThis(halfCursorSizePx);
        originElement.style.left = originPx.x + "px";
        originElement.style.top = originPx.y + "px";
    }

    requestDrawFrustum();
}

function requestDrawFrustum() {
    if (drawFrustumHandle) {
        clearTimeout(drawFrustumHandle);
    }
    drawFrustumHandle = setTimeout(drawFrustumThunk, 1000);
}
function drawFrustumThunk() {
    drawFrustumHandle = null;
    drawFrustum();
}
var drawFrustumHandle = null;

var position = new Point2();
var newPosition = new Point2();
var change = new Point2();
function moveKnob(direction, size) {
    // directions: up, down, left, right
    // size: either 1x1 or knob size
    // absolute position of the knob
    change.become(directions[direction]).mulThis(size);
    position.become(cursor.position).addThis(knob.position);
    newPosition.become(position).addThis(change);
    var quadrant = getKnobQuadrant();
    // quadrant[0] === "n" or "c" means top adjacent
    // adjacent means that side must be pulled if moving away from it

    // push growing boundary
    cursor.size.x = Math.max(cursor.size.x, newPosition.x - cursor.position.x + knob.size.x);
    cursor.size.y = Math.max(cursor.size.y, newPosition.y - cursor.position.y + knob.size.y);
    if (newPosition.x < cursor.position.x) {
        var dx = newPosition.x - cursor.position.x;
        cursor.size.x -= dx;
        cursor.position.x += dx;
    }
    if (newPosition.y < cursor.position.y) {
        var dy = newPosition.y - cursor.position.y;
        cursor.size.y -= dy;
        cursor.position.y += dy;
    }

    // pull receding boundary
    if (direction === "down" && quadrant[0] === "n") {
        cursor.position.y += change.y;
        cursor.size.y -= change.y;
    }
    if (direction === "up" && quadrant[0] === "s") {
        cursor.size.y += change.y;
    }
    if (direction === "right" && quadrant[1] === "w") {
        cursor.position.x += change.x;
        cursor.size.x -= change.x;
    }
    if (direction === "left" && quadrant[1] === "e") {
        cursor.size.x += change.x;
    }

    knob.position.become(newPosition).subThis(cursor.position);
}

function getKnobQuadrant() {
    var w = knob.position.x === 0;
    var e = knob.position.x === cursor.size.x - knob.size.x;
    var n = knob.position.y === 0;
    var s = knob.position.y === cursor.size.y - knob.size.y;
    return (n && s ? "c" : (n ? "n" : "s")) + (e && w ? "c" : (w ? "w" : "e"));
}

function setKnobQuadrant(quadrant) {
    if (quadrant[1] === "w") {
        knob.position.x = 0;
    } else {
        knob.position.x = cursor.size.x - knob.size.x;
    }
    if (quadrant[0] === "n") {
        knob.position.y = 0;
    } else {
        knob.position.y = cursor.size.y - knob.size.y;
    }
}

function keyChange(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    mode = mode(event, key, keyCode);
}

function cursorMode(event, key, keyCode) {
    if (event.type === "keyup") {
        if (keyCode === 13) {
            isCursorMode = false;
            bottomCurb = 0;
            return openInspector(function () {
                bottomCurb = 40;
                isCursorMode = true;
                draw();
                return cursorMode;
            });
        }
    } else if (event.type === "keypress") {
        if (directionKeys[key]) {
            // move by stride
            point.become(directions[directionKeys[key]]);
            point.x *= cursor.size.x;
            point.y *= cursor.size.y;
            cursor.position.addThis(point);
            draw();
        } else if (directionKeys[key.toLowerCase()]) {
            // move by one
            point.become(directions[directionKeys[key.toLowerCase()]]);
            cursor.position.addThis(point);
            draw();
        } else if (/[1-9]/.test(key)) {
            return makeIntegerMode(key, function (number) {
                if (number) {
                    return makeRepeatMode(number, function () {
                        return cursorMode;
                    });
                } else {
                    return cursorMode;
                }
            });
        } else if (key === "s") {
            return enterKnobMode(cursorMode);
        } else if (key === "0") {
            point.become(cursor.size).scaleThis(.5).floorThis();
            cursor.size.become(Point2.one);
            cursor.position.addThis(point);
            knob.size.become(Point2.one);
            knob.position.become(Point2.zero);
            draw();
        } else if (key === "I") { // grow cursor
            var quadrant = getKnobQuadrant();
            cursor.size.addThis(Point2.one).addThis(Point2.one);
            cursor.position.subThis(Point2.one);
            setKnobQuadrant(quadrant);
            draw();
        } else if (key === "i") { // shrink cursor
            var quadrant = getKnobQuadrant();
            var nx = Math.max(1, cursor.size.x - 2);
            var ny = Math.max(1, cursor.size.y - 2);
            cursor.position.x -= Math.ceil((nx - cursor.size.x) / 2);
            cursor.position.y -= Math.ceil((ny - cursor.size.y) / 2);
            cursor.size.x = nx;
            cursor.size.y = ny;
            knob.size.x = Math.min(knob.size.x, cursor.size.x);
            knob.size.y = Math.min(knob.size.y, cursor.size.y);
            setKnobQuadrant(quadrant);
            draw();
        } else if (key === ":") {
            return openFileMenu(function () {
                return cursorMode;
            });
        }
        // enter - open inspector for commands to perform on the selected region
        // including the creation of a named region with triggers
        // set the cursor position to the origin
        // "(" begin macro end macro ")"
        // "." replay last command
        // "/" chat
        // "?" toggle help
        // number
        // save context (cursor etc)
        // restore context (cursor etc)
    }
    return cursorOrKnobMode(event, key, keyCode, cursorMode);
}

function enterKnobMode(returnMode) {

    function knobMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return exit();
            }
        } else if (event.type === "keypress") {
            if (directionKeys[key]) {
                // move
                moveKnob(directionKeys[key], knob.size);
                draw();
            } else if (directionKeys[key.toLowerCase()]) {
                // creep
                moveKnob(directionKeys[key.toLowerCase()], Point2.one);
                draw();
            } else if (key === "o") {
                // rotate knob quadrant
                var quadrant = getKnobQuadrant();
                var nextQuadrant = nextCursorQuadrant[quadrant];
                setKnobQuadrant(nextQuadrant);
                flipBuffer(quadrant, nextQuadrant);
                draw();
            } else if (key === "O") {
                // rotate knob quadrant
                var quadrant = getKnobQuadrant();
                var prevQuadrant = prevCursorQuadrant[quadrant];
                setKnobQuadrant(prevQuadrant);
                flipBuffer(quadrant, prevQuadrant);
                draw();
            } else if (key === "g") { // center the knob on the origin
            // TODO "gg" for origin, "g." for other marked locations
                point.become(knob.size).subThis(Point2.one).scaleThis(.5).floorThis();
                cursor.position.become(Point2.zero).subThis(knob.position).subThis(point);
                draw();
            // TODO "G" mark center of knob as location
            } else if (key === "r") {
                var quadrant = getKnobQuadrant();
                var nextQuadrant = nextCursorQuadrant[quadrant];
                point.become(knob.position);
                setKnobQuadrant(nextQuadrant);
                cursor.position.subThis(knob.position).addThis(point);
                flipBuffer(quadrant, nextQuadrant);
                draw();
            } else if (key === "R") {
                var quadrant = getKnobQuadrant();
                var prevQuadrant = prevCursorQuadrant[quadrant];
                point.become(knob.position);
                setKnobQuadrant(prevQuadrant);
                cursor.position.subThis(knob.position).addThis(point);
                flipBuffer(quadrant, prevQuadrant);
                draw();
            } else if (key === "t") { // transpose
                var quadrant = getKnobQuadrant();
                transposeBuffer(quadrant);
                point.become(knob.position);
                var temp = cursor.size.x;
                cursor.size.x = cursor.size.y;
                cursor.size.y = temp;
                setKnobQuadrant(quadrant);
                point.subThis(knob.position);
                cursor.position.addThis(point);
                draw();
            } else if (key === "I") { // push cursor stack
                // TODO remember larger cursors if they still fit
                cursorStack[cursorIndex++] = knob.size.clone();
                // grow the outer cursor if necessary
                if (knob.size.equals(cursor.size)) {
                    cursor.size.addThis(Point2.one).addThis(Point2.one);
                    cursor.position.subThis(Point2.one);
                }
                // grow knob to match cursor size
                knob.size.become(cursor.size);
                knob.position.become(Point2.zero);
                draw();
            } else if (key === "i") { // pop cursor stack
                if (cursorIndex > 0) {
                    // restore smaller remembered cursor
                    var quadrant = getKnobQuadrant();
                    knob.size.become(cursorStack[--cursorIndex]);
                    setKnobQuadrant(quadrant);
                    draw();
                } else {
                    cursor.position.addThis(knob.position);
                    cursor.size.become(knob.size);
                    knob.position.become(Point2.zero);
                    draw();
                }
            } else if (key === "0") {
                point.become(cursor.size).scaleThis(.5).floorThis();
                cursor.size.become(Point2.one);
                cursor.position.addThis(point);
                knob.size.become(Point2.one);
                knob.position.become(Point2.zero);
                return exit();
            } else if (key === "s") {
                return exit();
            }
        }
        return cursorOrKnobMode(event, key, keyCode, knobMode);
    }

    function exit() {
        isKnobMode = false;
        draw();
        return returnMode;
    }

    isKnobMode = true;
    draw();
    return knobMode;
}

function cursorOrKnobMode(event, key, keyCode, mode) {
    if (event.type === "keypress") {
        if (key === "d") {
            cursorArea.dig();
        } else if (key === "f") {
            cursorArea.fill();
        } else if (key === "c" || key === "y") {
            buffer.clear();
            bufferSize.become(cursor.size);
            cursorArea.forEach(function (tile, x, y) {
                point.x = x;
                point.y = y;
                buffer.set(point.clone(), tile.space);
            });
        } else if (key === "x") {
            buffer.clear();
            bufferSize.become(cursor.size);
            cursorArea.forEach(function (tile, x, y) {
                point.x = x;
                point.y = y;
                buffer.set(point.clone(), tile.space);
                tile.space = false;
            });
        } else if (key === "v" || key === "p") {
            cursorArea.forEach(function (tile, x, y) {
                point.x = x % bufferSize.x;
                point.y = y % bufferSize.y;
                tile.space = buffer.get(point);
            });
        } else if (key == "~") {
            cursorArea.flip();
        } else if (key === "-") {
            cursorArea.forEach(function (tile, x, y) {
                point.x = x % bufferSize.x;
                point.y = y % bufferSize.y;
                if (buffer.get(point)) {
                    tile.space = false;
                }
            });
        } else if (key === "+") {
            cursorArea.forEach(function (tile, x, y) {
                point.x = x % bufferSize.x;
                point.y = y % bufferSize.y;
                if (buffer.get(point)) {
                    tile.space = true;
                }
            });
        } else if (key === "g") { // go to origin
        // TODO "gg" for origin, "gX" for other marked locations
            point.become(cursor.size).subThis(Point2.one).scaleThis(.5).floorThis();
            cursor.position.become(Point2.zero).subThis(point);
            draw();
        // TODO "G" mark a location
        }
        // enter - open inspector for commands to perform on the selected region
        // including the creation of a named region with triggers
        // set the cursor position to the origin
        // "(" begin macro end macro ")"
        // "." replay last command
        // "/" chat
        // "?" toggle help
        // number
        // save context (cursor etc)
        // restore context (cursor etc)
    }
    return mode;
}

function openFileMenu(callback) {
    isFileMenuMode = true;
    draw();
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
                generateDungeon(cursorArea);
                draw();
                return closeFileMenu();
            }
        }
        return fileMenuMode;
    }
    function closeFileMenu() {
        isFileMenuMode = false;
        draw();
        return callback();
    }
    return fileMenuMode;
}

function loadFromLocalStorage() {
    var delf = localStorage.getItem("delf");
    if (delf) {
        tiles.clear();
        tileViews.clear();
        JSON.parse(delf).tiles.forEach(function (tuple) {
            point.x = tuple[0];
            point.y = tuple[1];
            tiles.get(point).space = true;
        });
        draw();
    }
}

function saveToLocalStorage() {
    var x;
    localStorage.setItem("delf", x = JSON.stringify({
        tiles: tiles.filter(function (tile, point) {
            return tile.space;
        })
        .tiles(function (tile, point) {
            return [point.x, point.y];
        })
    }));
}

function openInspector(callback) {
    rightCurb = window.innerWidth / 3;
    inspectorElement.style.visibility = "visible";
    draw();
    function inspectorMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                closeInspector();
                return callback();
            }
        } else if (event.type === "keypress") {
        }
        return inspectorMode;
    }
    function closeInspector() {
        inspectorElement.style.visibility = "hidden";
        rightCurb = 0;
        draw();
    }
    return inspectorMode;
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

function makeCountMode(mode, count) {
    return function (event, key, keyCode) {
        return mode(event, key, keyCode, count);
    };
}

function flipBuffer(prev, next) {
    var temp;
    tempBuffer.clear();
    tempBufferSize.become(bufferSize);
    var width = cursor.size.x;
    var height = cursor.size.y;
    if (prev[0] !== next[0]) { // vertical
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var space = buffer.get(point);
                point.x = x;
                point.y = height - y - 1;
                tempBuffer.set(point.clone(), space);
            }
        }
    } else { // horizontal
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var space = buffer.get(point);
                point.x = width - x - 1;
                point.y = y;
                tempBuffer.set(point.clone(), space);
            }
        }
    }
    // swap the buffers
    temp = buffer;
    buffer = tempBuffer;
    tempBuffer = temp;
    temp = bufferSize;
    bufferSize = tempBufferSize;
    tempBufferSize = temp;
}

function transposeBuffer(quadrant) {
    var temp;
    tempBuffer.clear();
    tempBufferSize.x = bufferSize.y;
    tempBufferSize.y = bufferSize.x;
    var width = bufferSize.x;
    var height = bufferSize.y;
    // nw, se
    if (quadrant === "nw" || quadrant === "se") {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var space = buffer.get(point);
                point.x = y;
                point.y = x;
                tempBuffer.set(point.clone(), space);
            }
        }
    } else {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var space = buffer.get(point);
                point.x = height - 1 - y;
                point.y = width - 1 - x;
                tempBuffer.set(point.clone(), space);
            }
        }
    }
    // swap the buffers
    temp = buffer;
    buffer = tempBuffer;
    tempBuffer = temp;
    temp = bufferSize;
    bufferSize = tempBufferSize;
    tempBufferSize = temp;
}

function getComponent(event) {
    var target = event.target;
    while (target) {
        if (target.component) {
            return target.component;
        }
        target = target.parentNode;
    }
}

main();

