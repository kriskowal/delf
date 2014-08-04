"use strict";

var Q = require("q");
var domenic = require("domenic");
var parser = new domenic.DOMParser();

module.exports = function translateHtml(text, module) {
    var displayName = module.display.slice(0, module.display.length - 5).split(/[#\/]/g).map(function (part) {
        part = part.replace(/[^\w\d]/g, "");
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("");
    if (!/[A-Z]/.test(displayName[0])) {
        displayName = "_" + displayName;
    }
    var document = parser.parseFromString(text, "text/html");
    var program = new Program();
    var template = new Template();
    module.dependencies = [];
    analyzeDocument(document, program, template, module);
    return translateDocument(document, program, template, module, "THIS", displayName);
};

function analyzeDocument(document, program, template, module) {
    var child = document.documentElement.firstChild;
    while (child) {
        if (child.nodeType === 1 /* ELEMENT_NODE */) {
            if (child.tagName === "HEAD") {
                analyzeHead(child, program, template, module);
            }
        }
        child = child.nextSibling;
    }
}

function analyzeHead(head, program, template, module) {
    template.addTag("THIS", {type: "this"});
    if (head) {
        var child = head.firstChild;
        while (child) {
            // TODO constants do not exist in minidom
            if (child.nodeType === 1 /* ELEMENT_NODE */) {
                if (child.tagName === "LINK") {
                    var rel = child.getAttribute("rel");
                    if (rel === "extends") {
                        var href = child.getAttribute("href");
                        program.add("var $SUPER = require" + "(" + JSON.stringify(href) + ");\n");
                        module.dependencies.push(href);
                        template.extends = true;
                        template.addTag("SUPER", {type: "super"});
                    } else if (rel === "tag") {
                        var href = child.getAttribute("href");
                        var as = child.getAttribute("as").toUpperCase();
                        // TODO validate identifier
                        program.add("var $" + as + " = require" + "(" + JSON.stringify(href) + ");\n");
                        module.dependencies.push(href);
                        template.addTag(as, {type: "external", id: href});
                    }
                    // ...
                } else if (child.tagName === "META") {
                    if (child.getAttribute("parameter")) {
                        module.parameterMode = child.getAttribute("parameter");
                    }
                    // ...
                }
            }
            child = child.nextSibling;
        }
    }
}

function translateDocument(document, program, template, module, name, displayName) {
    // TODO conditionally include this declaration, and rewrite the identifier reference
    program.add("var Slot = require(\"./slot\");\n");
    program.add("var Scope = require(\"./scope\");\n");
    module.dependencies.push("./slot", "./scope");
    var child = document.documentElement.firstChild;
    while (child) {
        if (child.nodeType === 1 /* ELEMENT_NODE */) {
            if (child.tagName === "BODY") {
                translateBody(child, program, template, name, displayName);
            }
        }
        child = child.nextSibling;
    }
    program.add("module.exports = $THIS;\n");
    return program.digest();
}

function translateBody(body, program, template, name, displayName) {
    program.add("var $" + name + " = function " + displayName + "(slot, argumentScope, argumentTemplate, attributes) {\n");
    program.add("var scope = this.scope = argumentScope.root.nest(this);\n");
    if (body) {
        translateSegment(body, program, template, name, displayName);
    }
    if (template.extends) {
        program.add("$SUPER.apply(this, arguments);\n");
    }
    program.add("};\n");
    if (template.extends) {
        program.add("$THIS.prototype = Object.create($SUPER.prototype);\n");
    }
}

function translateArgument(node, program, template, name, displayName) {
    program.add("var $" + name + " = function " + displayName + "(slot, scope, fallback, attributes) {\n");
    translateSegment(node, program, template, name, displayName);
    program.add("};\n");
}

function translateSegment(node, program, template, name, displayName) {
    // TODO redact this variable header if it is not used
    program.add("this.body = document.createElement(\"BODY\");\n");
    program.add("var parent = this.body, parents = [], node, top, bottom;\n");
    var child = node.firstChild;
    while (child) {
        if (child.nodeType === 1 /* domenic.Element.ELEMENT_NODE*/) {
            translateElement(child, program, template, name, displayName);
        } else if (child.nodeType === 3 /*domenic.Element.TEXT_NODE*/) {
            var text = child.nodeValue;
            //text = text.trim(); // TODO discriminate significant whitespace
            if (text) {
                program.add("parent.appendChild(document.createTextNode(" + JSON.stringify(text) + "));\n");
            }
        }
        child = child.nextSibling;
    }
}

function translateElement(node, program, template, name, displayName) {
    var id = node.getAttribute("id");
    if (template.hasTag(node.tagName)) {
        program.add("bottom = document.createTextNode(\"\");\n");
        program.add("parent.appendChild(bottom);\n");
        // TODO assess whether a top comment is necessary
        program.add("var childSlot = new Slot(bottom);\n");
        // TODO argument templates, argumentScope
        // template:
        var argumentProgram = new Program();
        var argumentSuffix = "$" + (template.nextArgumentIndex++);
        var argumentName = name + argumentSuffix;
        var argumentDisplayName = displayName + argumentSuffix;
        translateArgument(node, argumentProgram, template, argumentName, argumentDisplayName);
        program.addProgram(argumentProgram);
        // TODO append to master program, give a name
        // attributes:
        var attys = {};
        for (var attribute, key, value, index = 0, attributes = node.attributes, length = attributes.length; index < length; index++) {
            attribute = attributes.item(index);
            key = attribute.nodeName;
            value = attribute.value || node.nodeValue;
            if (key === "id") {
                continue;
            }
            attys[key] = value;
        }
        // TODO determine and create an appropriate argument scope
        program.add("component = new $" + node.tagName + "(childSlot, scope, $" + argumentName + ", " + JSON.stringify(attys) + ");\n");
        program.add("childSlot.insert(component.body);\n");
        if (id) {
            // TODO optimize for valid identifiers
            program.add("scope.value[" + JSON.stringify(id) + "] = component;\n");
        }
    } else {
        program.add("node = document.createElement(" + JSON.stringify(node.tagName) + ");\n");
        if (id) {
            // TODO optimize for valid identifiers
            program.add("scope.value[" + JSON.stringify(id) + "] = node;\n");
        }
        for (var attribute, key, value, index = 0, attributes = node.attributes, length = attributes.length; index < length; index++) {
            attribute = attributes.item(index);
            key = attribute.nodeName;
            value = attribute.value || node.nodeValue;
            if (key === "id") {
                continue;
            }
            program.add("node.setAttribute(" + JSON.stringify(key) + ", " + JSON.stringify(value) + ");\n");
        }
        translateFragment(node, program, template, name, displayName);
        program.add("parent.appendChild(node);\n");
    }
}

function translateFragment(node, program, template, name, displayName) {
    var child = node.firstChild;
    var text;
    while (child) {
        // invariant: node is the parent node
        if (child.nodeType === 1 /*domenic.Element.ELEMENT_NODE*/) {
            program.add("parents[parents.length] = parent; parent = node;\n");
            translateElement(child, program, template, name, displayName);
            program.add("node = parent; parent = parents[parents.length - 1]; parents.length--;\n");
        } else if (child.nodeType === 3 /*domenic.Element.TEXT_NODE*/) {
            text = child.nodeValue;
            //text = text.trim();
            if (text) {
                program.add("node.appendChild(document.createTextNode(" + JSON.stringify(text) + "));\n");
            }
        }
        child = child.nextSibling;
    }
}

function Template() {
    this.tagsIndex = {};
    this.tagsArray = [];
    this.nextArgumentIndex = 0;
}

Template.prototype.addTag = function (name, tag) {
    tag.name = name;
    this.tagsIndex[name.toUpperCase()] = tag;
    this.tagsArray.push(tag);
};

Template.prototype.hasTag = function (name) {
    return Object.prototype.hasOwnProperty.call(this.tagsIndex, name.toUpperCase());
};

function Program() {
    this.lines = ["\n"];
    this.programs = [];
}

Program.prototype.addProgram = function (program) {
    this.programs.push(program);
};

Program.prototype.add = function (line) {
    this.lines.push(line);
};

Program.prototype.collect = function (lines) {
    lines.push.apply(lines, this.lines);
    this.programs.forEach(function (program) {
        program.collect(lines);
    });
};

Program.prototype.digest = function () {
    var lines = [];
    this.collect(lines);
    return lines.join("");
};

