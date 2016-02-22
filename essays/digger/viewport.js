"use strict";

var FastMap = require("collections/fast-map");
var Point2 = require("ndim/point2");
var Region2 = require("ndim/region2");
var Area = require("./area");
var Tile = require("./tile");
var makeArrayObservable = require('pop-observe').makeArrayObservable;

var point = new Point2();

module.exports = Viewport;
function Viewport(body, scope) {
    var self = this;
    this.tiles = new FastMap(); // point to tile model
    this.tileStore = {};
    this.storage = null;
    this.tiles.getDefault = function (point) {
        var tile = new Tile(point);
        tile.delegate = self;
        this.set(point.clone(), tile);
        return tile;
    };
    this.knobRegion = new Region2(new Point2(0, 0), new Point2(1, 1));
    this.cursorRegion = new Region2(new Point2(0, 0), new Point2(1, 1));
    this.cursorArea = new Area(this.cursorRegion.size, this.cursorRegion.position, this.tiles, this);
    this.cursorStack = [];
    this.cursorIndex = 0;
    this.isFocused = false;
    this.isCursorMode = true;
    this.isKnobMode = false;

    // TODO replace curbs with a center, adjusted in response to visible region change events
    this.leftCurb = 0;
    this.topCurb = 0;
    this.bottomCurb = 0;
    this.rightCurb = 0;
    this.animator = scope.animator.add(this);
    this.attention = scope.attention;

    this.tileSize = new Point2(24, 24);
    this.tileSpace = null;
    this.region = new Region2(new Point2(), new Point2());

    // TODO use a Bin abstraction that captures the data and dimensions and has the
    // methods for transpose etc
    this.buffer = new FastMap();
    this.bufferSize = new Point2();
    this.bufferArea = new Area(this.bufferSize);
}

Viewport.prototype.directions = {
    left: new Point2(-1, 0),
    right: new Point2(1, 0),
    up: new Point2(0, -1),
    down: new Point2(0, 1)
};

Viewport.prototype.nextCursorQuadrant = {
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

Viewport.prototype.prevCursorQuadrant = {
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

Viewport.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(component, scope);
    } else if (id === 'tiles:tile') {
    }
};

Viewport.prototype.hookupThis = function hookupThis(component, scope) {
    var components = scope.components;
    this.element = components.element;
    this.center = components.center;
    this.origin = components.origin;
    this.cursor = components.cursor;
    this.knob = components.knob;
    this.tileSpace = components.tiles;
    this.tileSpace.tileSize.copyFrom(this.tileSize);
    this.tileSpace.delegate = this;
};

Viewport.prototype.measure = function measure() {
    centerPx.x = this.element.clientWidth
    centerPx.y = this.element.clientHeight;
    centerPx.scaleThis(.5);
    this.center.style.top = centerPx.y + "px";
    this.center.style.left = centerPx.x + "px";
};

var knobPx = new Region2(new Point2(), new Point2());
var cursorPx = new Region2(new Point2(), new Point2());
var halfCursorSizePx = new Point2();
var originPx = new Point2();
Viewport.prototype.draw = function draw() {
    var originElement = this.origin;
    var knobElement = this.knob;
    var cursorElement = this.cursor;

    knobPx.copyFrom(this.knobRegion).scaleThis(24);
    knobPx.size.x -= 12;
    knobPx.size.y -= 12;
    knobElement.style.opacity = this.isFocused && this.isKnobMode ? 1 : 0;
    knobElement.style.left = knobPx.position.x + "px";
    knobElement.style.top = knobPx.position.y + "px";
    knobElement.style.width = knobPx.size.x + "px";
    knobElement.style.height = knobPx.size.y + "px";

    cursorPx.copyFrom(this.cursorRegion).scaleThis(24);
    cursorElement.style.opacity = this.isFocused && this.isCursorMode ? 1 : 0;
    cursorElement.style.left = cursorPx.position.x + "px";
    cursorElement.style.top = cursorPx.position.y + "px";
    cursorElement.style.width = cursorPx.size.x + "px";
    cursorElement.style.height = cursorPx.size.y + "px";

    halfCursorSizePx.copyFrom(this.cursorRegion.size).scaleThis(24).scaleThis(.5);

    originPx.x = (this.leftCurb - this.rightCurb) / 2;
    originPx.y = (this.topCurb - this.bottomCurb) / 2;
    originPx.subThis(cursorPx.position).subThis(halfCursorSizePx);
    originElement.style.left = originPx.x + "px";
    originElement.style.top = originPx.y + "px";

    this.reframe();
};

