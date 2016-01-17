'use strict';

require('setimmediate');

// decorates an element such that calling redraw initiates an attempt to adjust
// the font-size of the content until it fills the given region.
module.exports = Inflatable;
function Inflatable(element, component) {
    var self = this;
    this.element = element;
    this.component = component;
    this.refinements = null;
    this.min = null;
    this.size = 1;
    this.max = null;
    this.handle = null;
    this.boundDisturb = function () { self.disturb(); };
    this.boundRefine = function () { self.refine(); };
    this.boundSettle = function () { self.settle(); };
    this.boundGrow = function () { self.grow(); };
}

Inflatable.prototype.maxRefinements = 20;

Inflatable.prototype.redraw = function () {
    clearImmediate(this.handle);
    this.handle = setImmediate(this.boundDisturb);
};

Inflatable.prototype.disturb = function () {
    var element = this.element;
    //element.style.visibility = 'hidden';
    this.refinements = 0;
    this.min = 1;
    this.max = Infinity;
    clearImmediate(this.handle);
    this.grow();
};

Inflatable.prototype.settle = function () {
    var element = this.element;
    //element.style.visibility = 'visible';
};

Inflatable.prototype.grow = function () {
    if (this.refinements++ > this.maxRefinements) {
        this.settle();
        return;
    }
    var element = this.element;
    if (element.scrollHeight <= element.clientHeight) {
        this.min = this.size;
        this.size *= 2;
        this.adjustFontSize();
        this.handle = setImmediate(this.boundGrow);
    } else {
        this.max = this.size;
        this.refine();
    }
};

Inflatable.prototype.refine = function () {
    if (this.refinements++ > this.maxRefinements) {
        return;
    }
    var element = this.element;
    if (element.scrollHeight <= element.clientHeight) {
        this.size = Math.ceil((this.size + this.max) / 2);
        this.min = this.size;
        this.adjustFontSize();
        if (this.size < this.max) {
            this.handle = setImmediate(this.boundRefine);
        } else {
            this.handle = setImmediate(this.boundSettle);
        }
    } else {
        this.size = Math.floor((this.min + this.size) / 2);
        this.max = this.size;
        this.adjustFontSize();
        if (this.size > this.min) {
            this.handle = setImmediate(this.boundRefine);
        } else {
            this.handle = setImmediate(this.boundSettle);
        }
    }
};

Inflatable.prototype.adjustFontSize = function () {
    if (this.component) {
        if (!this.component.adjustFontSize) {
            throw new Error("Can't adjust the font size for a component that does not implement adjustFontSize. Either implement the method or do not give such component as argument to Inflatable");
        }
        this.component.adjustFontSize(this.size);
    }
    var element = this.element;
    element.style.fontSize = this.size + 'px';
};
