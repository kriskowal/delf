
var Point = require("./point");

module.exports = Point2;
function Point2(x, y) {
    this.x = x | 0;
    this.y = y | 0;
}

Point2.zero = new Point2();
Point2.one = new Point2(1, 1);

Point2.prototype = Object.create(Point.prototype);
Point2.prototype.constructor = Point2;

Point2.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    return this;
};

Point2.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    return this;
};

Point2.prototype.mulThis = function (that) {
    this.x = this.x * that.x;
    this.y = this.y * that.y;
    return this;
};

Point2.prototype.scaleThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
};

Point2.prototype.roundThis = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point2.prototype.floorThis = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Point2.prototype.ceilThis = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

Point2.prototype.transpose = function () {
    return this.clone().transposeThis();
};

Point2.prototype.transposeThis = function () {
    var temp = this.x;
    this.x = this.y;
    this.y = temp;
    return this;
};

Point2.prototype.clone = function () {
    return new Point2(this.x, this.y);
};

Point2.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

Point2.prototype.hash = function () {
    return this.x + "," + this.y;
};

Point2.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y;
};

