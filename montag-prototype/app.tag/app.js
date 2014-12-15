
var Component = require("montag/component");

module.exports = Component.specialize({
    constructor: function App() {
        Component.apply(this, arguments);
    },
    template: require("./app.html"),
    handleButtonPressEvent: function () {
        this.dice.roll();
    }
});