Viewport.prototype.reframe = function reframe() {
    this.region.size.x = window.innerWidth;
    this.region.size.y = window.innerHeight;
    this.region.position.copyFrom(this.region.size)
        .subThis(cursorPx.size)
        .scaleThis(-0.5)
        .floorThis()
        .addThis(cursorPx.position);
    this.tileSpace.reframe(this.region);
};

// resize's reusable structure
var centerPx = new Point2();
Viewport.prototype.handleResize = function () {

    this.animator.requestMeasure();
    this.animator.requestDraw();
};

Viewport.prototype.handleTileChange = function handleTileChange(point, value) {
    this.tileSpace.requestDrawTile(point);
    this.storage.update(point, value);
};

Viewport.prototype.drawTile = function drawTile(tile) {
    var model = this.tiles.get(tile.point);
    if (!model) {
        return;
    }
    tile.actualNode.className = "tile" + (model.value > 0 ? " pal" + model.value : "");
};

Viewport.prototype.moveCursor = function (direction, size) {
    size = size || this.cursorRegion.size;
    point.copyFrom(this.directions[direction]);
    point.x *= size.x;
    point.y *= size.y;
    this.cursorRegion.position.addThis(point);
};

Viewport.prototype.creepCursor = function (direction) {
    this.cursorRegion.position.addThis(this.directions[direction]);
};

Viewport.prototype.getCursorPosition = function () {
    point.copyFrom(this.cursorRegion.size)
        .subThis(Point2.one)
        .scaleThis(.5)
        .floorThis();
    this.cursorRegion.position.copyFrom(position)
        .subThis(point);
};

Viewport.prototype.moveCursorTo = function (position) {
    point.copyFrom(this.cursorRegion.size)
        .subThis(Point2.one)
        .scaleThis(.5)
        .floorThis();
    this.cursorRegion.position.copyFrom(position)
        .subThis(point);
};

Viewport.prototype.moveCursorToOrigin = function () {
    point.copyFrom(this.cursorRegion.size)
        .subThis(Point2.one)
        .scaleThis(.5)
        .floorThis();
    this.cursorRegion.position.copyFrom(Point2.zero)
        .subThis(point);
};

Viewport.prototype.moveKnobToOrigin = function () {
    point.copyFrom(this.knobRegion.size)
        .subThis(Point2.one)
        .scaleThis(.5)
        .floorThis();
    this.cursorRegion.position.copyFrom(Point2.zero)
        .subThis(this.knobRegion.position)
        .subThis(point);
};

Viewport.prototype.growCursor = function () {
    var quadrant = this.getKnobQuadrant();
    this.cursorRegion.size.addThis(Point2.one).addThis(Point2.one);
    this.cursorRegion.position.subThis(Point2.one);
    this.setKnobQuadrant(quadrant);
    this.animator.requestDraw();
};

Viewport.prototype.shrinkCursor = function () {
    var quadrant = this.getKnobQuadrant();
    var nx = Math.max(1, this.cursorRegion.size.x - 2);
    var ny = Math.max(1, this.cursorRegion.size.y - 2);
    this.cursorRegion.position.x -= Math.ceil((nx - this.cursorRegion.size.x) / 2);
    this.cursorRegion.position.y -= Math.ceil((ny - this.cursorRegion.size.y) / 2);
    this.cursorRegion.size.x = nx;
    this.cursorRegion.size.y = ny;
    this.knobRegion.size.x = Math.min(this.knobRegion.size.x, this.cursorRegion.size.x);
    this.knobRegion.size.y = Math.min(this.knobRegion.size.y, this.cursorRegion.size.y);
    this.setKnobQuadrant(quadrant);
    this.animator.requestDraw();
};

Viewport.prototype.collapseCursor = function () {
    point.copyFrom(this.cursorRegion.size).scaleThis(.5).floorThis();
    this.cursorRegion.size.copyFrom(Point2.one);
    this.cursorRegion.position.addThis(point);
    this.knobRegion.size.copyFrom(Point2.one);
    this.knobRegion.position.copyFrom(Point2.zero);
    this.animator.requestDraw();
};

