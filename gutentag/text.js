"use strict";

module.exports = Text;
function Text(slot, template) {
    this.node = slot.bottom;
}

Object.defineProperty(Text.prototype, "value", {
    get: function () {
        this.node.innerText;
    },
    set: function (value) {
        this.node.nodeValue = value;
    }
});

