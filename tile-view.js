
var Point2 = require("./point2");

module.exports = TileView;
function TileView() {
    this.point = new Point2(); // map position
    this.pointPx = new Point2(); // 3d position in view in px
    this.tile = null; // model
    this.element = document.createElement("div");
    this.element.className = "tile";
    // For mark and sweep free list collection
    this.mark = null;
}

TileView.prototype.reset = function () {
};

TileView.prototype.draw = function () {
    var tile = this.tile;
    this.pointPx.become(this.point).mulThis(this.constructor.size);
    this.element.style.left = this.pointPx.x + "px";
    this.element.style.top = this.pointPx.y + "px";
    this.element.className = "tile" + (this.tile.space ? " space" : "");
};

TileView.size = 50;

