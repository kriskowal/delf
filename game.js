module.exports = {
    aelfwyrd1: {
        description: "The strangers of AElfwyrd have all come by their own way, some seeking, some fleeing, but all destined east. With a modest purse and a taste of madness, they come here and go there, seeking freedom or fortune.",
        commands: {
            " ": {
                name: "Continue...",
                go: "aelfwyrd2"
            }
        }
    },
    aelfwyrd2: {
        description: "As it happens, you are in Aelfwyrd with a modest purse and a taste of madness. Here you will find provisions for your journey. Choose well, stranger, and hasten east.",
        commands: {
            " ": {
                name: "Continue...",
                go: "aelfwyrd"
            }
        }
    },
    aelfwyrd: {
        description: "This is the center of the town of AElfwyrd.",
        commands: {
            "b": "There is a cooper to the north",
            "c": "There is a butcher to the south"
        }
    },
    butcher: {
    },
    cooper: {
    }
};
