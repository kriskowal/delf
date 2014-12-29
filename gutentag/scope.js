"use strict";

module.exports = Scope;
function Scope(value) {
    this.root = this;
    this.value = value;
}

Scope.prototype.nest = function (value) {
    var child = Object.create(this);
    child.value = value;
    child.parent = this;
    return child;
};

