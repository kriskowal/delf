
module.exports = Point;
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.add = function (that) {
    return new Point(this.x + that.x, this.y + that.y);
};

Point.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
};

Point.prototype.sub = function (that) {
    return new Point(this.x - that.x, this.y - that.y);
};

Point.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
};

Point.prototype.div = function (n) {
    return new Point(this.x / n, this.y / n);
};

Point.prototype.divThis = function (n) {
    this.x = this.x / n;
    this.y = this.y / n;
};

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
};

Point.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
};

Point.prototype.hash = function () {
    return this.x + "," + this.y;
};

Point.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y;
};

