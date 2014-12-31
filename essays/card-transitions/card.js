"use strict";

var Q = require("q");

var Point2 = require("ndim/point2");
var Region2 = require("ndim/region2");

var renderer = require("../../gutentag/renderer");
var Transitioner = require("../../gutentag/transitioner");
var Absolute = require("../../gutentag/absolute");
var Inflatable = require("../../gutentag/inflatable");

module.exports = Card;
function Card(slot, scope) {
    var body = document.createElement("body");
    var element = document.createElement("div");
    element.className = 'content';
    element.innerText = scope.value;
    body.appendChild(element);

    this.element = element;
    this.body = body;
    this.scope = scope;
    this.inflatable = new Inflatable(element);
    this.transitioner = new Transitioner(element);
    this.absolute = new Absolute(element);
    this.region = new Region2(new Point2(), new Point2());
    this.renderer = renderer;

    this.ready = Q();

}

Card.prototype.destroy = function () {
    this.transitioner.destroy();
};

Card.prototype.redraw = function (region) {
    this.region.become(region);
    // TODO update transition in progress

    var index = this.scope.index;
    var length = this.scope.parent.value.iterations.length;

    var opacity = 1 / length;
    this.element.style.opacity = opacity;

    this.absolute.redraw(region);
    this.inflatable.redraw(region);
};

Card.prototype.tempPosition = new Point2();

Card.prototype.enter = function (fromDirection) {
    var self = this;
    this.ready = this.ready.then(function () {
        self.tempPosition.become(fromDirection);
        self.tempPosition.scaleThis(-1);
        self.tempPosition.mulThis(self.region.size);
        self.tempPosition.addThis(self.region.position);
        self.goTo(
            'translate(' + self.tempPosition.x + 'px, ' +
            self.tempPosition.y + 'px)'
        );
        return self.renderer.wait();
    }).then(function () {
        self.transitionTo(null, 'transform 1s ease');
        return self.transitioner.wait();
    });
    return this.ready;
};

Card.prototype.exit = function (toDirection) {
    var self = this;
    this.ready = this.ready.then(function () {
        self.goTo('');
        return self.renderer.wait();
    }).then(function () {
        self.tempPosition.become(self.region.size);
        self.tempPosition.mulThis(toDirection);
        self.tempPosition.addThis(self.region.position);
        self.transitionTo(
            'translate(' + self.tempPosition.x + 'px, ' +
            self.tempPosition.y + 'px)',
            'transform 1s ease'
        );
        return self.transitioner.wait();
    });
    return this.ready;
};

Card.prototype.show = function () {
    var element = this.element;
    element.style.visibility = 'visible';
    return this.renderer.wait();
};

Card.prototype.hide = function () {
    var element = this.element;
    element.style.visibility = 'hidden';
    return this.renderer.wait();
};

Card.prototype.goTo = function (transform) {
    var element = this.element;
    element.style.transition = 'none';
    element.style.transform = transform;
};

Card.prototype.transitionTo = function (transform, transition) {
    var element = this.element;
    element.style.transition = transition;
    element.style.transform = transform;
};

