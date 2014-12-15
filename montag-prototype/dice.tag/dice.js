
var Component = require("montag/component");
var parser = require("./dice-parser");

module.exports = Component.specialize({

    constructor: function Dice() {
        Component.apply(this, arguments);
    },

    template: require("./dice.html"),

    roll: function () {
        this.dice.forEach(function (die, index) {
            die.roll((index + 1) * 100);
        });
    },

    parseDiceExpression: function (expression) {
        var result = parser.parse(expression);
        return result;
    },

    sidesToType: {
        6: "die",
        2: "coin"
    }

});

