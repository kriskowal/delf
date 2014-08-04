"use strict";

var Slot = require("./slot");
var ObservableObject = require("collections/observable-object");
require("collections/observable-array");

module.exports = Repetition;
function Repetition(slot, argumentScope, argumentTemplate, attributes) {
    this.slot = slot;
    this.iterations = [];
    this.Iteration = argumentTemplate;
    this._values = [];
    this._values.observeRangeChange(this, "values");
    this.body = document.createElement("body");
    this.scope = argumentScope.root.nest(this);
}

Object.defineProperty(Repetition.prototype, "values", {
    get: function () {
        return this._values;
    },
    set: function (values) {
        this._values.swap(0, this._values.length, values);
    }
});

Repetition.prototype.handleValuesRangeChange = function (plus, minus, index) {

    this.iterations.slice(index, index + minus.length).forEach(function (iteration, offset) {
        iteration.slot.destroy();
        iteration.value = null;
        iteration.index = null;
        iteration.slot = null;
    }, this);

    var beyond;
    if (index + 1 < this.iterations.length) {
        beyond = this.iterations[index + 1].slot.bottom;
    } else {
        beyond = this.slot.bottom;
    }

    this.iterations.swap(index, minus.length, plus.map(function (value, offset) {
        var bottom = document.createTextNode("");
        this.slot.bottom.parentNode.insertBefore(bottom, beyond);
        var slot = new Slot(bottom);
        var iteration = new this.Iteration(slot, this.scope);
        slot.insert(iteration.body);
        iteration.value = value;
        iteration.slot = slot;
        return iteration;
    }, this));

    this.updateIndexes(index);

};

Repetition.prototype.updateIndexes = function (index) {
    for (var length = this.iterations.length; index < length; index++) {
        this.iterations[index].index = index;
    }
};

