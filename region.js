"use strict";

module.exports = Region;
function Region(position, size) {
    this.position = position;
    this.size = size;
}

Region.prototype.become = function (that) {
    this.position.become(that.position);
    this.size.become(that.size);
    return this;
};

Region.prototype.mulThis = function (n) {
    this.position.mulThis(n);
    this.size.mulThis(n);
    return this;
};

Region.prototype.scaleThis = function (n) {
    this.position.scaleThis(n);
    this.size.scaleThis(n);
    return this;
};

Region.prototype.equals = function (that) {
    return this.position.equals(that.position) && this.size.equals(that.size);
};

