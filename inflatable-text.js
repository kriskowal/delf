
require('setimmediate');
var Region2 = require('ndim/region2');
var Point2 = require('ndim/point2');

module.exports = InflatableText;
function InflatableText(element) {
    var self = this;
    this.element = element;
    this.refinements = null;
    this.min = null;
    this.size = 1;
    this.max = null;
    this.handle = null;
    this.region = new Region2(new Point2(), new Point2());
    this.boundDisturb = function () { self.disturb(); };
    this.boundRefine = function () { self.refine(); };
    this.boundSettle = function () { self.settle(); };
    this.boundGrow = function () { self.grow(); };
    this.disturb();
}

InflatableText.prototype.maxRefinements = 20;

InflatableText.prototype.reflow = function (region) {
    if (this.region.equals(region)) {
        return;
    }
    this.region.become(region);

    this.element.style.position = 'absolute';
    this.element.style.left = region.position.x + 'px';
    this.element.style.top = region.position.y + 'px';
    this.element.style.width = region.size.x + 'px';
    this.element.style.height = region.size.y + 'px';
    clearImmediate(this.handle);
    this.handle = setImmediate(this.boundDisturb);
};

InflatableText.prototype.disturb = function () {
    var element = this.element;
    element.style.visibility = 'hidden';
    this.refinements = 0;
    this.min = 1;
    this.max = Infinity;
    clearImmediate(this.handle);
    this.grow();
};

InflatableText.prototype.settle = function () {
    //console.log('settle', this.refinements);
    var element = this.element;
    element.style.visibility = 'visible';
};

InflatableText.prototype.grow = function () {
    if (this.refinements++ > this.maxRefinements) {
        this.settle();
        return;
    }
    var element = this.element;
    if (element.scrollHeight <= element.clientHeight) {
        this.min = this.size;
        this.size *= 2;
        this.draw();
        this.handle = setImmediate(this.boundGrow);
    } else {
        this.max = this.size;
        this.refine();
    }
};

InflatableText.prototype.refine = function () {
    if (this.refinements++ > this.maxRefinements) {
        return;
    }
    var element = this.element;
    if (element.scrollHeight <= element.clientHeight) {
        this.size = Math.ceil((this.size + this.max) / 2);
        this.min = this.size;
        this.draw();
        if (this.size < this.max) {
            this.handle = setImmediate(this.boundRefine);
        } else {
            this.handle = setImmediate(this.boundSettle);
        }
    } else {
        this.size = Math.floor((this.min + this.size) / 2);
        this.max = this.size;
        this.draw();
        if (this.size > this.min) {
            this.handle = setImmediate(this.boundRefine);
        } else {
            this.handle = setImmediate(this.boundSettle);
        }
    }
};

InflatableText.prototype.draw = function () {
    var element = this.element;
    element.style.fontSize = this.size + 'px';
    element.style.paddingTop = (this.size / 2).toFixed(0) + 'px';
    element.style.paddingBottom = (this.size / 2).toFixed(0) + 'px';
    element.style.paddingLeft = this.size + 'px';
    element.style.paddingRight = this.size + 'px';
};

