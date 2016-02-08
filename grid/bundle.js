global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["animator.js","blick","animator.js",{"raf":19},function (require, exports, module, __filename, __dirname){

// blick/animator.js
// -----------------

"use strict";

var defaultRequestAnimation = require("raf");

module.exports = Animator;

function Animator(requestAnimation) {
    var self = this;
    self._requestAnimation = requestAnimation || defaultRequestAnimation;
    self.controllers = [];
    // This thunk is doomed to deoptimization for multiple reasons, but passes
    // off as quickly as possible to the unrolled animation loop.
    self._animate = function () {
        try {
            self.animate(Date.now());
        } catch (error) {
            self.requestAnimation();
            throw error;
        }
    };
}

Animator.prototype.requestAnimation = function () {
    if (!this.requested) {
        this._requestAnimation(this._animate);
    }
    this.requested = true;
};

Animator.prototype.animate = function (now) {
    var node, temp;

    this.requested = false;

    // Measure
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.measure) {
            controller.component.measure(now);
            controller.measure = false;
        }
    }

    // Transition
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        // Unlke others, skipped if draw or redraw are scheduled and left on
        // the schedule for the next animation frame.
        if (controller.transition) {
            if (!controller.draw && !controller.redraw) {
                controller.component.transition(now);
                controller.transition = false;
            } else {
                this.requestAnimation();
            }
        }
    }

    // Animate
    // If any components have animation set, continue animation.
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.animate) {
            controller.component.animate(now);
            this.requestAnimation();
            // Unlike others, not reset implicitly.
        }
    }

    // Draw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.draw) {
            controller.component.draw(now);
            controller.draw = false;
        }
    }

    // Redraw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.redraw) {
            controller.component.redraw(now);
            controller.redraw = false;
        }
    }
};

Animator.prototype.add = function (component) {
    var controller = new AnimationController(component, this);
    this.controllers.push(controller);
    return controller;
};

function AnimationController(component, controller) {
    this.component = component;
    this.controller = controller;

    this.measure = false;
    this.transition = false;
    this.animate = false;
    this.draw = false;
    this.redraw = false;
}

AnimationController.prototype.destroy = function () {
};

