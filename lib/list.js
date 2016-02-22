"use strict";

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = List;

function List(body, scope) {
    this.navigator = null;
    this.entriesComponent = null;
    this.listElement = null;
    this.activeIndex = null;
    this.activeIteration = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.attention = scope.attention;
    this.hasFocus = false;
}

Object.defineProperty(List.prototype, "entries", {
    set: function set(entries) {
        this.entriesComponent.value = entries;
    },
    get: function get() {
        return this.entriesComponent.value;
    }
});

List.prototype.hookup = function hookup(id, component, scope) {
    if (id === "this") {
        this.entriesComponent = scope.components.entries;
        this.listElement = scope.components.list;
    } else if (id === "entries:iteration") {
        scope.components.entry.addEventListener("click", this);
        scope.components.entry.component = component;
    }
};

List.prototype.handleEvent = function handleEvent(event) {
    if (event.type === "click") {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.component) {
            this.activateIteration(event.target.component);
            return this.navigator.navigate(event.target.component.value);
        }
    }
};

List.prototype.handleEscape = function handleEscape(event) {
    if (this.activeIteration) {
        this.activeIteration.scope.components.entry.classList.remove("activeEntry");
    }
};

List.prototype.handleEnter = function handleEnter(event) {
    if (this.activeIteration) {
        this.navigator.navigate(this.activeIteration.value);
    }
};

List.prototype.handleRight = function handleRight(event) {
    this.handleEnter(event);
};

List.prototype.activateIteration = function activateIteration(iteration) {
    if (!iteration) {
        throw new Error("Can't activate null iteration");
    }
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    var entry = iteration.scope.components.entry;
    entry.classList.add("activeEntry");
    this.activeIteration = iteration;
    this.navigator.activate(this.activeIteration.value);
};

List.prototype.deactivateIteration = function deactivateIteration(iteration) {
    this.navigator.deactivate(iteration.value);
    var entry = iteration.scope.components.entry;
    entry.classList.remove("activeEntry");
    this.activeIteration = null;
};

List.prototype.handleDown = function handleDown(event) {
    var iterations = this.entriesComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index + 1) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.handleUp = function handleUp(event) {
    var iterations = this.entriesComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index - 1 + iterations.length) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.scrollIntoView = function scollIntoView() {
    this.listElement.scrollIntoView();
};

List.prototype.focus = function focus() {
    if (this.hasFocus) {
        return;
    }
    this.hasFocus = true;
    // this.attention.take(this);
    // this.directionEventTranslator.focus();
    var iterations = this.entriesComponent.iterations;
    if (this.activeIteration) {
        this.activeIteration.scope.components.entry.classList.add("activeEntry");
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.blur = function blur() {
    if (!this.hasFocus) {
        return;
    }
    this.hasFocus = false;
    // this.directionEventTranslator.blur();
    if (this.activeIteration) {
        this.activeIteration.scope.components.entry.classList.remove("activeEntry");
    }
};
