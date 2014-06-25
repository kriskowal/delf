
require("collections/shim-array");
var FastMap = require("collections/fast-map");
var FastSet = require("collections/fast-set");
var Point2 = require("./point2");
var Region2 = require("./region2");
var TileView = require("./tile-view");
var Tile = require("./tile");

var tileViews = new FastMap();
var freeTiles = [];
var map = new FastMap(); // point to state
map.getDefault = function (point) {
    var tile = new Tile(point);
    this.set(point.clone(), tile);
    return tile;
};

var viewport = new Region2(new Point2(0, 0), new Point2());
var cursor = new Region2(new Point2(0, 0), new Point2(1, 1));
var innerCursor = new Region2(new Point2(0, 0), new Point2(1, 1));
var cursorStack = [];
var cursorIndex = 0; // The position of the next available cursor slot to push
                     // One past the position of the next cursor to pop
var innerCursorMode = false;

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

var bottomCurb = 100;
var topCurb = 0;
var leftCurb = 0;
var rightCurb = 0;
// TODO convert this to a mode line
var helpShown = true;

var tileViewsToFree = [];

// temporary point used in many functions
var point = new Point2();

var mode = cursorMode;

// TODO use a Bin abstraction that captures the data and dimensions and has the
// methods for transpose etc
var buffer = new FastMap();
var bufferSize = new Point2();
var tempBuffer = new FastMap();
var tempBufferSize = new Point2();

var containerElement;
var helpElement;
var viewportElement;
var innerCursorElement;
var cursorElement;
var originElement;
var centerElement;
var menuElement;

