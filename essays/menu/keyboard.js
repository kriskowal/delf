
function Keyboard() {
    this.target = null;
    window.addEventListener("keypress", this);
}

Keyboard.prototype.destruct = function () {
    window.removeEventListener("keypress", this);
};

Keyboard.prototype.handleEvent = function (event) {
    if (this.target) {
        var key = event.key || String.fromCharCode(event.charCode);
        var keyCode = event.keyCode || event.charCode;
        this.target.handleKeypress(key, keyCode, event);
    }
};

Keyboard.prototype.capture = function (component) {
    if (this.target) {
        throw new Error("Can't capture keyboard. " + this.target + " must release");
    }
    this.target = component;
    this.handler = new KeyboardHandle(this, component);
    return this.handler;
};

function KeyboardHandle(keyboard) {
    this.keyboard = keyboard;
}

KeyboardHandle.prototype.release = function () {
    if (this.keyboard.handler !== this) {
        throw new Error("Can't release keyboard again.");
    }
    this.keyboard.target = null;
};

module.exports = new Keyboard();

