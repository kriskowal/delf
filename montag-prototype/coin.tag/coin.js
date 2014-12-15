
var Component = require("montag/component");

module.exports = Component.specialize({

    constructor: function Coin() {
        Component.apply(this, arguments);
        this.flipper = this.scope.componentByLabel.get("flipper").element;
    },

    template: require("./coin.html"),

    flip: function flip(ms, nextValue) {
        var self = this;
        if (nextValue == undefined) {
            this.nextValue = +(Math.random() < .5);
        } else {
            this.nextValue = +Boolean(nextValue);
        }
        this.value = null;
        this.needsDraw = true;
        this.needsRedraw = true;
        this.timeoutHandle = setTimeout(function () {
            self.value = self.nextValue;
            self.timeoutHandle = null;
        }, ms);
        this.period = ms;
    },

    // for duck-compatibility with dice
    roll: function (ms, nextValue) {
        this.flip(ms, nextValue);
    },

    draw: function () {
        var flipper = this.flipper;
        var wobble = (Math.random() * 90 - 45).toFixed(0);
        var flip = 500 + (this.nextValue ? 0 : 180);
        flipper.style.webkitTransition = "";
        flipper.style.webkitTransform = "rotateX(" + flip + "deg)";
        flipper.classList.add("coin-flipped");
    },

    redraw: function () {
        var flipper = this.flipper;
        flipper.style.webkitTransition = "-webkit-transform " + this.period + "ms linear";
        var flip = this.nextValue ? 0 : 180;
        flipper.style.webkitTransform = "rotateX(" + flip + "deg)";
        flipper.classList.remove("coin-flipped");
    },

    destruct: function () {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

});

