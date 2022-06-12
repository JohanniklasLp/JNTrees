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
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13)).times(player['b'].points.divide(10).add(1))
        if (hasUpgrade('b', 11)) mult = mult.times(2)
        if (hasUpgrade('b', 12)) mult = mult.times(upgradeEffect('b', 12))
        mult = mult.times(Math.max(Math.sqrt(player['pp'].power.points) / 2,1))
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
    passiveGeneration() { return (hasUpgrade('pp',13))?upgradeEffect('pp', 13)/100:0 },
    upgrades: {
        11: {
            title: "Half the wait",
            description: "Double your point gain.",
            cost: function() {return Math.max(0,new Decimal(2).subtract(player['b'].best))},
        },
        12: {
            title: "Point boost",
            description: "Increases your point gain based on your prestige points.",
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {return Math.max(0,new Decimal(4).subtract(player['b'].best))},
        },
        13: {
            title: "Prestige point boost",
            description: "Increases your prestige point gain based on your points.",
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {return Math.max(0,new Decimal(8).subtract(player['b'].best))},
        },
        32: {
            title: "Inflation?",
            description: function() {
                if (hasUpgrade('c', 11)) return "Gives you an additional 100 points per second. Not affected by multipliers. Only works once you do a row two reset."
                else if (hasUpgrade('p', 32) && player['c'].points > 0) return "I told you!"
                else if (player['c'].points > 0) return "Don't klick this, it will just disable point gain again"
                else if (hasUpgrade('p', 32)) return "GOTCHA! This upgrade actually disables point gain."
                else return "Gives you an additional 100 points per second. Not affected by multipliers, else it would be too op for early game."
            }
        }
    }
})

addLayer("b", {
    name: "Prestige Booster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["p"],
    canBuyMax: function() {return hasUpgrade('b', 21)},
    color: "#BB004B",
    effectDescription() {
        return " decreasing the prestige upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(10).add(1))
    },
    requires: function() {
        if(player['pp'].best > 0 && player['b'].best == 0) return new Decimal(15000)
        else return new Decimal(10)
    },
    base: 2.5,
    resource: "Prestige Booster", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player['p'].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8125,
    roundUpCost: true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('b', 13)) mult = mult.divide(upgradeEffect('b', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for Prestige Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Double the gain",
            description: "Double your prestige point gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Prestige point boost",
            description: "Increases your prestige point gain based on your prestige booster.",
            effect() {
                return player[this.layer].points.add(2).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: new Decimal(3),
        },
        13: {
            title: "Summer Sale",
            description: "Decreases the prestige booster cost based on your prestige points. (minimum of 10)",
            effect() {
                return player['p'].points.add(1).pow(0.05)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            cost: new Decimal(5),
        },
        21: {
            title: "Need for Speed",
            description: "You can buy max Prestige Boosters",
            cost: new Decimal(9),
        }
    }
})

    addLayer("c", {
        name: "clicker", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: function() {
            if(hasUpgrade('c', 12)) return "C"
            else if (player['c'].points > 0||hasUpgrade('c', 11)) return "R"
            else return "RIP"}, // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
            points: new Decimal(0),
        }},
        doReset(layer){
            return
        },
        onPrestige(){
            if(hasUpgrade('c', 12)) return
            doReset("b", true)
            return
            
        },
        branches: ["p"],
        effectDescription() {
            if(hasUpgrade('c', 12)) return " which do nothing other than provide side entertainment<br>You can safely ignore this layer, nothing besides 'I'm sorry' provides any boosts.<br>But if you keep clicking, you might find a whole clicker minigame in this layer (not yet)"
            else return "which reset the Prestige Layer"
        },
        color: "#FF0000",
        requires: new Decimal(0),//player[this.layer].points,//.add(1).mult(25), // Can be a function that takes requirement increases into account
        resource:  function() {if(hasUpgrade('c', 12)) return "clicker points"
        else return "free prestige resets"}, // Name of prestige currency
        baseResource: function() {if(hasUpgrade('c', 12)) return "clicker points"
        else return "points"}, // Name of resource prestige is based on
        baseAmount() {if(hasUpgrade('c', 12)) return player['c'].points 
        else return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        layerShown(){return hasUpgrade('p', 32)||player['c'].points > 0||hasUpgrade('c', 11)},
        upgrades: {
            11: {
                title: "I'm sorry",
                description: function() {
                    return "Disables the current effect of the inflation upgrade and makes it actually give you 100 points per second instead."
                }, 
                cost: new Decimal(1)
            },
            12: {
                unlocked() {
                    return player['c'].points > 24 || hasUpgrade('c', 12)
                },
                title: "Clicker",
                description: function() {
                    if (hasUpgrade('c', 12)) return "This layer is now a clicker layer and will no longer reset the prestige layer."
                    if(player['c'].points < 100) return "Do you really need 25 resets or did you just want this to turn this into a clicker?"
                    else if (player['c'].points < 200) return "Appearently you do, so feel free to continue while I keep increasing the price of this upgrade"
                    else if (player['c'].points < 250) return "You know what? This upgrade does nothing anyways, so I'll just give it to you once you reach 250 resets"
                    else return "Here you go, the useless upgrade is yours"
                },
                cost: function() { 
                    if(hasUpgrade('c', 12) || player['c'].points >= 200) return new Decimal(250)
                    else return Math.min(250,Math.max(100,player['c'].points.add(1))) 
                }
            },
        }
})

addLayer("pp", {
    name: "Power Plant", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: {
            points: decimalZero,
            best: decimalZero,
            total: decimalZero,
        }
    }},
    update(diff) {
        if (player.pp.unlocked) player.pp.power.points = player.pp.power.points.add(player['pp'].best.times(diff)).min(player['pp'].best.times(250).times(1 + upgradeEffect('pp', 11) / 100))
    },
    branches: ["p"],
    canBuyMax: function() {return hasUpgrade('pp', 21)},
    color: "#FF9B00",
    effectDescription() {
        let mul = upgradeEffect('pp', 11) / 100 + 1
        return " which are generating " + format(player['pp'].best) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(1 + upgradeEffect('pp', 11) / 100)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 0.5)
    },
    requires: function() {
        if(player['b'].best > 0 && player['pp'].best == 0) return new Decimal(15000)
        else return new Decimal(10)
    },
    base: 2.5,
    resource: "Power Plants", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player['p'].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8125,
    roundUpCost: true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('pp', 12)) mult = mult.divide(upgradeEffect('pp', 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Reset for Power Plant", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Accumulator",
            description: "Prestige Points boost maximum power capacity",
            effect() {
                return Math.pow(player['p'].points,0.25)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) + "%" }, // Add formatting to the effect
            cost: new Decimal(1),
        },
        12: {
            title: "Self-Sufficient",
            description: "Power decreases the power plant cost (minimum of 10)",
            effect() {
                return (Math.sqrt(player.pp.power.points) / 100 + 1)
                //return player['pp'].points.add(1).pow(0.05)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            cost: new Decimal(3),
        },
        13: {
            title: "Generator",
            description: "You automatically get prestige points based on your power (maximum 100%)",
            effect() {
                return Math.min(100,Math.max(1,Math.sqrt(player.pp.power.points) / 10))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "%/s" }, // Add formatting to the effect
            cost: new Decimal(5),
        },
        21: {
            title: "Tesla",
            description: "You can buy max Power Plants",
            cost: new Decimal(9),
        }
    }
})