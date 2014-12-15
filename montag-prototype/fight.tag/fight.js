
var Component = require("montag/component");

module.exports = Component.specialize({

    constructor: function Fight() {
        Component.apply(this, arguments);
    },

    template: require("./fight.html")

});