AnimationController.prototype.requestMeasure = function () {
    if (!this.component.measure) {
        throw new Error("Can't requestMeasure because component does not implement measure");
    }
    this.measure = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelMeasure = function () {
    this.measure = false;
};

AnimationController.prototype.requestTransition = function () {
    if (!this.component.transition) {
        throw new Error("Can't requestTransition because component does not implement transition");
    }
    this.transition = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelTransition = function () {
    this.transition = false;
};

AnimationController.prototype.requestAnimation = function () {
    if (!this.component.animate) {
        throw new Error("Can't requestAnimation because component does not implement animate");
    }
    this.animate = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelAnimation = function () {
    this.animate = false;
};

AnimationController.prototype.requestDraw = function () {
    if (!this.component.draw) {
        throw new Error("Can't requestDraw because component does not implement draw");
    }
    this.draw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelDraw = function () {
    this.draw = false;
};

AnimationController.prototype.requestRedraw = function () {
    if (!this.component.redraw) {
        throw new Error("Can't requestRedraw because component does not implement redraw");
    }
    this.redraw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelRedraw = function () {
    this.redraw = false;
};

}],["essays/grid/index.js","delf/essays/grid","index.js",{"gutentag/document":9,"gutentag/scope":10,"blick":0,"../../lib/attention":4,"./root.html":2,"../../lib/timers":8,"ndim/point2":15,"ndim/region2":17},function (require, exports, module, __filename, __dirname){

// delf/essays/grid/index.js
// -------------------------

'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var Attention = require('../../lib/attention');
var Root = require('./root.html');
var timers = require('../../lib/timers');

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');

function main() {
    var scope = new Scope();
    var document = new Document(window.document.body);
    scope.window = window;
    scope.timers = timers;
    scope.animator = new Animator();
    scope.attention = new Attention();
    var root = new Root(document.documentElement, scope);
    var region = new Region2(Point2.zero, new Point2(window.innerWidth, window.innerHeight));
    root.resize(region);
}

main();

}],["essays/grid/root.html","delf/essays/grid","root.html",{"./root.js":3,"gutentag/text.html":11,"../../lib/grid.html":6},function (require, exports, module, __filename, __dirname){

// delf/essays/grid/root.html
// --------------------------

"use strict";
var $SUPER = require("./root.js");
var $TEXT = require("gutentag/text.html");
var $GRID = require("../../lib/grid.html");
var $THIS = function DelfEssaysGridRoot(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("origin", component);
    if (component.setAttribute) {
        component.setAttribute("id", "origin_kfqrzm");
    }
    if (scope.componentsFor["origin"]) {
       scope.componentsFor["origin"].setAttribute("for", "origin_kfqrzm")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "origin");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("grid", component);
        if (component.setAttribute) {
            component.setAttribute("id", "grid_gfla4p");
        }
        if (scope.componentsFor["grid"]) {
           scope.componentsFor["grid"].setAttribute("for", "grid_gfla4p")
        }
        if (component.setAttribute) {
        component.setAttribute("class", "grid");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "grid1box");
            }
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // GRID
                    node = {tagName: "grid"};
                    node.component = $THIS$0;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "grid";
                    component = new $GRID(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("grid", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "grid_n02fki");
                }
                if (scope.componentsFor["grid"]) {
                   scope.componentsFor["grid"].setAttribute("for", "grid_n02fki")
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "grid2box");
            }
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // GRID
                    node = {tagName: "grid"};
                    node.component = $THIS$1;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "grid2";
                    component = new $GRID(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("grid2", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "grid2_g2jwpu");
                }
                if (scope.componentsFor["grid2"]) {
                   scope.componentsFor["grid2"].setAttribute("for", "grid2_g2jwpu")
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function DelfEssaysGridRoot$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // TEXT
        node = {tagName: "text"};
        node.innerText = "";
        callee = scope.nest();
        callee.argument = node;
        callee.id = "coord";
        component = new $TEXT(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("coord", component);
    if (component.setAttribute) {
        component.setAttribute("id", "coord_bzox0f");
    }
    if (scope.componentsFor["coord"]) {
       scope.componentsFor["coord"].setAttribute("for", "coord_bzox0f")
    }
};
var $THIS$1 = function DelfEssaysGridRoot$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // TEXT
        node = {tagName: "text"};
        node.innerText = "";
        callee = scope.nest();
        callee.argument = node;
        callee.id = "coord";
        component = new $TEXT(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("coord", component);
    if (component.setAttribute) {
        component.setAttribute("id", "coord_kftez9");
    }
    if (scope.componentsFor["coord"]) {
       scope.componentsFor["coord"].setAttribute("for", "coord_kftez9")
    }
};

}],["essays/grid/root.js","delf/essays/grid","root.js",{"ndim/point2":15,"ndim/region2":17,"../../lib/drag":5},function (require, exports, module, __filename, __dirname){

// delf/essays/grid/root.js
// ------------------------

'use strict';

var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var Drag = require('../../lib/drag');

module.exports = Root;

function Root(body, scope) {
    this.grid = null;
    this.grid2 = null;
    this.animator = scope.animator.add(this);
    this.position = new Point2(0, 0);
    this.frame = new Region2(new Point2(), new Point2());
}

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    }
};

Root.prototype.hookupThis = function hookupThis(scope) {
    this.grid = scope.components.grid;
    this.grid2 = scope.components.grid2;
    this.grid.tileSize.x = 64;
    this.grid.tileSize.y = 64;
    this.origin = scope.components.origin;
    this.animator.requestDraw();
    this.window = scope.window;
    this.originElement = scope.components.origin;
    this.drag = new Drag(this.window, this.window, this);
};

Root.prototype.handleTileChange = function handleTileChange(tile) {
    // TODO
};

Root.prototype.draw = function draw() {
    this.originElement.style.left = this.position.x + 'px';
    this.originElement.style.top = this.position.y + 'px';
    this.grid.reframe(this.frame);
    this.grid2.reframe(this.frame);
};

Root.prototype.handleDrag = function handleDragStart(drag, event) {
    this.position.addThis(drag.change);
    this.animator.requestDraw();
    this.frame.position.copyFrom(this.position).scaleThis(-1);
    this.grid.reframe(this.frame);
    this.grid2.reframe(this.frame);
};

Root.prototype.resize = function resize(region) {
    this.frame.become(region);
    this.frame.position.copyFrom(this.position);
    this.animator.requestDraw();
};

}],["lib/attention.js","delf/lib","attention.js",{},function (require, exports, module, __filename, __dirname){

// delf/lib/attention.js
// ---------------------

"use strict";

module.exports = Attention;

function Attention() {
    this.component = null;
}

Attention.prototype.take = function (component) {
    if (this.component && this.component.blur) {
        this.component.blur();
    }
    this.component = component;
};

}],["lib/drag.js","delf/lib","drag.js",{"ndim/point2":15},function (require, exports, module, __filename, __dirname){

// delf/lib/drag.js
// ----------------

'use strict';

var Point2 = require('ndim/point2');

module.exports = Drag;

function Drag(element, window, delegate) {
    this.element = element;
    this.window = window;
    this.delegate = delegate;
    this.isDown = false;
    this.position = new Point2(0, 0);
    this.previous = new Point2(0, 0);
    this.start = new Point2(0, 0);
    this.stop = new Point2(0, 0);
    this.change = new Point2(0, 0);

    element.addEventListener('mousedown', this);
}

Drag.prototype.destroy = function destroy() {
    this.element.removeEventListener('mousedown', this);
    this.window.removeEventListener('mousemove', this);
    this.window.removeEventListener('mouseup', this);
};

Drag.prototype.handleEvent = function handleEvent(event) {
    if (event.type === 'mousedown') {
        return this.handleMouseDown(event);
    } else if (event.type === 'mouseup') {
        return this.handleMouseUp(event);
    } else if (event.type == 'mousemove') {
        return this.handleMouseMove(event);
    }
};

Drag.prototype.handleMouseDown = function handleMouseDown(event) {
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.start.copyFrom(this.position);
    this.previous.copyFrom(this.position);

    this.window.addEventListener('mousemove', this);
    this.window.addEventListener('mouseup', this);
    event.stopPropagation();
    event.preventDefault();
    if (this.delegate.handleDragStart) {
        this.delegate.handleDragStart(this, event);
    }
};

Drag.prototype.handleMouseMove = function handleMouseMove(event) {
    if (event.buttons & 1 === 0) {
        // TODO drag cancel / revert
        this.handleMouseUp(event);
        return;
    }
    // force mouse up if the mouse is up (not necessarily observed)
    this.previous.copyFrom(this.position);
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.change.copyFrom(this.position).subThis(this.previous);
    if (this.delegate.handleDrag) {
        this.delegate.handleDrag(this, event);
    }
};

Drag.prototype.handleMouseUp = function handleMouseUp(event) {
    this.position.x = event.pageX;
    this.position.y = event.pageY;
    this.stop.copyFrom(this.position);
    this.window.removeEventListener('mousemove', this);
    this.window.removeEventListener('mouseup', this);
    if (this.delegate.handleDragStop) {
        this.delegate.handleDragStop(this, event);
    }
};

}],["lib/grid.html","delf/lib","grid.html",{"./grid":7},function (require, exports, module, __filename, __dirname){

// delf/lib/grid.html
// ------------------

"use strict";
module.exports = (require)("./grid");

}],["lib/grid.js","delf/lib","grid.js",{"ndim/point2":15,"ndim/region2":17},function (require, exports, module, __filename, __dirname){

// delf/lib/grid.js
// ----------------

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

}],["lib/timers.js","delf/lib","timers.js",{},function (require, exports, module, __filename, __dirname){

// delf/lib/timers.js
// ------------------

'use strict';
exports.now = Date.now;
exports.setTimeout = setTimeout;
exports.clearTimeout = clearTimeout;

}],["document.js","gutentag","document.js",{"koerper":13},function (require, exports, module, __filename, __dirname){

// gutentag/document.js
// --------------------

"use strict";
module.exports = require("koerper");

}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["text.html","gutentag","text.html",{"./text":12},function (require, exports, module, __filename, __dirname){

// gutentag/text.html
// ------------------

"use strict";
module.exports = (require)("./text");

}],["text.js","gutentag","text.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/text.js
// ----------------

"use strict";

module.exports = Text;
function Text(body, scope) {
    var node = body.ownerDocument.createTextNode("");
    body.appendChild(node);
    this.node = node;
    this.defaultText = scope.argument.innerText;
    this._value = null;
}

Object.defineProperty(Text.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        this._value = value;
        if (value == null) {
            this.node.data = this.defaultText;
        } else {
            this.node.data = "" + value;
        }
    }
});

}],["koerper.js","koerper","koerper.js",{"wizdom":20},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["point.js","ndim","point.js",{},function (require, exports, module, __filename, __dirname){

// ndim/point.js
// -------------

"use strict";

module.exports = Point;
function Point() {
}

Point.prototype.add = function (that) {
    return this.clone().addThis(that);
};

Point.prototype.sub = function (that) {
    return this.clone().addThis(that);
};

// not dot or cross, just elementwise multiplication
Point.prototype.mul = function (that) {
    return this.clone().mulThis(that);
};

Point.prototype.div = function (that) {
    return this.clone().divThis(that);
};

Point.prototype.scale = function (n) {
    return this.clone().scaleThis(n);
};

Point.prototype.bitwiseAnd = function (n) {
    return this.clone().bitwiseAndThis(n);
};

Point.prototype.bitwiseOr = function (n) {
    return this.clone().bitwiseOrThis(n);
};

Point.prototype.round = function () {
    return this.clone().roundThis();
};

Point.prototype.floor = function () {
    return this.clone().floorThis();
};

Point.prototype.ceil = function () {
    return this.clone().ceilThis();
};

Point.prototype.abs = function () {
    return this.clone().absThis();
};

Point.prototype.min = function () {
    return this.clone().minThis();
};

Point.prototype.max = function () {
    return this.clone().maxThis();
};

}],["point2.js","ndim","point2.js",{"./point":14},function (require, exports, module, __filename, __dirname){

// ndim/point2.js
// --------------

"use strict";

var Point = require("./point");

module.exports = Point2;
function Point2(x, y) {
    this.x = x;
    this.y = y;
}

Point2.prototype = Object.create(Point.prototype);
Point2.prototype.constructor = Point2;

Point2.zero = new Point2(0, 0);
Point2.one = new Point2(1, 1);

Point2.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    return this;
};

Point2.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    return this;
};

Point2.prototype.mulThis = function (that) {
    this.x = this.x * that.x;
    this.y = this.y * that.y;
    return this;
};

Point2.prototype.divThis = function (that) {
    this.x = this.x / that.x;
    this.y = this.y / that.y;
    return this;
};

Point2.prototype.scaleThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
};

