"use strict";

var FastMap = require("collections/fast-map");
var Point2 = require("ndim/point2");

// shared temporary variable
var point = new Point2();

module.exports = Area;
function Area(size, position, tiles, view) {
    this.size = size || new Point2();
    this.position = position || new Point2();
    this.tiles = tiles || new FastMap();
    this.view = view;
}

Area.prototype.get = function (offset) {
    point.copyFrom(this.position).addThis(offset);
    return this.tiles.get(point);
};

Area.prototype.forEach = function (callback, thisp) {
    var width = this.size.x;
    var height = this.size.y;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            point.x = this.position.x + x;
            point.y = this.position.y + y;
            callback.call(thisp, this.tiles.get(point), x, y);
        }
    }
};

Area.prototype.fill = function (value) {
    this.forEach(function (tile) {
        tile.value = value;
        this.view.handleTileChange(tile.point);
    }, this);
};

Area.prototype.dig = function (value) {
    this.forEach(function (tile) {
        tile.value = 0;
        this.view.handleTileChange(tile.point);
    }, this);
};

Area.prototype.flip = function () {
    this.forEach(function (tile) {
        tile.value = +!tile.value;
        this.view.handleTileChange(tile.point);
    }, this);
};

Area.prototype.subThis = function (that) {
    this.forEach(function (tile, x, y) {
        point.x = x % that.size.x;
        point.y = y % that.size.y;
        if (that.get(point)) {
            tile.value = false;
            this.view.handleTileChange(tile.point);
        }
    }, this);
};

Area.prototype.addThis = function (that) {
};

Area.prototype.transpose = function () {
};

Area.prototype.flipTranspose = function () {
};

Area.prototype.flipHorizontal = function () {
};

Area.prototype.flipVertical = function () {
};
