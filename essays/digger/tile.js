"use strict";

var Point2 = require("ndim/point2");

module.exports = Tile;
function Tile(point) {
    this.point = new Point2();
    this.point.become(point);
    this._value = 0;
    this.delegate = null;
}

Object.defineProperty(Tile.prototype, "value", {
    get: function get() {
         return this._value;
    },
    set: function set(value) {
        this._value = value;
        this.delegate.update(this.point, value);
    }
});

