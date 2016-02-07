'use strict';

var Point2 = require('ndim/point2');
var temp = new Point2();

module.exports = Storage;

function Storage(location, options) {
    this.fusion = new Fusion(location, options);
    this.model = this.fusion('delf_worlds');
    this.model.subscribe(this);
}

Storage.prototype.onAdded = function onAdded(record) {
    temp.x = record.x;
    temp.y = record.y;
    var tile = view.viewport.tiles.get(temp);
    if (record.value !== tile.value) {
        tile.value = record.value;
        view.viewport.animator.requestDraw();
    }
};

Storage.prototype.onRemoved = function onRemoved(record) {
    temp.x = record.x;
    temp.y = record.y;
    var tile = view.viewport.tiles.get(temp);
    tile.value = 0;
    view.viewport.animator.requestDraw();
};

Storage.prototype.update = function update(point, value) {
    if (value) {
        this.model.upsert({
            id: point.x + ',' + point.y,
            x: point.x,
            y: point.y,
            value: value
        });
    } else {
        this.model.remove({
            id: point.x + ',' + point.y
        });
    }
    view.viewport.animator.requestDraw();
};

Storage.prototype.onChanged = function onChanged(delta) {
    temp.x = delta.new_val.x;
    temp.y = delta.new_val.y;
    var tile = view.viewport.tiles.get(temp);
    tile.value = delta.new_val.value;
    view.viewport.animator.requestDraw();
};

Storage.prototype.onConnected = function onConnected() {
    console.log('connected');
};

Storage.prototype.onDisconnected = function onDisconnected() {
    console.log('disconnected');
};

Storage.prototype.onError = function onError(err) {
    console.log('error', err);
};
