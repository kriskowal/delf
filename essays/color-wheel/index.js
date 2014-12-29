"use strict";

var Slot = require("../../slot");
var Scope = require("../../scope");

var Point2 = require("ndim/point2");
var Region2 = require("ndim/region2");

var Repeat = require("../../repeat");
var WindowRegion = require("../../window-region");
var Absolute = require("../../absolute");

var tileSize = new Point2(100, 100);
var halfTileSize = tileSize.scale(.5);

var ratio = Math.tan(Math.asin(.5));
var rotia = Math.tan(Math.acos(.5)) * .5;

function ColorCell(slot, scope) {
    var body = scope.document.createElement("body");
    var element = scope.document.createElement("div");
    body.appendChild(element);
    element.className = 'cell';
    element.innerText = scope.value.x + ',' + scope.value.y;
    this.body = body;
    this.element = element;
    this.absolute = new Absolute(element);
    this.position = scope.value;
    this.center = scope.center;
    this.scope = scope;
}

var tempRegion = new Region2(new Point2(), new Point2());
ColorCell.prototype.redraw = function (region) {
    tempRegion.size.become(tileSize);
    tempRegion.position.become(tileSize);
    tempRegion.position.mulThis(this.position);
    tempRegion.position.y *= rotia; //0.860;
    tempRegion.position.x = tempRegion.position.x + tempRegion.position.y * ratio;
    tempRegion.position.subThis(halfTileSize);
    tempRegion.position.addThis(region.position);

    var y = this.position.y * rotia;
    var x = this.position.x + this.position.y * ratio;
    var angle = Math.atan2(y, x);
    var distance = Math.sqrt(x * x + y * y);
    var lightness = (3 - distance) / 3;
    var hue = angle / Math.PI / 2 * 360;
    var lightness = .5;
    var saturation = distance / 3 / 2;
    var backgroundColor = (
        'hsl(' + hue.toFixed() + ', ' +
        (saturation * 100).toFixed() + '%, ' +
        (lightness * 100).toFixed() + '%)'
    );
    this.element.style.backgroundColor = backgroundColor;
    console.log(this.position + '', hue, backgroundColor, this.element.style.backgroundColor);

    this.absolute.redraw(tempRegion);
};

ColorCell.prototype.rotate = function () {
    this.element.style.transform = 'rotate(' + (-this.scope.angle) + 'rad)';
};

function ColorNavigator(slot, scope, ColorCell, attributes) {
    this.center = new Point2();
    scope.center = this.center;

    var body = scope.document.createElement("body");
    var originElement = scope.document.createElement("div");
    originElement.className = "origin";
    originElement.innerText = "0,0";
    body.appendChild(originElement);
    slot.insert(body);

    this.originRegion = new Region2(new Point2(), new Point2());
    this.absoluteOrigin = new Absolute(originElement);

    this.originElement = originElement;
    this.scope = scope;

    var originSlot = Slot.fromElement(originElement);

    this.repetition = new Repeat(originSlot, scope, ColorCell);
    this.values = this.repetition.values;

    var radius = 4;
    for (var y = 1 - radius; y < radius; y++) {
        for (var x = 1 - radius; x < radius; x++) {
            if (Math.abs(x + y) < radius) {
                this.values.push(new Point2(x, y));
            }
        }
    }
}

ColorNavigator.prototype.redraw = function (region) {
    this.originRegion.position.become(region.size).scaleThis(0.5);
    this.absoluteOrigin.redraw(this.originRegion);
    this.originElement.style.transform = 'rotate(' + this.scope.angle + 'rad)';
    this.repetition.redraw(region);
};

ColorNavigator.prototype.rotate = function (angle) {
    this.scope.angle = angle;
    this.repetition.iterations.forEach(function (iteration) {
        iteration.rotate();
    });
};


var slot = Slot.fromElement(document.body);
var scope = new Scope();
scope.document = document;
scope.window = window;

var root = new ColorNavigator(slot, scope, ColorCell);
var windowRegion = new WindowRegion(root, window);
windowRegion.redraw();


var angle = 0;
window.addEventListener("keypress", function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    if (key === "j") {
        angle -= Math.PI / 3;
    } else if (key === "k") {
        angle += Math.PI / 3;
    }
    root.rotate(angle);
    windowRegion.redraw();
});

