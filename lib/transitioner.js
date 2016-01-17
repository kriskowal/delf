'use strict';

var Q = require('q');

module.exports = Transitioner;
function Transitioner(element) {
    this.element = element;
    this.transitioned = Q.defer();
    element.addEventListener('transitionend', this);
}

Transitioner.prototype.destroy = function () {
    var element = this.element;
    element.removeEventListener('transitionend', this);
};

Transitioner.prototype.wait = function () {
    return this.transitioned.promise;
};

Transitioner.prototype.handleEvent = function (event) {
    if (event.type === 'transitionend') {
        this.transitioned.resolve();
        this.transitioned = Q.defer();
    }
};
