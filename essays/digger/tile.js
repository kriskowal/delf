"use strict";

var Point2 = require("ndim/point2");

module.exports = Tile;
function Tile(point) {
    this.point = new Point2();
    this.point.become(point);
    this.value = 0;
}
