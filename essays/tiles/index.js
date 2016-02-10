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
