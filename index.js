
require("collections/shim-array");
var FastMap = require("collections/fast-map");
var FastSet = require("collections/fast-set");
var Point2 = require("./point2");
var Point3 = require("./point3");
var Region2 = require("./region2");

function Tile(point) {
    this.point = new Point2();
    this.point.become(point);
    this.space = false;
}

function TileView() {
    this.point = new Point2(); // map position
    this.pointPx = new Point3(); // 3d position in view in px
    this.tile = null; // model
    this.element = document.createElement("div");
    this.element.className = "tile";
    // For mark and sweep free list collection
    this.mark = null;
}

TileView.prototype.reset = function () {
};

TileView.prototype.draw = function () {
    var tile = this.tile;
    this.pointPx.become(this.point).mulThis(tileLength);
    this.pointPx.z = this.tile.space ? -40 : 0;
    var tileTransform = transform3(this.pointPx);
    this.element.style.webkitTransform = tileTransform;
    this.element.style.transform = tileTransform;
    this.element.className = "tile" + (this.tile.space ? " space" : "");
    this.element.style.zIndex = this.tile.space ? -1 : 0;
};

var tileLength = 50;
var tileSize = new Point2(tileLength, tileLength);
var halfTileSize = tileSize.div(2);
var tileViews = new FastMap();
var freeTiles = [];
var map = new FastMap(); // point to state
map.getDefault = function (point) {
    var tile = new Tile(point);
    this.set(point.clone(), tile);
    return tile;
};

var cursor = new Region2(new Point2(0, 0), new Point2(1, 1));
var innerCursor = new Region2(new Point2(0, 0), new Point2(1, 1));
var frustum = new Region2(new Point2(), new Point2());
var windowSize = new Point2();
var marginLength = 10;
var margin = new Point2(marginLength, marginLength);
var offset = new Point2();
offset.become(Point2.zero).subThis(margin).divThis(2);

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

var tileViewsToFree = [];
var point = new Point2();
function resetFrustum() {
    windowSize.x = window.innerWidth;
    windowSize.y = window.innerHeight;
    frustum.size.become(windowSize).divThis(tileLength).addThis(margin);
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
document.body.appendChild(centerElement);


var centerPx = new Point2();
var cursorPx = new Region2(new Point2(), new Point2());
var originPx = new Point2();


function resize() {
    centerPx.x = window.innerWidth;
    centerPx.y = window.innerHeight;
    centerPx.divThis(2);
    centerElement.style.top = centerPx.y + "px";
    centerElement.style.left = centerPx.x + "px";
    resetFrustum();
}


function draw() {

    cursorPx.become(cursor).mulThis(tileLength);
    var cursorTransform = transform2(cursorPx.position);
    cursorElement.style.transform = cursorTransform;
    cursorElement.style.webkitTransform = cursorTransform;

    originPx.x = 0;
    originPx.y = 0;
    originPx.subThis(cursorPx.position).subThis(halfTileSize);
    var originTransform = transform2(originPx);
    originElement.style.transform = originTransform;
    originElement.style.webkitTransform = originTransform;

    resetFrustum();
}

function transform2(pointPx) {
    return "translateX(" + pointPx.x + "px) translateY(" + pointPx.y + "px)";
}

function transform3(pointPx) {
    return "translateX(" + pointPx.x + "px) translateY(" + pointPx.y + "px) translateZ(" + pointPx.z  + "px)";
}

resize();
window.addEventListener("resize", resize);
draw();



window.addEventListener("keypress", function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    state = state(key, keyCode);
});

var state = function (key, keyCode) {
    if (key === "x" || keyCode === 32) { // space
        var tile = map.get(cursor.position);
        tile.space = !tile.space;
        var tileView = tileViews.get(cursor.position);
        tileView.draw();
        // dig and fill
    } else if (directionKeys[key]) {
        cursor.position.addThis(directions[directionKeys[key]]);
        draw();
    } else if (directionKeys[key.toLowerCase()]) {
        // resize
    }
    return state;
};

