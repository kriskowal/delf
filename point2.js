
var Point = require("./point");

module.exports = Point2;
function Point2(x, y) {
    this.x = x | 0;
    this.y = y | 0;
}

Point2.zero = new Point2();

Point2.prototype = Object.create(Point.prototype);
Point2.prototype.constructor = Point2;

Point2.prototype.add = function (that) {
    return this.clone().addThis(that);
};

Point2.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    return this;
};

Point2.prototype.sub = function (that) {
    return this.clone().addThis(that);
};

Point2.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    return this;
};

Point2.prototype.mul = function (n) {
    return this.clone().mulThis(n);
};

Point2.prototype.mulThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
};

Point2.prototype.div = function (n) {
    return this.clone().divThis(n);
};

Point2.prototype.divThis = function (n) {
    this.x = this.x / n | 0;
    this.y = this.y / n | 0;
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

