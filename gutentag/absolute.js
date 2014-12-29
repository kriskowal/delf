
module.exports = Absolute;
function Absolute(element) {
    this.element = element;
}

Absolute.prototype.redraw = function (region) {
    this.element.style.position = 'absolute';
    this.element.style.left = region.position.x + 'px';
    this.element.style.top = region.position.y + 'px';
    this.element.style.width = region.size.x + 'px';
    this.element.style.height = region.size.y + 'px';
};

