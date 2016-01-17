'use strict';

module.exports = Root;

function Root(body, scope) {
    this.windowed = null;
    this.animator = scope.animator.add(this);
}

Root.prototype.focus = function focus() {
};

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        console.log('here');
        scope.components.window.delegate = this;
        scope.components.window.measure();
        this.windowed = scope.components.windowed;
    }
};

Root.prototype.resize = function resize(region) {
    this.size = region.size.toString();
    this.animator.requestDraw();
};

Root.prototype.draw = function draw() {
    this.windowed.innerText = this.size;
};
