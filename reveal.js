
var Slot = require("./slot");
var ObservableObject = require("collections/observable-object");

module.exports = Reveal;
function Reveal(slot, scope, Template) {
    ObservableObject.observePropertyChange(this, "value", this);
    this.body = document.createElement("body");
    var slot = Slot.fromElement(this.body);
    this.content = new Template(slot, scope);
    this.slot = slot;
}

Reveal.prototype.handleValuePropertyChange = function (value) {
    if (value) {
        this.slot.insert(this.content.body);
    } else {
        this.slot.extract(this.content.body);
    }
};