var position = new Point2();
var newPosition = new Point2();
var change = new Point2();
Viewport.prototype.moveKnob = function (direction, size) {
    var knob = this.knobRegion;
    var cursor = this.cursorRegion;
    size = size || this.knobRegion.size;

    // directions: up, down, left, right
    // size: either 1x1 or knob size
    // absolute position of the knob
    change.copyFrom(this.directions[direction]).mulThis(size);
    position.copyFrom(cursor.position).addThis(knob.position);
    newPosition.copyFrom(position).addThis(change);
    var quadrant = this.getKnobQuadrant();
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

    knob.position.copyFrom(newPosition).subThis(cursor.position);
};

Viewport.prototype.creepKnob = function (direction) {
    this.moveKnob(direction, Point2.one);
};

Viewport.prototype.getKnobQuadrant = function () {
    var knob = this.knobRegion;
    var cursor = this.cursorRegion;

    var w = knob.position.x === 0;
    var e = knob.position.x === cursor.size.x - knob.size.x;
    var n = knob.position.y === 0;
    var s = knob.position.y === cursor.size.y - knob.size.y;
    return (n && s ? "c" : (n ? "n" : "s")) + (e && w ? "c" : (w ? "w" : "e"));
};

Viewport.prototype.setKnobQuadrant = function (quadrant) {
    var knob = this.knobRegion;
    var cursor = this.cursorRegion;

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
    this.animator.requestDraw();
};

Viewport.prototype.rotateKnobClockwise = function () {
    var quadrant = this.getKnobQuadrant();
    var nextQuadrant = this.nextCursorQuadrant[quadrant];
    this.setKnobQuadrant(nextQuadrant);
    this.flipBuffer(quadrant, nextQuadrant);
};

Viewport.prototype.rotateKnobCounterClockwise = function () {
    var quadrant = this.getKnobQuadrant();
    var prevQuadrant = this.prevCursorQuadrant[quadrant];
    this.setKnobQuadrant(prevQuadrant);
    this.flipBuffer(quadrant, prevQuadrant);
};

Viewport.prototype.rotateCursorClockwise = function () {
    var quadrant = this.getKnobQuadrant();
    var nextQuadrant = this.nextCursorQuadrant[quadrant];
    point.copyFrom(this.knobRegion.position);
    this.setKnobQuadrant(nextQuadrant);
    this.cursorRegion.position.subThis(this.knobRegion.position).addThis(point);
    this.flipBuffer(quadrant, nextQuadrant);
};

Viewport.prototype.rotateCursorCounterClockwise = function () {
    var quadrant = this.getKnobQuadrant();
    var prevQuadrant = this.prevCursorQuadrant[quadrant];
    point.copyFrom(this.knobRegion.position);
    this.setKnobQuadrant(prevQuadrant);
    this.cursorRegion.position.subThis(this.knobRegion.position).addThis(point);
    this.flipBuffer(quadrant, prevQuadrant);
};

Viewport.prototype.transposeCursorAboutKnob = function () {
    var quadrant = this.getKnobQuadrant();
    this.transposeBuffer(quadrant);
    point.copyFrom(this.knobRegion.position);
    var temp = this.cursorRegion.size.x;
    this.cursorRegion.size.x = this.cursorRegion.size.y;
    this.cursorRegion.size.y = temp;
    this.setKnobQuadrant(quadrant);
    point.subThis(this.knobRegion.position);
    this.cursorRegion.position.addThis(point);
};

Viewport.prototype.growKnob = function () {
    // TODO remember larger cursors if they still fit
    this.cursorStack[this.cursorIndex++] = this.knobRegion.size.clone();
    // grow the outer cursor if necessary
    if (this.knobRegion.size.equals(this.cursorRegion.size)) {
        this.cursorRegion.size.addThis(Point2.one).addThis(Point2.one);
        this.cursorRegion.position.subThis(Point2.one);
    }
    // grow knob to match cursor size
    this.knobRegion.size.copyFrom(this.cursorRegion.size);
    this.knobRegion.position.copyFrom(Point2.zero);
};

Viewport.prototype.shrinkKnob = function () {
    if (this.cursorIndex > 0) {
        // restore smaller remembered cursor
        var quadrant = this.getKnobQuadrant();
        this.knobRegion.size.copyFrom(this.cursorStack[--this.cursorIndex]);
        this.setKnobQuadrant(quadrant);
    } else {
        this.cursorRegion.position.addThis(this.knobRegion.position);
        this.cursorRegion.size.copyFrom(this.knobRegion.size);
        this.knobRegion.position.copyFrom(Point2.zero);
    }
};

