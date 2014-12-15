
var measures = require('./measures');

setInterval(function () {
    var now = Date.now() / 1000 * 49 * 49;
    console.log(measures.nowname(now), measures.state(now));
}, 1000);

