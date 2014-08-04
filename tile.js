"use strict";

var Point2 = require("./point2");

module.exports = Tile;
function Tile(point) {
    this.point = new Point2();
    this.point.become(point);
    this.space = false;
}

