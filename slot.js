"use strict";

module.exports = Slot;
function Slot(bottom) {
    this.bottom = bottom;
    this.top = null;
    this.document = bottom.ownerDocument;
}

Slot.fromElement = function (element) {
    var document = element.ownerDocument;
    element.innerHTML = "";
    var bottom = document.createTextNode("");
    element.appendChild(bottom);
    return new Slot(bottom);
};

Slot.prototype.insert = function (body) {
    if (this.top) {
        throw new Error("Can't fill slot that has already been occupied");
    }
    if (!this.bottom) {
        throw new Error("Can't fill a slot that has been destroyed");
    }
    var parent = this.bottom.parentNode;
    if (!parent) {
        throw new Error("Can't fill a slot thas is not parented on the document");
    }
    var at = body.firstChild;
    var next;
    this.top = at;
    while (at) {
        next = at.nextSibling;
        parent.insertBefore(at, this.bottom);
        at = next;
    }
};

Slot.prototype.extract = function (body) {
    if (!this.top) {
        throw new Error("Cannot retract from an already empty slot");
    }
    var parent = this.bottom.parentNode;
    var at = this.top;
    var next;
    while (at !== this.bottom) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parent.removeChild(at);
        }
        at = next;
    }
    this.top = null;
};

Slot.prototype.destroy = function () {
    if (this.top) {
        this.extract();
    }
    var parent = this.bottom.parentNode;
    parent.removeChild(this.bottom);
    this.bottom = null;
};