Point2.prototype.bitwiseAndThis = function (n) {
    this.x = this.x & n;
    this.y = this.y & n;
    return this;
};

Point2.prototype.bitwiseOrThis = function (n) {
    this.x = this.x | n;
    this.y = this.y | n;
    return this;
};

Point2.prototype.dot = function (that) {
    return this.x * that.x + this.y * that.y;
};

Point2.prototype.roundThis = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point2.prototype.floorThis = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Point2.prototype.ceilThis = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

Point2.prototype.absThis = function () {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
};

Point2.prototype.minThis = function (that) {
    this.x = Math.min(this.x, that.x);
    this.y = Math.min(this.y, that.y);
};

Point2.prototype.maxThis = function (that) {
    this.x = Math.max(this.x, that.x);
    this.y = Math.max(this.y, that.y);
};

Point2.prototype.transpose = function () {
    return this.clone().transposeThis();
};

Point2.prototype.transposeThis = function () {
    var temp = this.x;
    this.x = this.y;
    this.y = temp;
    return this;
};

Point2.prototype.distance = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point2.prototype.clone = function () {
    return new Point2(this.x, this.y);
};

Point2.prototype.copyFrom = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

// TODO deprecated for copyFrom
Point2.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

Point2.prototype.toString = function () {
    return "[x=" + this.x + " y=" + this.y + "]";
};

