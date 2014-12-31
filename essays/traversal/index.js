
var Slot = require("../../gutentag/slot");
var Scope = require("../../gutentag/scope");
var Transitioner = require("../../gutentag/transitioner");
var LinearDynamicPosition = require("../../linear-dynamic-position");
var Direction2 = require("../../direction2");
var Point2 = require("ndim/point2");

var transitioner = new Transitioner(document.body);
var dynamics = new LinearDynamicPosition();

var directions = {
    h: Direction2.west,
    j: Direction2.south,
    k: Direction2.north,
    l: Direction2.east
};

var target = new Point2().become(Point2.zero);
var vector = new Point2();
window.addEventListener("keypress", function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;

    if (directions[key]) {
        var direction = directions[key];
        console.log(direction.compassName);

        vector.become(directions[key].fromVector).scaleThis(1000);
        target.addThis(vector);
        var speed = 1/2;
        var duration = dynamics.go(target, speed);

        document.body.style.transition = (
            'background-position-x linear ' + duration.toFixed() + 'ms, ' +
            'background-position-y linear ' + duration.toFixed() + 'ms'
        );
        console.log(document.body.style.transition);
        document.body.style.backgroundPositionX = (target.x).toFixed() + 'px';
        document.body.style.backgroundPositionY = (target.y).toFixed() + 'px';

    }
});


//transitioner.wait()
//.then(function () {
//    document.body.style.backgroundImage = 'url(grass.jpg)';
//});
