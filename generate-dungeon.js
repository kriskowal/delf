"use strict";

var Point2 = require("dimensions/point2");

var point = new Point2();
module.exports = generateDungeon;
function generateDungeon(area, pad, entranceX, entranceWidth) {
    pad = pad || 1;
    entranceX = entranceX || Math.floor(area.size.x / 2);
    entranceWidth = entranceWidth || 1;
    var min = Math.min(area.size.x, area.size.y);
    var max = Math.max(area.size.x, area.size.y);
    var segments = Math.ceil(max / min);

    if (min >= 3) {
        var inside = area.sliceThis(new Point2(pad, pad), new Point2(area.size.x - pad * 2, area.size.y - pad * 2));
        inside.dig();
        var corridor = area.sliceThis(new Point2(entranceX, area.size.y - pad), new Point2(entranceWidth, pad));
        corridor.dig();
    }
}

function generateDungeonWithin(area) {
    area.dig();
}

