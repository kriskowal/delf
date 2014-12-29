
var Q = require("q");

function Renderer() {
    this.immediateHandle = null;
    var self = this;
    this.deferred = Q.defer();
    this.boundHandleImmediate = function () {
        self.handleImmediate();
    };
}

Renderer.prototype.wait = function () {
    if (!this.immdiateHandle) {
        this.immediateHandle = requestAnimationFrame(this.boundHandleImmediate);
    }
    return this.deferred.promise;
};

Renderer.prototype.handleImmediate = function () {
    this.immediateHandle = null;
    this.deferred.resolve();
    this.deferred = Q.defer();
};

module.exports = new Renderer();

