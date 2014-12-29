
require('setimmediate');
var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var Direction2 = require('../../direction2');
var Inflatable = require('../../inflatable');

var element = document.querySelector('#deadcenter');
var component = new Inflatable(element);
window.addEventListener('resize', handleResize);
handleResize();

function handleResize() {
    component.redraw(new Region2(
        new Point2(0, 0),
        new Point2(document.documentElement.clientWidth, document.documentElement.clientHeight)
    ));
}

function CommandHandler() {
    var self = this;
    this.mode = new RestMode(this);
    var element = component.element;
    Object.keys(this.eventHandlerNames).forEach(function (eventName) {
        element.addEventListener(eventName, self);
    });
    this.immediateHandle = null;
    this.handleEvent = function (event) { self.unboundHandleEvent(event); };
    this.handleImmediate = function () { self.unboundHandleImmediate(); };
}

CommandHandler.prototype.destroy = function () {
    Object.keys(this.eventHandlerNames).forEach(function (eventName) {
        element.removeEventListener(eventName, self);
    });
};

CommandHandler.prototype.handleCommand = function (command) {
    this.mode = this.mode.handleCommand(command) || this.mode;
};

CommandHandler.prototype.unboundHandleImmediate = function () {
    this.mode = this.mode.handleImmediate() || this.mode;
};

CommandHandler.prototype.unboundHandleEvent = function (event) {
    var eventHandlerName = this.eventHandlerNames[event.type];
    if (eventHandlerName && this.mode[eventHandlerName]) {
        this.mode = this.mode[eventHandlerName](event) || this.mode;
    }
};

CommandHandler.prototype.requestImmediate = function () {
    clearImmediate(this.immediateHandle);
    this.immediateHandle = setImmediate(this.handleImmediate);
};

CommandHandler.prototype.eventHandlerNames = {
    transitionend: 'handleTransitionEndEvent',
    webkitTransitionEnd: 'handleTransitionEndEvent',
    oTransitionEnd: 'handleTransitionEndEvent'
};

function RestMode(commandHandler) {
    this.commandHandler = commandHandler;
}

RestMode.prototype.handleCommand = function (command) {
    if (command.type === 'go') {
        var element = component.element;
        var viewportSize = new Point2(window.innerWidth, window.innerHeight);
        var vector = command.direction.toVector.mul(viewportSize);
        element.style.transition = 'none';
        element.style.transform = 'translate(' + vector.x + 'px, ' + vector.y + 'px)';
        this.commandHandler.requestImmediate();
        return new RepositioningMode(this.commandHandler);
    }
};

function RepositioningMode(commandHandler) {
    this.commandHandler = commandHandler;
}

RepositioningMode.prototype.handleCommand = function (command) {
    if (command.type === 'go') {
        return new RestMode(this.commandHandler).handleCommand(command);
    }
};

RepositioningMode.prototype.handleImmediate = function () {
    element.style.transition = 'transform 1s ease';
    element.style.transform = null;
    return new TransitioningMode(this.commandHandler);
};

function TransitioningMode(commandHandler) {
    this.commandHandler = commandHandler;
}

TransitioningMode.prototype.handleTransitionEndEvent = function () {
    return new RestMode(this.commandHandler);
};

TransitioningMode.prototype.handleCommand = function (command) {
    if (command.type === 'go') {
        return new RestMode(this.commandHandler).handleCommand(command);
    }
};

function KeyHandler(window, commandHandler) {
    var self = this;
    this.commandHandler = commandHandler;
    this.window = window;
    this.boundHandleKeyChange = function (event) {
        self.handleKeyChange(event);
    };
    window.addEventListener('keypress', this.boundHandleKeyChange);
    window.addEventListener('keyup', this.boundHandleKeyChange);
}

KeyHandler.prototype.destroy = function () {
    var window = this.window;
    window.removeEventListener('keypress', this.boundHandleKeyChange);
    window.removeEventListener('keyup', this.boundHandleKeyChange);
};

KeyHandler.prototype.handleKeyChange = function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    if (key === 'k') {
        this.commandHandler.handleCommand({
            type: 'go',
            direction: Direction2.north
        });
    } else if (key === 'j') {
        this.commandHandler.handleCommand({
            type: 'go',
            direction: Direction2.south
        });
    } else if (key === 'h') {
        this.commandHandler.handleCommand({
            type: 'go',
            direction: Direction2.west
        });
    } else if (key === 'l') {
        this.commandHandler.handleCommand({
            type: 'go',
            direction: Direction2.east
        });
    }
};

var commandHandler = new CommandHandler();
var keyHandler = new KeyHandler(window, commandHandler);

