
module.exports = Slot;
function Slot(top, bottom, parent, document) {
    this.top = top;
    this.bottom = bottom;
    this.parent = parent || top.parentNode;
    this.document = document || this.parent.ownerDocument;
    this.filled = false;
}

Slot.fromElement = function (element) {
    return new Slot(null, null, element);
};

Slot.prototype.fill = function (fragment) {
    if (this.filled) {
        throw new Error("Cannot inject over already injected fragment");
    }
    this.parent.insertBefore(fragment, this.bottom);
    this.filled = true;
};

Slot.prototype.clear = function () {
    if (!this.filled) {
        throw new Error("Cannot retract from an already empty slot");
    }
    var document = this.document;
    var fragment = document.createDocumentFragment();
    var parent = this.parent;
    var at = this.top.nextSibling;
    while (at !== this.bottom) {
        var next = at.nextSibling;
        fragment.appendChild(at);
        at = next;
    }
    this.filled = false;
    return fragment;
};

// for debugging
Slot.prototype.show = function (label) {
    if (this.top && this.bottom) {
        if (label) {
            this.top.nodeValue = "<" + label + ">";
            this.bottom.nodeValue = "</" + label + ">";
        } else {
            this.top.nodeValue = "--->";
            this.bottom.nodeValue = "<---";
        }
    }
};

Slot.prototype.hide = function () {
    if (this.top && this.bottom) {
        this.top.nodeValue = "";
        this.bottom.nodeValue = "";
    }
};

