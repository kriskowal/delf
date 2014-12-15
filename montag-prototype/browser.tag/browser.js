
var Component = require("montag/component");
var entities = require("../entities.json");

module.exports = Component.specialize({

    constructor: function Browser() {
        Component.apply(this, arguments);
        this.entities = entities;
        this.entity = entities.snowman;
        this.addEventListener("activate", this);
    },

    handleActivateEvent: function (event) {
        this.entity = event.sourceComponent.entity;
    },

    template: require("./browser.html")

});


