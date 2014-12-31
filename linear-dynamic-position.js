
var Point2 = require("ndim/point2");

module.exports = LinearDynamicPosition;
function LinearDynamicPosition(position, time) {
    position = position || Point2.zero;
    time = time === undefined ? Date.now() : time;
    this.position = new Point2().become(position);
    this.velocity = new Point2().become(Point2.zero);
    this.vector = new Point2().become(Point2.zero);
    this.source = new Point2().become(position);
    this.target = new Point2().become(position);
    this.sourceTime = time;
    this.targetTime = time;
}

LinearDynamicPosition.prototype.go = function (target, speed, time) {
    time = time === undefined ? Date.now() : time;
    var source = this.getPosition(time);
    this.source.become(source);
    this.target.become(target);
    this.vector.become(target).subThis(source);
    var distance = this.vector.distance();
    var duration = distance / speed;
    this.velocity.become(this.vector).scaleThis(1 / duration);
    this.sourceTime = time;
    this.targetTime = time + duration;
    return duration;
};

LinearDynamicPosition.prototype.getPosition = function (time) {
    time = time === undefined ? Date.now() : time;
    if (time >= this.targetTime) {
        this.position.become(this.target);
    } else if (time <= this.sourceTime) {
        this.position.become(this.source);
    } else {
        var duration = time - this.sourceTime;
        this.position.become(this.velocity)
            .scaleThis(duration)
            .addThis(this.source);
    }
    return this.position;
};

