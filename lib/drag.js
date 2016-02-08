'use strict';

var Point2 = require('ndim/point2');

module.exports = Drag;

function Drag(element, window, delegate) {
    this.element = element;
    this.window = window;
    this.delegate = delegate;
    this.isDown = false;
    this.position = new Point2(0, 0);
    this.previous = new Point2(0, 0);
    this.start = new Point2(0, 0);
    this.stop = new Point2(0, 0);
    this.change = new Point2(0, 0);

    element.addEventListener('mousedown', this);
}

Drag.prototype.destroy = function destroy() {
    this.element.removeEventListener('mousedown', this);
    this.window.removeEventListener('mousemove', this);
    this.window.removeEventListener('mouseup', this);
};

Drag.prototype.handleEvent = function handleEvent(event) {
    if (event.type === 'mousedown') {
        return this.handleMouseDown(event);
    } else if (event.type === 'mouseup') {
        return this.handleMouseUp(event);
    } else if (event.type == 'mousemove') {
        return this.handleMouseMove(event);
    }
};

Drag.prototype.handleMouseDown = function handleMouseDown(event) {
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.start.copyFrom(this.position);
    this.previous.copyFrom(this.position);

    this.window.addEventListener('mousemove', this);
    this.window.addEventListener('mouseup', this);
    event.stopPropagation();
    event.preventDefault();
    if (this.delegate.handleDragStart) {
        this.delegate.handleDragStart(this, event);
    }
};

Drag.prototype.handleMouseMove = function handleMouseMove(event) {
    if (event.buttons & 1 === 0) {
        // TODO drag cancel / revert
        this.handleMouseUp(event);
        return;
    }
    // force mouse up if the mouse is up (not necessarily observed)
    this.previous.copyFrom(this.position);
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.change.copyFrom(this.position).subThis(this.previous);
    if (this.delegate.handleDrag) {
        this.delegate.handleDrag(this, event);
    }
};

Drag.prototype.handleMouseUp = function handleMouseUp(event) {
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.stop.copyFrom(this.position);
    this.window.removeEventListener('mousemove', this);
    this.window.removeEventListener('mouseup', this);
    if (this.delegate.handleDragStop) {
        this.delegate.handleDragStop(this, event);
    }
};
