'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var Root = require('./root.html');

function main() {
    var scope = new Scope();
    var document = new Document(window.document.body);
    scope.window = window;
    scope.animator = new Animator();
    var root = new Root(document.documentElement, scope);
    console.log('root', root);
    root.focus();
}

main();
