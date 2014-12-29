'use strict';

// Water (from the fountain)
// Barrel (1 windy, or 2 loony)
// Water Barrel (3 loony, or 2 windy)
// Cured Pork (2 windy, BYOB)
// Cured Pork + Barrel (1 ven, 3 windy, or 6 loony)
// Rum (1 loony)
// Rum + Barrel ()
// Arrows (1 loony per arrow)
// Sword (take this)
// Quiver (1 ven)
// Wain (2 ven)

// Barrel of Rum + Barrel of Water -> 2 Barrels of Grog

// Cooper (Water)
// Butcher (Cured Pork)
// Fletcher (Arrows)

var strings = {
    "welcome": "The strangers of Aelfwyrd have all come by their own way, some seeking, some fleeing, but they are all destined east. With a modest purse and a taste of madness, they come here and go there, seeking freedom and fortune.",
    "introduction": "As it happens, you are in Aelfwyrd with a modest purse and a taste of madness. Here you will find provisions for your journey. Choose well, stranger, and hasten east.",
    "waystone": "There is a waystone here, ringed with the establishments of the town. There is a cooper to the north and a butcher to the south. The Aelfland gate is east."
};

function uid() {
    return (
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32) +
        (Math.random() * 32 >>> 0).toString(32)
    );
}

var machine = {
    "narrator": function (event) {
    },
    "player-welcome": function (event, agent, agents) {
    },
    "waystone": function (event, agent, agents) {
    },
    "room": function (event, room, agents) {
        var subject = agents[event.name];
        if (event.verb === "enter") {
            room.agents[event.subject] = true;
        } else if (event.verb === "exit") {
            room.agents[event.subject] = false;
        }
    }
};

function process(event) {
    for (var name in agents) {
        var agent = agents[name];
        var states = agent.states;
        for (var index = 0, length = states.length; index < length; index++) {
            var state = states[index];
            agent = JSON.parse(JSON.stringify(agent));
            agent = machine[state](event, agent, agents) || agent;
            agents[name] = agent;
        }
    }
    render();
}

function narrative(spec) {
    return {
        description: spec.description,
        handleEvent: function (event) {
            if (event.type === "keypress" && event.keyCode === 32) {
                return world[spec.go];
            } else {
                return this;
            }
        }
    };
}

function room(spec) {
    var description = [
        spec.description
    ].concat(Object.keys(spec.exits).map(function (key) {
        var exit = spec.exits[key];
        return exit.description;
    })).join(" ");
    return {
        description: description,
        handleEvent: function (event) {
            if (event.type === "keypress" && event.key in spec.exits) {
                return world[spec.exits[event.key].go];
            } else {
                return this;
            }
        }
    };
}

function shop(spec) {
    return {
        description: spec.description,
        handleEvent: function (event) {
            if (event.type === "keyup" && event.keyCode === 27) {
                return world[spec.flee];
            } else if (event.type === "keypress" && event.keyCode === 32) {
                return world[spec.flee];
            } else {
                return this;
            }
        }
    }
}

var world = {
    aelfwyrd1: narrative({
        description: "The strangers of AElfwyrd have all come by their own way, some seeking, some fleeing, but all destined east. With a modest purse and a taste of madness, they come here and go there, seeking freedom or fortune&hellip; (space)",
        go: "aelfwyrd2"
    }),
    aelfwyrd2: narrative({
        description: "As it happens, you are in AElfwyrd with a modest purse and a taste of madness. Here you will find provisions for your journey. Choose well, stranger, and hasten east&hellip; (space)",
        go: "aelfwyrd"
    }),
    aelfwyrd: room({
        description: "This is the center of the town of AElfwyrd.",
        exits: {
            c: {
                go: "cooper",
                description: "There is a cooper to the north (c)."
            },
            b: {
                go: "butcher",
                description: "There is a butcher to the south (b)."
            }
        }
    }),
    cooper: shop({
        description: "The cooper (escape)",
        flee: "aelfwyrd"
    }),
    butcher: shop({
        description: "The butcher (escape)",
        flee: "aelfwyrd"
    })
};

var mode = world.aelfwyrd1;

function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    mode = mode.handleEvent({
        type: event.type,
        key: key,
        keyCode: keyCode
    });
    render();
};

function render() {
    if (mode.describe) {
        document.body.innerHTML = mode.describe();
    } else {
        document.body.innerHTML = mode.description;
    }
}

function main() {
    // Event listeners
    window.addEventListener("resize", handleEvent);
    window.addEventListener("keydown", handleEvent);
    window.addEventListener("keyup", handleEvent);
    window.addEventListener("keypress", handleEvent);
    window.addEventListener("mousedown", handleEvent);
    window.addEventListener("mouseup", handleEvent);
    window.addEventListener("mousemove", handleEvent);
    render();
}

main();

