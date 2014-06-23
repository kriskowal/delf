
var Point = require("./point");

module.exports = Point3;
function Point3(x, y, z) {
    this.x = x | 0;
    this.y = y | 0;
    this.z = z | 0;
}

Point3.prototype = Object.create(Point.prototype);
Point3.prototype.constructor = Point3;

Point3.zero = new Point3();
Point3.one = new Point3(1, 1, 1);

Point3.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    this.z = this.z + that.z;
    return this;
};

Point3.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    this.z = this.z - that.z;
    return this;
};

Point3.prototype.mulThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    this.z = this.z * n;
    return this;
};

Point3.prototype.divThis = function (n) {
    this.x = this.x / n | 0;
    this.y = this.y / n | 0;
    this.z = this.z / n | 0;
    return this;
};

Point3.prototype.clone = function () {
    return new Point3(this.x, this.y, this.z);
};

Point3.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;
    return this;
};

Point3.prototype.becomeXY = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

Point3.prototype.hash = function () {
    return this.x + "," + this.y + "," + this.z;
};

Point3.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y && this.z === that.z;
};

