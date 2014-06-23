
module.exports = Point;
function Point() {
}

Point.prototype.add = function (that) {
    return this.clone().addThis(that);
};

Point.prototype.sub = function (that) {
    return this.clone().addThis(that);
};

Point.prototype.mul = function (n) {
    return this.clone().mulThis(n);
};

Point.prototype.div = function (n) {
    return this.clone().divThis(n);
};