Viewport.prototype.fill = function fill(value) {
    this.cursorArea.fill(value);
};

Viewport.prototype.dig = function dig() {
    this.cursorArea.dig();
};

Viewport.prototype.copy = function copy() {
    this.buffer.clear();
    this.bufferSize.copyFrom(this.cursorRegion.size);
    this.cursorArea.forEach(function (tile, x, y) {
        point.x = x;
        point.y = y;
        this.buffer.set(point.clone(), tile.value);
    }, this);
};

Viewport.prototype.cut = function cut() {
    this.buffer.clear();
    this.bufferSize.copyFrom(this.cursorRegion.size);
    this.cursorArea.forEach(function (tile, x, y) {
        point.x = x;
        point.y = y;
        this.buffer.set(point.clone(), tile.value);
        tile.value = 0;
        this.handleTileChange(tile.point);
    }, this);
};

Viewport.prototype.paste = function paste() {
    this.cursorArea.forEach(function (tile, x, y) {
        point.x = x % this.bufferSize.x;
        point.y = y % this.bufferSize.y;
        tile.value = this.buffer.get(point);
        this.handleTileChange(tile.point);
    }, this);
};

Viewport.prototype.flip = function flip() {
    this.cursorArea.flip();
};

Viewport.prototype.add = function add() {
    this.cursorArea.forEach(function (tile, x, y) {
        point.x = x % this.bufferSize.x;
        point.y = y % this.bufferSize.y;
        if (this.buffer.get(point)) {
            tile.value = 1;
            this.handleTileChange(tile.point);
        }
    }, this);
};

Viewport.prototype.sub = function sub() {
    this.cursorArea.forEach(function (tile, x, y) {
        point.x = x % this.bufferSize.x;
        point.y = y % this.bufferSize.y;
        if (this.buffer.get(point)) {
            tile.value = k;
            this.handleTileChange(tile.point);
        }
    }, this);
};

// for flipBuffer and transposeBuffer
var tempBuffer = new FastMap();
var tempBufferSize = new Point2();

Viewport.prototype.flipBuffer = function(prev, next) {
    var temp;
    tempBuffer.clear();
    tempBufferSize.copyFrom(this.bufferSize);
    var width = this.cursorRegion.size.x;
    var height = this.cursorRegion.size.y;
    if (prev[0] !== next[0]) { // vertical
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var value = this.buffer.get(point);
                point.x = x;
                point.y = height - y - 1;
                tempBuffer.set(point.clone(), value);
            }
        }
    } else { // horizontal
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var value = this.buffer.get(point);
                point.x = width - x - 1;
                point.y = y;
                tempBuffer.set(point.clone(), value);
            }
        }
    }
    // swap the buffers
    temp = this.buffer;
    this.buffer = tempBuffer;
    tempBuffer = temp;
    temp = this.bufferSize;
    this.bufferSize = tempBufferSize;
    tempBufferSize = temp;
};

Viewport.prototype.transposeBuffer = function (quadrant) {
    var temp;
    tempBuffer.clear();
    tempBufferSize.x = this.bufferSize.y;
    tempBufferSize.y = this.bufferSize.x;
    var width = this.bufferSize.x;
    var height = this.bufferSize.y;
    // nw, se
    if (quadrant === "nw" || quadrant === "se") {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var value = this.buffer.get(point);
                point.x = y;
                point.y = x;
                tempBuffer.set(point.clone(), value);
            }
        }
    } else {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                point.x = x;
                point.y = y;
                var value = this.buffer.get(point);
                point.x = height - 1 - y;
                point.y = width - 1 - x;
                tempBuffer.set(point.clone(), value);
            }
        }
    }
    // swap the buffers
    temp = this.buffer;
    this.buffer = tempBuffer;
    tempBuffer = temp;
    temp = this.bufferSize;
    this.bufferSize = tempBufferSize;
    tempBufferSize = temp;
};

Viewport.prototype.focus = function focus() {
    this.attention.take(this);
    this.isFocused = true;
    this.animator.requestDraw();
};

Viewport.prototype.blur = function blur() {
    this.isFocused = false;
    this.animator.requestDraw();
};
