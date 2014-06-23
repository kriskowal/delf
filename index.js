
require("collections/shim-array");
var FastMap = require("collections/fast-map");
var FastSet = require("collections/fast-set");
var Point2 = require("./point2");
var Region2 = require("./region2");
var TileView = require("./tile-view");
var Tile = require("./tile");

var tileSize = new Point2(TileView.size, TileView.size);
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
var frustum = new Region2(new Point2(), new Point2());
var windowSize = new Point2();
var marginLength = 30;
var margin = new Point2(marginLength, marginLength);
var offset = new Point2();
offset.become(Point2.zero).subThis(margin).divThis(2);

var centerPx = new Point2();
var cursorPx = new Region2(new Point2(), new Point2());
var halfCursorSizePx = new Point2();
var innerCursorPx = new Region2(new Point2(), new Point2());
var originPx = new Point2();

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

var creepDirectionKeyCodes = {
    8: "left",
    10: "down",
    11: "up",
    12: "right"
};

var bottomCurb = 100;
var topCurb = 0;
var leftCurb = 0;
var rightCurb = 0;

var tileViewsToFree = [];
var point = new Point2();
function resetFrustum() {
    windowSize.x = window.innerWidth;
    windowSize.y = window.innerHeight;
    frustum.size.become(windowSize).divThis(TileView.size).addThis(margin);
    frustum.position.become(Point2.zero).subThis(frustum.size).divThis(2).addThis(cursor.position);

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


var menuElement = document.createElement("div");
document.body.appendChild(menuElement);
menuElement.style.visibility = "hidden";
menuElement.classList.add("menu");

var containerElement = document.querySelector(".container");
var helpElement = document.querySelector(".help");
var viewportElement = document.querySelector(".viewport");
var helpShown = true;
var innerCursorElement = document.createElement("div");
var cursorElement = document.createElement("div");
var originElement = document.createElement("div");
var centerElement = document.createElement("div");
innerCursorElement.classList.add("innerCursor");
cursorElement.classList.add("cursor");
originElement.classList.add("origin");
centerElement.classList.add("center");
cursorElement.appendChild(innerCursorElement);
originElement.appendChild(cursorElement);
centerElement.appendChild(originElement);
viewportElement.appendChild(centerElement);

function resize() {
    centerPx.x = window.innerWidth;
    centerPx.y = window.innerHeight;
    centerPx.divThis(2);
    centerElement.style.top = centerPx.y + "px";
    centerElement.style.left = centerPx.x + "px";
    resetFrustum();
}


function draw() {

    var same = innerCursor.size.equals(cursor.size);
    innerCursorPx.become(innerCursor).mulThis(TileView.size);
    innerCursorPx.size.x -= 20;
    innerCursorPx.size.y -= 20;
    innerCursorElement.style.opacity = same ? 0 : 1;
    innerCursorElement.style.left = innerCursorPx.position.x + "px";
    innerCursorElement.style.top = innerCursorPx.position.y + "px";
    innerCursorElement.style.width = innerCursorPx.size.x + "px";
    innerCursorElement.style.height = innerCursorPx.size.y + "px";

    cursorPx.become(cursor).mulThis(TileView.size);
    cursorElement.style.left = cursorPx.position.x + "px";
    cursorElement.style.top = cursorPx.position.y + "px";
    cursorElement.style.width = cursorPx.size.x + "px";
    cursorElement.style.height = cursorPx.size.y + "px";

    halfCursorSizePx.become(cursor.size).mulThis(TileView.size).divThis(2);

    originPx.x = (leftCurb - rightCurb) / 2;
    originPx.y = (topCurb - bottomCurb) / 2;
    originPx.subThis(cursorPx.position).subThis(halfCursorSizePx);
    originElement.style.left = originPx.x + "px";
    originElement.style.top = originPx.y + "px";

    requestResetFrustum();
}

function requestResetFrustum() {
    if (resetFrustumHandle) {
        clearTimeout(resetFrustumHandle);
    }
    resetFrustumHandle = setTimeout(resetFrustumThunk, 1000);
}
function resetFrustumThunk() {
    resetFrustumHandle = null;
    resetFrustum();
}
var resetFrustumHandle = null;

resize();
window.addEventListener("resize", resize);
draw();


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

function changeInnerCursor(quadrant, direction, size) {
    if (direction === "up") {
        if (quadrant[0] === "n" || quadrant[0] === "c") {
            // grow upward from top
            cursor.size.y += size.y;
            cursor.position.y -= size.y;
        } else {
            // shrink upward from bottom
            cursor.size.y -= size.y;
            innerCursor.position.y -= size.y;
        }
    } else if (direction === "down") {
        if (quadrant[0] === "s" || quadrant[0] === "c") {
            // grow downward from bottom
            cursor.size.y += size.y;
            innerCursor.position.y += size.y;
        } else {
            // shrink downward from top
            cursor.size.y -= size.y;
            cursor.position.y += size.y;
        }
    } else if (direction === "left") {
        if (quadrant[1] === "w" || quadrant[1] === "c") {
            // grow leftward from left
            cursor.size.x += size.x;
            cursor.position.x -= size.x;
        } else {
            // shrink leftward from right
            cursor.size.x -= size.x;
            innerCursor.position.x -= size.x;
        }
    } else if (direction === "right") {
        if (quadrant[1] === "e" || quadrant[1] === "c") {
            // grow rightward from right
            cursor.size.x += size.x;
            innerCursor.position.x += size.x;
        } else {
            // shrink rightward from left
            cursor.size.x -= size.x;
            cursor.position.x += size.x;
        }
    }
}

function getCursorQuadrant() {
    var w = innerCursor.position.x === 0;
    var e = innerCursor.position.x + innerCursor.size.x === cursor.size.x;
    var n = innerCursor.position.y === 0;
    var s = innerCursor.position.y + innerCursor.size.y === cursor.size.y;
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


window.addEventListener("keydown", keyChange);
window.addEventListener("keyup", keyChange);
window.addEventListener("keypress", keyChange);

function keyChange(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    state = state(event, key, keyCode);
}

var state = initialState;

var bufferSize = new Point2();
var buffer = new FastMap();
var tempBuffer = new FastMap();

function flipBuffer(prev, next) {
    var temp;
    tempBuffer.clear();
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
                tempBuffer.set(point, space);
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
                tempBuffer.set(point, space);
            }
        }
    }
    // swap the buffers
    temp = buffer;
    buffer = tempBuffer;
    tempBuffer = temp;
};

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

