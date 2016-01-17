"use strict";

var Point2 = require("ndim/point2");
var LinearDynamicPosition = require("../lib/linear-dynamic-position");

it("initial position", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    var position = dynamics.getPosition(0);
    expect(position).toEqual(new Point2(0, 0));
});

it("duration of transit", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    var duration = dynamics.go(new Point2(300, 400), 500/1000, 0);
    expect(duration).toBe(1000);
});

it("initial position in transit", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    dynamics.go(new Point2(300, 400), 500/1000, 0);
    expect(dynamics.getPosition(0)).toEqual(new Point2(0, 0));
});

it("final position in transit", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    dynamics.go(new Point2(300, 400), 500/1000, 0);
    expect(dynamics.getPosition(1000)).toEqual(new Point2(300, 400));
});

it("medial position in transit", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    dynamics.go(new Point2(300, 400), 500/1000, 0);
    expect(dynamics.getPosition(1000/2)).toEqual(new Point2(300/2, 400/2));
});

it("position long after transit", function () {
    var dynamics = new LinearDynamicPosition(null, 0);
    dynamics.go(new Point2(300, 400), 500/1000, 0);
    expect(dynamics.getPosition(2000)).toEqual(new Point2(300, 400));
});

