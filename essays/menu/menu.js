
var keyboard = require("./keyboard");
var Repeat = require(".../../gutentag/repeat");
var Absolute = require("../../gutentag/absolute");
var Region2 = require("ndim/region2");
var Point2 = require("ndim/point2");

module.exports = Menu;

function Menu(slot, scope, Body, attributes) {
    var body = scope.document.createElement("body");
    var handElement = scope.document.createElement("div");

    handElement.className = "hand";
    handElement.innerText = "☞";
    handElement.style.fontSize = attributes.size + "px";
    body.appendChild(handElement);

    var optionsBottom = scope.document.createTextNode("");
    body.appendChild(optionsBottom);
    var optionsSlot = new slot.constructor(optionsBottom);

    this.selectedIndex = 0;
    this.options = attributes.options;
    this.size = +attributes.size;
    this.handElement = handElement;

    this.absoluteHand = new Absolute(handElement);
    var optionsScope = scope.nest(this.options);
    optionsScope.size = this.size;
    this.repetition = new Repeat(optionsSlot, optionsScope, MenuOption);
    this.repetition.values = this.options;
    optionsSlot.insert(this.repetition.body);

    this.body = body;

    this.handRegion = new Region2(new Point2(), new Point2(this.size, this.size));
    this.optionsRegion = new Region2(new Point2(), new Point2());

    this.keyboardHandle = null;

    this.scope = scope;
}

Object.defineProperty(Menu.prototype, "selection", {
    get: function () {
        return this.options[this.selectedIndex];
    }
});

Menu.prototype.redraw = function (region) {
    this.handRegion.position.become(region.position);
    this.handRegion.position.y = this.size * this.selectedIndex;
    this.absoluteHand.redraw(this.handRegion);
    this.optionsRegion.position.x = this.size;
    this.optionsRegion.position.y = 0;
    this.optionsRegion.size.x = region.size.x - this.size;
    this.optionsRegion.size.y = region.size.y;
    this.repetition.redraw(this.optionsRegion);
};

Menu.prototype.focus = function () {
    this.keyboardHandle = keyboard.capture(this);
};

Menu.prototype.blur = function () {
    this.keyboardHandle.release();
};

Menu.prototype.handleKeypress = function (key, keyCode, event) {
    if (key === "j") {
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
        this.scope.redraw();
    } else if (key === "k") {
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.scope.redraw();
    } else if (keyCode === 13) {
        this.scope.submit();
    }
};

function MenuOption(slot, scope) {
    this.size = scope.size;
    this.index = scope.index;
    this.body = scope.document.createElement("body");
    var element = scope.document.createElement("div");
    this.element = element;
    element.innerText = scope.value;
    element.className = 'option';
    element.style.fontSize = this.size + 'px';
    this.body.appendChild(element);
    this.absolute = new Absolute(element);
    this.region = new Region2(new Point2(), new Point2());
}

MenuOption.prototype.redraw = function (region) {
    this.region.become(region);
    this.region.size.y = this.size;
    this.region.position.y = this.size * this.index;
    this.absolute.redraw(this.region);
};

