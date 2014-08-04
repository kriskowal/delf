"use strict";

var FastMap = require("collections/fast-map");
var Point2 = require("./point2");

// shared temporary variable
var point = new Point2();

module.exports = Area;
function Area(size, position, tiles, tileViews) {
    this.size = size || new Point2();
    this.position = position || new Point2();
    this.tiles = tiles || new FastMap();
    this.tileViews = tileViews;
}

Area.prototype.get = function (offset) {
    point.become(this.position).addThis(offset);
    return this.tiles.get(point);
};

Area.prototype.touch = function (offset) {
    point.become(this.position).addThis(offset);
    this.tileViews.get(point).draw();
};

Area.prototype.sliceThis = function (position, size) {
    return new Area(size, this.position.add(position), this.tiles, this.tileViews);
};

Area.prototype.forEach = function (callback, thisp) {
    var width = this.size.x;
    var height = this.size.y;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            point.x = this.position.x + x;
            point.y = this.position.y + y;
            var tileView = this.tileViews && this.tileViews.get(point);
            callback.call(thisp, this.tiles.get(point), x, y);
            if (tileView) {
                tileView.draw();
            }
        }
    }
};

Area.prototype.fill = function () {
    this.forEach(function (tile) {
        tile.space = false;
    });
};

Area.prototype.dig = function () {
    this.forEach(function (tile) {
        tile.space = true;
    });
};

Area.prototype.flip = function () {
    this.forEach(function (tile) {
        tile.space = !tile.space;
    });
};

Area.prototype.subThis = function (that) {
    this.forEach(function (tile, x, y) {
        point.x = x % that.size.x;
        point.y = y % that.size.y;
        if (that.get(point)) {
            tile.space = false;
        }
    });
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

