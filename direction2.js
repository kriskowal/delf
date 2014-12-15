
var Point2 = require('ndim/point2');

module.exports = Direction2;
function Direction2(compassName, towardEdgeName, vector) {
    this.compassName = compassName;
    this.towardEdgeName = towardEdgeName;
    this.vector = vector;
    this.fromVector = vector.clone().scaleThis(-1);
}

Direction2.north = new Direction2('north', 'top', new Point2(0, -1));
Direction2.west = new Direction2('west', 'left', new Point2(-1, 0));
Direction2.east = new Direction2('east', 'right', new Point2(1, 0));
Direction2.south = new Direction2('south', 'bottom', new Point2(0, 1));

