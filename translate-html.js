
var domenic = require("domenic");
var Program = require("./program");
var parser = new domenic.DOMParser();

module.exports = function translateHtml(text, module) {
    var name = module.display.slice(0, module.display.length - 5).split(/[#\/]/g).map(function (part) {
        part = part.replace(/[^\w\d]/g, "");
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("");
    if (!/[A-Z]/.test(name[0])) {
        name = "_" + name;
    }
    var document = parser.parseFromString(text, "text/html");
    var program = new Program();
    var config = {};
    var tags = {};
    // TODO conditionally include this declaration, and rewrite the identifier reference
    program.add("var Slot = require(\"./slot\");\n");
    module.dependencies = ["./slot"];
    configure(document.documentElement.getElementsByTagName("head")[0], program, module);
    translateBody(document.documentElement.getElementsByTagName("body")[0], program, name);
    program.add("module.exports = $THIS;\n");
    return program.digest();
};

// discovers configuration
function configure(head, program, module) {
    program.addTag("THIS", {type: "this"});
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
                        program.extends = true;
                        parent.addTag("SUPER", {type: "super"});
                    } else if (rel === "tag") {
                        var href = child.getAttribute("href");
                        var as = child.getAttribute("as").toUpperCase();
                        // TODO validate identifier
                        program.add("var $" + as + " = require" + "(" + JSON.stringify(href) + ");\n");
                        module.dependencies.push(href);
                        program.addTag(as, {type: "external"});
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

function translateBody(body, program, name) {
    program.add("var $THIS = function " + name + "(slot, scope, argument, attributes) {\n");
    if (body) {
        // TODO redact this variable header if it is not used
        program.add("var fragment = slot.document.createDocumentFragment(), parents = [], parent = slot.parent, node, top, bottom;\n");
        var child = body.firstChild;
        while (child) {
            if (child.nodeType === 1 /* domenic.Element.ELEMENT_NODE*/) {
                translateElement(child, program);
            } else if (child.nodeType === 3 /*domenic.Element.TEXT_NODE*/) {
                text = child.nodeValue;
                //text = text.trim(); // TODO discriminate significant whitespace
                if (text) {
                    program.add("parent.appendChild(document.createTextNode(" + JSON.stringify(text) + "));\n");
                }
            }
            child = child.nextSibling;
        }
        program.add("slot.parent.insertBefore(fragment, slot.bottom);\n");
    }
    if (program.extends) {
        program.add("$SUPER.call(this, slot, scope, argument, attributes);\n");
    }
    program.add("};\n");
    if (program.extends) {
        program.add("$THIS.prototype = Object.create($SUPER.prototype);\n");
    }
}

function translateElement(node, program) {
    var id = node.getAttribute("id");
    if (program.hasTag(node.tagName)) {
        program.add("bottom = document.createTextNode(\"\");\n");
        program.add("parent.appendChild(bottom);\n");
        // TODO assess whether a top comment is necessary
        program.add("var slot = new Slot(bottom.previousSibling, bottom, parent, document);\n");
        // TODO argument templates, scope
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
        program.add("component = new $" + node.tagName + "(slot, null, null, " + JSON.stringify(attys) + ");\n");
        if (id) {
            // TODO optimize for valid identifiers
            program.add("this[" + JSON.stringify(id) + "] = component;\n");
        }
    } else {
        program.add("node = document.createElement(" + JSON.stringify(node.tagName) + ");\n");
        if (id) {
            // TODO optimize for valid identifiers
            program.add("this[" + JSON.stringify(id) + "] = node;\n");
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
        translateFragment(node, program);
        program.add("parent.appendChild(node);\n");
    }
}

function translateFragment(node, program) {
    var child = node.firstChild;
    var text;
    while (child) {
        // invariant: node is the parent node
        if (child.nodeType === 1 /*domenic.Element.ELEMENT_NODE*/) {
            program.add("parents[parents.length] = parent; parent = node;\n");
            translateElement(child, program);
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

function Program() {
    this.lines = ["\n"];
    this.tags = {};
}

Program.prototype.addTag = function (name, tag) {
    this.tags[name.toUpperCase()] = tag;
};

Program.prototype.hasTag = function (name) {
    return Object.prototype.hasOwnProperty.call(this.tags, name.toUpperCase());
};

Program.prototype.add = function (line) {
    this.lines.push(line);
};

Program.prototype.digest = function () {
    return this.lines.join("");
};

