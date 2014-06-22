
var Map = require("collections/map");
var Point = require("./point");

var map = new Map();
var mapElements = new Map();

var tile = new Point(50, 50);
var halftile = tile.div(2);
var cursor = new Point(0, 0);
var bounds = new Point(0, 0);
var size = tile.clone();
var directions = {
    h: new Point(-50, 0),
    j: new Point(0, 50),
    k: new Point(0, -50),
    l: new Point(50, 0)
};

map.observeMapChange(function (plus, minus, key, type) {
    if (type === "create") {
        console.log("CREATE", key.x, key.y);
        var tile = document.createElement("div");
        tile.classList.add("tile", "space");
        tile.style.top = key.y + "px";
        tile.style.left = key.x + "px";
        mapElements.set(key, tile);
        originElement.insertBefore(tile, cursorElement);
    } else if (type === "delete") {
        console.log("DELETE", key.x, key.y);
        var tile = mapElements.get(key);
        mapElements.delete(key);
        originElement.removeChild(tile);
    }
});

window.addEventListener("resize", function () {
    draw();
});

window.addEventListener("keypress", function (event) {
    var key = String.fromCharCode(event.keyCode);
    state = state(key, event.keyCode);
});

var state = function (key, keyCode) {
    if (keyCode === 32) { // space
        if (map.has(cursor)) {
            map.delete(cursor);
        } else {
            map.set(cursor.clone(), true);
        }
    } else if (directions[key]) {
        cursor.addThis(directions[key]);
        draw();
    } else if (directions[key.toLowerCase()]) {
        // resize
    }
    return state;
};

function draw() {
    var center = new Point(window.innerWidth, window.innerHeight);
    center.divThis(2);
    center.subThis(halftile);
    center.subThis(cursor);
    originElement.style.left = center.x + "px";
    originElement.style.top = center.y + "px";
    cursorElement.style.left = cursor.x + "px";
    cursorElement.style.top = cursor.y + "px";
}

var originElement = document.createElement("div");
var cursorElement = document.createElement("div");
cursorElement.classList.add("tile", "cursor");
originElement.appendChild(cursorElement);
draw();
originElement.classList.add("origin");
document.body.appendChild(originElement);