Point2.prototype.hash = function () {
    return this.x + "," + this.y;
};

Point2.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y;
};

Point2.prototype.lessThan = function (that) {
    return this.x < that.x && this.y < that.y;
};

}],["region.js","ndim","region.js",{},function (require, exports, module, __filename, __dirname){

// ndim/region.js
// --------------

"use strict";

module.exports = Region;
function Region(position, size) {
    this.position = position;
    this.size = size;
}

Region.prototype.copyFrom = function (that) {
    this.position.copyFrom(that.position);
    this.size.copyFrom(that.size);
    return this;
};

// TODO deprecated for copyFrom
Region.prototype.become = function (that) {
    this.position.become(that.position);
    this.size.become(that.size);
    return this;
};

Region.prototype.scaleThis = function (n) {
    this.position.scaleThis(n);
    this.size.scaleThis(n);
    return this;
};

Region.prototype.scale = function (n) {
    return this.clone().scaleThis(n);
};

Region.prototype.roundThis = function () {
    this.temp1.become(this.position).addThis(this.size).roundThis();
    this.position.roundThis();
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.round = function (n) {
    return this.clone().roundThis(n);
};

Region.prototype.roundInwardThis = function () {
    this.temp1.become(this.position).addThis(this.size).floorThis();
    this.position.ceilThis().minThis(this.temp1);
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.roundInward = function (n) {
    return this.clone().roundInwardThis(n);
};

Region.prototype.roundOutwardThis = function () {
    this.temp1.become(this.position).addThis(this.size).ceilThis();
    this.position.floorThis();
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.roundOutward = function (n) {
    return this.clone().roundOutwardThis(n);
};

Region.prototype.annex = function (that) {
    return this.clone().annexThis(that);
};

Region.prototype.annexThis = function (that) {
    this.temp1.become(this.position).addThis(this.size);
    this.temp2.become(that.position).addThis(that.size);
    this.position.minThis(that.position);
    this.temp1.maxThis(this.temp2);
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.equals = function (that) {
    return that && this.position.equals(that.position) && this.size.equals(that.size);
};

Region.prototype.toString = function () {
    return "[position:" + this.position.toString() + " size:" + this.size.toString() + "]";
};

}],["region2.js","ndim","region2.js",{"./region":16,"./point2":15},function (require, exports, module, __filename, __dirname){

// ndim/region2.js
// ---------------

"use strict";

var Region = require("./region");
var Point2 = require("./point2");

module.exports = Region2;
function Region2() {
    Region.apply(this, arguments);
}

Region2.prototype = Object.create(Region.prototype);
Region2.prototype.constructor = Region2;
Region2.prototype.temp1 = new Point2();
Region2.prototype.temp2 = new Point2();

Region2.prototype.contains = function (that) {
    return (
        this.position.x <= that.position.x &&
        this.position.x + this.size.x >= that.position.x + that.size.x &&
        this.position.y <= that.position.y &&
        this.position.y + this.size.y >= that.position.y + that.size.y
    );
};

Region2.prototype.clone = function () {
    return new Region2(this.position.clone(), this.size.clone());
};


}],["lib/performance-now.js","performance-now/lib","performance-now.js",{},function (require, exports, module, __filename, __dirname){

// performance-now/lib/performance-now.js
// --------------------------------------

// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}],["index.js","raf","index.js",{"performance-now":18},function (require, exports, module, __filename, __dirname){

// raf/index.js
// ------------

var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("delf/essays/grid/index.js")
