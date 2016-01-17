'use strict';

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');

// window size and position observer that allows a delegate to react to changes
// to the window region in pixels.
module.exports = WindowRegion;

function WindowRegion(body, scope) {
    this.delegate = null;
    this.element = null;
    this.window = scope.window;
    this.window.addEventListener('resize', this);
    this.region = new Region2(new Point2(0, 0), new Point2());
    this.animator = scope.animator.add(this);
}

WindowRegion.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.element = scope.components.window;
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.bottom = '0';
        this.element.style.left = '0';
        this.element.style.right = '0';
    }
};

WindowRegion.prototype.destroy = function destroy() {
    this.window.removeEventListener('resize', this);
    if (this.delegate.destroy) {
        this.delegate.destroy();
    }
};

WindowRegion.prototype.handleEvent = function handleEvent(event) {
    this.animator.requestMeasure();
};

WindowRegion.prototype.measure = function measure() {
    var size = this.region.size;
    size.x = this.window.innerWidth;
    size.y = this.window.innerHeight;
    this.delegate.resize(this.region);
};
