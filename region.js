
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

Region.prototype.divThis = function (n) {
    this.position.divThis(n);
    this.size.divThis(n);
    return this;
};

Region.prototype.equals = function (that) {
    return this.position.equals(that.position) && this.size.equals(that.size);
};
