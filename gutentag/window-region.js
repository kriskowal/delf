
var Point2 = require("ndim/point2");
var Region2 = require("ndim/region2");

// window size and position observer that allows a component to react to
// changes to the window region in pixels.
module.exports = WindowRegion;
function WindowRegion(component, window) {
    this.component = component;
    this.window = window;
    this.region = new Region2(new Point2(0, 0), new Point2());
    this.window.addEventListener('resize', this);
}

WindowRegion.prototype.destroy = function () {
    this.window.removeEventListener('resize', this);
};

WindowRegion.prototype.redraw = function () {
    var size = this.region.size;
    size.x = this.window.innerWidth;
    size.y = this.window.innerHeight;
    this.component.redraw(this.region);
};

WindowRegion.prototype.handleEvent = function (event) {
    this.redraw();
};

