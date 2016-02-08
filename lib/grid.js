'use strict';

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');

module.exports = Grid;

function Grid(body, scope) {
    var self = this;

    this.document = body.ownerDocument;
    this.body = body;
    this.scope = scope;

    this.tiles = {};
    this.freeTiles = [];
    this.dirtyTiles = {};
    this.drawFrustumHandle = null;
    this.drawFrustumLatency = 1000;
    this.timers = scope.timers;
    this.animator = scope.animator.add(this);
    this.boundDrawFrustum = drawFrustum;
    this.frame = new Region2(new Point2(), new Point2());
    this.tileSize = new Point2(256, 256);
    this.marginLength = 30;
    this.margin = new Point2(this.marginLength, this.marginLength);
    this.offset = new Point2();
    this.offset.become(Point2.zero)
        .subThis(this.margin)
        .scaleThis(.5);

    this.Tile = scope.argument.component;

    function drawFrustum() {
        self.drawFrustum();
    }
}

Grid.prototype.reframe = function reframe(frame) {
    this.frame.become(frame);
    this.animator.requestDraw();
};

Grid.prototype.draw = function draw() {
    this.drawFrustum();
    var keys = Object.keys(this.dirtyTiles);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tile = this.tiles[key];
        tile.actualNode.style.left = tile.position.x + 'px';
        tile.actualNode.style.top = tile.position.y + 'px';
        // TODO delegate.drawTile
    }
    this.dirtyTiles = {};
};

Grid.prototype.requestDrawFrustum = function requestDrawFrustum() {
    if (this.drawFrustumHandle) {
        this.timers.clearTimeout(this.drawFrustumHandle);
    }
    this.drawFrustumHandle = this.timers.setTimeout(this.boundDrawFrustum, this.drawFrustumLatency);
};

var point = new Point2();
var frustum = new Region2(new Point2(), new Point2());
Grid.prototype.drawFrustum = function drawFrustum() {
    this.drawFrustumHandle = null;

    frustum.size.copyFrom(this.frame.size)
        .divThis(this.tileSize)
        .ceilThis()
        .addThis(Point2.one);
    frustum.position.copyFrom(this.frame.position)
        .divThis(this.tileSize)
        .floorThis();

    var keys = Object.keys(this.tiles);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tile = this.tiles[key];
        tile.mark = false;
    }

    var created = 0;
    var recycled = 0;
    var reused = 0;

    var left = frustum.position.x;
    var top = frustum.position.y;
    var width = frustum.size.x;
    var height = frustum.size.y;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            point.x = left + x;
            point.y = top + y;
            key = point.hash();
            var tile = this.tiles[key];
            if (!tile) {
                if (this.freeTiles.length) {
                    tile = this.freeTiles.pop();
                    // TODO delegate.onTileUpdated
                    recycled++;
                } else {
                    tile = this.createTile();
                    // TODO delegate.onTileCreated
                    created++;
                }
                tile.point.copyFrom(point);
                tile.position.copyFrom(tile.point).mulThis(this.tileSize);
                tile.key = key;
                this.tiles[key] = tile;
                this.body.appendChild(tile.node);
                this.dirtyTiles[key] = true;
                // TODO delegate.onTileChanged
            } else {
                reused++;
            }
            // Mark the used tile to be retained
            tile.mark = true;
        }
    }

    // Collect the garbage for recycling
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var tile = this.tiles[key];
        if (!tile.mark) {
            delete this.tiles[key];
            this.body.removeChild(tile.node);
            // TODO delegate.onRemoveTile
        }
    }

    if (created || recycled) {
        this.animator.requestDraw();
    }
};

Grid.prototype.createTile = function createTile() {
    var tile = new Tile();
    tile.node = this.document.createElement('div');
    tile.actualNode = tile.node.actualNode;
    tile.actualNode.classList.add("tile");
    tile.actualNode.style.height = this.tileSize.y + 'px';
    tile.actualNode.style.width = this.tileSize.x + 'px';
    tile.actualNode.component = tile;
    tile.body = this.document.createBody();
    tile.node.appendChild(tile.body);
    tile.scope = this.scope.nestComponents();
    tile.component = new this.Tile(tile.body, tile.scope);
    tile.scope.hookup(this.scope.id + ':tile', tile);
    return tile;
};

function Tile() {
    this.point = new Point2();
    this.position = new Point2();
    this.key = null;
    this.scope = null;
    this.body = null;
    this.mark = false;
}