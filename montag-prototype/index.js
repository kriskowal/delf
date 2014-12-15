
var Scope = require("montag/scope");
var Slot = require("montag/slot");
var ComponentManager = require("montag/component-manager");
var Analyzer = require("montag/analyzer");

var App = require("./browser.tag");

// set up a scope
var scope = new Scope();
scope.document = document;
scope.componentManager = new ComponentManager(scope);
scope.analyzer = new Analyzer(scope);

// empties the DOM and prepares a slot for the root component
// TODO somehow, defer this to the first draw
var target = document.body;
target.innerHTML = "";
var top = document.createTextNode("");
var bottom = document.createTextNode("");
target.appendChild(top);
target.appendChild(bottom);
var slot = new Slot(top, bottom);

var demo = new App(null, scope, slot);
scope.addComponent(demo);