function initialState(event, key, keyCode) {
    if (event.type === "keyup") {
        if (keyCode === 27) {
            return openMenu(initialState);
        } else if (keyCode === 13) {
        }
    } else if (event.type === "keypress") {
        if (key === "f") {
            cursorEach(function (tile) {
                tile.space = false;
            })
        } else if (key === "d") {
            cursorEach(function (tile) {
                tile.space = true;
            })
        } else if (key === "t" || keyCode == 32) { // space
            cursorEach(function (tile) {
                tile.space = !tile.space;
            })
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
                if (!buffer.get(point)) {
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
        } else if (directionKeys[key]) {
            // move by stride
            point.become(directions[directionKeys[key]]);
            point.x *= cursor.size.x;
            point.y *= cursor.size.y;
            cursor.position.addThis(point);
            draw();
        } else if (directionKeys[key.toLowerCase()]) {
            // resize cursor by stride
            changeInnerCursor(getCursorQuadrant(), directionKeys[key.toLowerCase()], innerCursor.size);
            draw();
        } else if (creepDirectionKeyCodes[keyCode]) {
            if (event.shiftKey) {
                // resize cursor by creeping
                changeInnerCursor(getCursorQuadrant(), creepDirectionKeyCodes[keyCode], Point2.one);
                draw();
            } else {
                // move by creeping
                point.become(directions[creepDirectionKeyCodes[keyCode]]);
                cursor.position.addThis(point);
            }
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
            // TODO flip buffer
            var quadrant = getCursorQuadrant();
            var prevQuadrant = prevCursorQuadrant[quadrant];
            setCursorQuadrant(prevQuadrant);
            flipBuffer(quadrant, prevQuadrant);
            draw();
        } else if (keyCode === 15) { // ^O
            // grow inner cursor to match cursor size
            innerCursor.size.become(cursor.size);
            innerCursor.position.become(Point2.zero);
            draw();
        } else if (key === "0") { // origin
            if (cursor.size.equals(Point2.one)) {
                cursor.position.become(Point2.zero);
            } else {
                cursor.size.become(Point2.one);
                innerCursor.position.become(Point2.zero);
                innerCursor.size.become(Point2.one);
            }
            draw();
        } else if (key === ")") {
            // set origin, full map transform
        } else if (key === "/") {
            // chat
        } else if (key === "?") {
            // help
        }
    }
    return state;
};

function openMenu(returnState) {
    rightCurb = window.innerWidth / 3;
    menuElement.style.visibility = "visible";
    draw();
    function menuState(event, key, keyCode) {
        if (event.type === "keyup") {
            if (keyCode === 27) {
                closeMenu();
                return returnState;
            }
        } else if (event.type === "keypress") {
        }
        return menuState;
    }
    function closeMenu() {
        menuElement.style.visibility = "hidden";
        rightCurb = 0;
        draw();
    }
    return menuState;
}

