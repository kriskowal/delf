'use strict';

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var Drag = require('../../lib/drag');

module.exports = Root;

function Root(body, scope) {
    this.tiles = null;
    this.tiles2 = null;
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
    this.tiles = scope.components.tiles;
    this.tiles2 = scope.components.tiles2;
    this.tiles.tileSize.x = 64;
    this.tiles.tileSize.y = 64;
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
    this.tiles.reframe(this.frame);
    this.tiles2.reframe(this.frame);
};

Root.prototype.handleDrag = function handleDragStart(drag, event) {
    this.position.addThis(drag.change);
    this.animator.requestDraw();
    this.frame.position.copyFrom(this.position).scaleThis(-1);
    this.tiles.reframe(this.frame);
    this.tiles2.reframe(this.frame);
};

Root.prototype.resize = function resize(region) {
    this.frame.become(region);
    this.frame.position.copyFrom(this.position);
    this.animator.requestDraw();
};
