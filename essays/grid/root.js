'use strict';

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var Drag = require('../../lib/drag');

module.exports = Root;

function Root(body, scope) {
    this.grid = null;
    this.grid2 = null;
    this.animator = scope.animator.add(this);
    this.position = new Point2(0, 0);
    this.frame = new Region2(new Point2(), new Point2());
}

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    }
};

Root.prototype.hookupThis = function hookupThis(scope) {
    this.grid = scope.components.grid;
    this.grid2 = scope.components.grid2;
    this.grid.tileSize.x = 64;
    this.grid.tileSize.y = 64;
    this.origin = scope.components.origin;
    this.animator.requestDraw();
    this.window = scope.window;
    this.originElement = scope.components.origin;
    this.drag = new Drag(this.window, this.window, this);
};

Root.prototype.handleTileChange = function handleTileChange(tile) {
    // TODO
};

Root.prototype.draw = function draw() {
    this.originElement.style.left = this.position.x + 'px';
    this.originElement.style.top = this.position.y + 'px';
    this.grid.reframe(this.frame);
    this.grid2.reframe(this.frame);
};

Root.prototype.handleDrag = function handleDragStart(drag, event) {
    this.position.addThis(drag.change);
    this.animator.requestDraw();
    this.frame.position.copyFrom(this.position).scaleThis(-1);
    this.grid.reframe(this.frame);
    this.grid2.reframe(this.frame);
};

Root.prototype.resize = function resize(region) {
    this.frame.become(region);
    this.frame.position.copyFrom(this.position);
    this.animator.requestDraw();
};