function main() {

    menuElement = document.createElement("div");
    document.body.appendChild(menuElement);
    menuElement.style.visibility = "hidden";
    menuElement.classList.add("menu");

    // Extant elements
    containerElement = document.querySelector(".container");
    helpElement = document.querySelector(".help");
    viewportElement = document.querySelector(".viewport");

    // Create elements
    innerCursorElement = document.createElement("div");
    cursorElement = document.createElement("div");
    originElement = document.createElement("div");
    centerElement = document.createElement("div");

    // Annotate elements
    innerCursorElement.classList.add("innerCursor");
    cursorElement.classList.add("cursor");
    originElement.classList.add("origin");
    centerElement.classList.add("center");

    // Compose elements
    cursorElement.appendChild(innerCursorElement);
    originElement.appendChild(cursorElement);
    centerElement.appendChild(originElement);
    viewportElement.appendChild(centerElement);

    // Event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyChange);
    window.addEventListener("keyup", keyChange);
    window.addEventListener("keypress", keyChange);

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
                if (freeTiles.length) {
                    tileView = freeTiles.pop();
                    recycled++;
                } else {
                    tileView = new TileView();
                    created++;
                }
                tileView.reset();
                tileView.mark = true;
                tileView.point.become(point);
                tileView.tile = map.get(tileView.point);
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
    freeTiles.swap(freeTiles.length, 0, tileViewsToFree);
    tileViewsToFree.forEach(function (tileView) {
        tileViews.delete(tileView.point);
        originElement.removeChild(tileView.element);
    });

    //console.log("CREATED", created, "UNCHANGED", reused, "RECYCLED", recycled, "DISPOSED", tileViewsToFree.length, "USED", tileViews.length, "FREE", freeTiles.length);
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
var innerCursorPx = new Region2(new Point2(), new Point2());
var originPx = new Point2();
function draw() {
    innerCursorPx.become(innerCursor).scaleThis(TileView.size);
    innerCursorPx.size.x -= 12;
    innerCursorPx.size.y -= 12;
    innerCursorElement.style.opacity = innerCursorMode ? 1 : 0;
    innerCursorElement.style.left = innerCursorPx.position.x + "px";
    innerCursorElement.style.top = innerCursorPx.position.y + "px";
    innerCursorElement.style.width = innerCursorPx.size.x + "px";
    innerCursorElement.style.height = innerCursorPx.size.y + "px";

    cursorPx.become(cursor).scaleThis(TileView.size);
    cursorElement.style.left = cursorPx.position.x + "px";
    cursorElement.style.top = cursorPx.position.y + "px";
    cursorElement.style.width = cursorPx.size.x + "px";
    cursorElement.style.height = cursorPx.size.y + "px";

    halfCursorSizePx.become(cursor.size).scaleThis(TileView.size).scaleThis(.5);

    originPx.x = (leftCurb - rightCurb) / 2;
    originPx.y = (topCurb - bottomCurb) / 2;
    originPx.subThis(cursorPx.position).subThis(halfCursorSizePx);
    originElement.style.left = originPx.x + "px";
    originElement.style.top = originPx.y + "px";

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
function moveInnerCursor(direction, size) {
    // directions: up, down, left, right
    // size: either 1x1 or innerCursor size
    // absolute position of the inner cursor
    change.become(directions[direction]).mulThis(size);
    position.become(cursor.position).addThis(innerCursor.position);
    newPosition.become(position).addThis(change);
    var quadrant = getCursorQuadrant();
    // quadrant[0] === "n" or "c" means top adjacent
    // adjacent means that side must be pulled if moving away from it

    // push growing boundary
    cursor.size.x = Math.max(cursor.size.x, newPosition.x - cursor.position.x + innerCursor.size.x);
    cursor.size.y = Math.max(cursor.size.y, newPosition.y - cursor.position.y + innerCursor.size.y);
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

    innerCursor.position.become(newPosition).subThis(cursor.position);
}

function getCursorQuadrant() {
    var w = innerCursor.position.x === 0;
    var e = innerCursor.position.x === cursor.size.x - innerCursor.size.x;
    var n = innerCursor.position.y === 0;
    var s = innerCursor.position.y === cursor.size.y - innerCursor.size.y;
    return (n && s ? "c" : (n ? "n" : "s")) + (e && w ? "c" : (w ? "w" : "e"));
}

function setCursorQuadrant(quadrant) {
    if (quadrant[1] === "w") {
        innerCursor.position.x = 0;
    } else {
        innerCursor.position.x = cursor.size.x - innerCursor.size.x;
    }
    if (quadrant[0] === "n") {
        innerCursor.position.y = 0;
    } else {
        innerCursor.position.y = cursor.size.y - innerCursor.size.y;
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
            return openMenu(cursorMode);
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
            return enterInnerCursorMode(cursorMode);
        } else if (key === "I") { // grow cursor
            var quadrant = getCursorQuadrant();
            cursor.size.addThis(Point2.one).addThis(Point2.one);
            cursor.position.subThis(Point2.one);
            setCursorQuadrant(quadrant);
            draw();
        } else if (key === "i") { // shrink cursor
            // find the absolute center of the inner cursor
            point.become(innerCursor.size)
                .scaleThis(.5)
                .floorThis()
                .addThis(innerCursor.position);
            // move the cursor to that position
            cursor.position.addThis(point);
            // reset the size of both the inner and outer cursor to 1x1
            cursor.size.become(Point2.one);
            innerCursor.size.become(Point2.one);
            // and shift the inner cursor back to the middle of the outer cursor
            innerCursor.position.become(Point2.zero);
            draw();
        } else if (key === "d") {
            cursorEach(function (tile) {
                tile.space = true;
            });
        } else if (key == "~") {
            cursorEach(function (tile) {
                tile.space = !tile.space;
            });
        } else if (key === "c" || key === "y") {
            buffer.clear();
            bufferSize.become(cursor.size);
            cursorEach(function (tile, x, y) {
                point.x = x;
                point.y = y;
                buffer.set(point.clone(), tile.space);
            });
        } else if (key === "x") {
            buffer.clear();
            bufferSize.become(cursor.size);
            cursorEach(function (tile, x, y) {
                point.x = x;
                point.y = y;
                buffer.set(point.clone(), tile.space);
                tile.space = false;
            });
        } else if (key === "v" || key === "p") {
            cursorEach(function (tile, x, y) {
                point.x = x % bufferSize.x;
                point.y = y % bufferSize.y;
                tile.space = buffer.get(point);
            });
        } else if (key === "-") {
            cursorEach(function (tile, x, y) {
                point.x = x % bufferSize.x;
                point.y = y % bufferSize.y;
                if (buffer.get(point)) {
                    tile.space = false;
                }
            });
        } else if (key === "+") {
            cursorEach(function (tile, x, y) {
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
        } else if (key === "f") {
            cursorEach(function (tile) {
                tile.space = false;
            })
        }
        // enter - open menu for commands to perform on the selected region
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
    return cursorMode;
}

function enterInnerCursorMode(returnMode) {

    function mode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                return exit();
            }
        } else if (event.type === "keypress") {
            if (directionKeys[key]) {
                // move
                moveInnerCursor(directionKeys[key], innerCursor.size);
                draw();
            } else if (directionKeys[key.toLowerCase()]) {
                // creep
                moveInnerCursor(directionKeys[key.toLowerCase()], Point2.one);
                draw();
            } else if (key === "o") {
                // rotate inner cursor quadrant
                var quadrant = getCursorQuadrant();
                var nextQuadrant = nextCursorQuadrant[quadrant];
                setCursorQuadrant(nextQuadrant);
                flipBuffer(quadrant, nextQuadrant);
                draw();
            } else if (key === "O") {
                // rotate inner cursor quadrant
                var quadrant = getCursorQuadrant();
                var prevQuadrant = prevCursorQuadrant[quadrant];
                setCursorQuadrant(prevQuadrant);
                flipBuffer(quadrant, prevQuadrant);
                draw();
            } else if (key === "g") { // center the inner cursor on the origin
            // TODO "gg" for origin, "g." for other marked locations
                point.become(innerCursor.size).subThis(Point2.one).scaleThis(.5).floorThis();
                cursor.position.become(Point2.zero).subThis(innerCursor.position).subThis(point);
                draw();
            // TODO "G" mark center of inner cursor as location
            } else if (key === "r") {
                var quadrant = getCursorQuadrant();
                var nextQuadrant = nextCursorQuadrant[quadrant];
                point.become(innerCursor.position);
                setCursorQuadrant(nextQuadrant);
                cursor.position.subThis(innerCursor.position).addThis(point);
                flipBuffer(quadrant, nextQuadrant);
                draw();
            } else if (key === "R") {
                var quadrant = getCursorQuadrant();
                var prevQuadrant = prevCursorQuadrant[quadrant];
                point.become(innerCursor.position);
                setCursorQuadrant(prevQuadrant);
                cursor.position.subThis(innerCursor.position).addThis(point);
                flipBuffer(quadrant, prevQuadrant);
                draw();
            } else if (key === "t") { // transpose
                var quadrant = getCursorQuadrant();
                transposeBuffer(quadrant);
                point.become(innerCursor.position);
                var temp = cursor.size.x;
                cursor.size.x = cursor.size.y;
                cursor.size.y = temp;
                setCursorQuadrant(quadrant);
                point.subThis(innerCursor.position);
                cursor.position.addThis(point);
                draw();
            } else if (key === "I") { // push cursor stack
                // TODO remember larger cursors if they still fit
                cursorStack[cursorIndex++] = innerCursor.size.clone();
                // grow the outer cursor if necessary
                if (innerCursor.size.equals(cursor.size)) {
                    cursor.size.addThis(Point2.one).addThis(Point2.one);
                    cursor.position.subThis(Point2.one);
                }
                // grow inner cursor to match cursor size
                innerCursor.size.become(cursor.size);
                innerCursor.position.become(Point2.zero);
                draw();
            } else if (key === "i") { // pop cursor stack
                if (cursorIndex > 0) {
                    // restore smaller remembered cursor
                    var quadrant = getCursorQuadrant();
                    innerCursor.size.become(cursorStack[--cursorIndex]);
                    setCursorQuadrant(quadrant);
                    draw();
                } else {
                    return exit()(event, key, keyCode);
                }
            } else if (key === "s") {
                return exit();
            } else {
                // TODO this could end poorly
                returnMode = returnMode(event, key, keyCode);
                return mode;
            }
        }
        return mode;
    }

    function exit() {
        innerCursorMode = false;
        draw();
        return returnMode;
    }

    innerCursorMode = true;
    draw();
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

function openMenu(returnMode) {
    rightCurb = window.innerWidth / 3;
    menuElement.style.visibility = "visible";
    draw();
    function menuMode(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                closeMenu();
                return returnMode;
            }
        } else if (event.type === "keypress") {
        }
        return menuMode;
    }
    function closeMenu() {
        menuElement.style.visibility = "hidden";
        rightCurb = 0;
        draw();
    }
    return menuMode;
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

function cursorEach(callback) {
    var width = cursor.size.x;
    var height = cursor.size.y;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            point.x = cursor.position.x + x;
            point.y = cursor.position.y + y;
            var tileView = tileViews.get(point);
            callback(map.get(point), x, y);
            if (tileView) {
                tileView.draw();
            }
        }
    }
}

main();

