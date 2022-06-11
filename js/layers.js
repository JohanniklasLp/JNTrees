addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13)).times(player['t'].points.add(1))
        if (hasUpgrade('t', 11)) mult = mult.times(2)
        if (hasUpgrade('t', 12)) mult = mult.times(upgradeEffect('t', 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Test Upgrade 1",
            description: "Double your point gain.",
            cost: function() {return Math.max(0,new Decimal(2).subtract(player['t'].points))},
        },
        12: {
            title: "Test Upgrade 2",
            description: "Increases your point gain based on your prestige points.",
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {return Math.max(0,new Decimal(4).subtract(player['t'].points))},
        },
        13: {
            title: "Test Upgrade 3",
            description: "Increases your prestige point gain based on your points.",
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {return Math.max(0,new Decimal(8).subtract(player['t'].points))},
        },
        32: {
            title: "Inflation",
            description: function() {
                if (hasUpgrade('r', 11)) return "Gives you an additional 100 points per second. Not affected by multipliers."
                else if (hasUpgrade('p', 32) && player['r'].points > 0) return "I told you!"
                else if (player['r'].points > 0) return "Don't klick this, it will just disable point gain again"
                else if (hasUpgrade('p', 32)) return "GOTCHA! This upgrade actually disables point gain"
                else return "For test purposes only. Gives you an additional 100 points per second."
            }
        }
    }
})

addLayer("t", {
    name: "testige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    canBuyMax: function() {return hasUpgrade('r', 22)},
    color: "#FF004B",
    effectDescription() {
        return " decreasing the prestige upgrade cost by " + format(player['t'].points) + "</b> (minimum of 0) and multiplying their effect by " + format(player['t'].points.add(1))
    },
    requires: new Decimal(10),
    resource: "testige points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player['p'].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('t', 13)) mult = mult.divide(upgradeEffect('t', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for testige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Pest Upgrade 1",
            description: "Double your prestige point gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Pest Upgrade 2",
            description: "Increases your prestige point gain based on your testige points.",
            effect() {
                return player[this.layer].points.add(2).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: new Decimal(3),
        },
        13: {
            title: "Pest Upgrade 3",
            description: "Decreases the testige point cost based on your prestige points.",
            effect() {
                return player['p'].points.add(1).pow(0.15) //player["t"].points.add(1).pow(0.15)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            cost: new Decimal(5),
        },
        22: {
            title: "Current Endgame",
            description: "This upgrade will give you the endgame screen",
            cost: new Decimal(10),
        }
    }
})

    addLayer("r", {
        name: "reset", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: function() {if (player['r'].points > 0||hasUpgrade('r', 11)) return "R"
                            else return "RIP"}, // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
            points: new Decimal(0),
        }},
        color: "#FF0000",
        requires: new Decimal(0),//player[this.layer].points,//.add(1).mult(25), // Can be a function that takes requirement increases into account
        resource: "free layer 1 resets", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        layerShown(){return hasUpgrade('p', 32)||player['r'].points > 0||hasUpgrade('r', 11)},
        upgrades: {
            11: {
                title: "I'm sorry",
                description: function() {
                    if (!hasUpgrade('r', 11)) return "Disables the current effect of the inflation upgrade and makes it actually give you 100 points per second instead."
                    else return "If you want to disable the inflation effect, this layer and the testige layer still reset the whole first layer."
                }, 
                cost: new Decimal(1)
            },
            12: {
                unlocked() {
                    return player['r'].points > 24 || hasUpgrade('r', 12)
                },
                title: "Clicker",
                description: function() {
                    if (hasUpgrade('r', 12)) return "Achievement: You got sidetracked by a clicker-minigame"
                    if(player['r'].points < 100) return "Do you really need 25 resets or did you just want this to turn this into a clicker?"
                    else if (player['r'].points < 900) return "Appearently you do, so feel free to continue while I keep increasing the price of this upgrade"
                    else if (player['r'].points < 1000) return "You know what? I am getting tired of this. This upgrade does nothing anyways, so I'll just give it to you once you reach 1000 resets"
                    else return "Here you go, the useless upgrade is yours"
                },
                cost: function() { 
                    if(hasUpgrade('r', 12)) return new Decimal(1000)
                    else return Math.min(1000,Math.max(100,player['r'].points.add(1))) 
                }
            }
        }
})
