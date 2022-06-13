addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }
},
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
    update(diff) {
        if(hasUpgrade('p', 33)) player.p.points = player.p.points.min(new Decimal(15000000).times(upgradeEffect('p', 33)))
        else player.p.points = player.p.points.min(15000000)
    },
    softcap: function() {
        if(hasUpgrade('p', 33))
            return new Decimal(10000000).times(upgradeEffect('p', 33))
        else return new Decimal(10000000)
    },
    softcapPower: new Decimal(0.25),
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (hasUpgrade('p', 33) && player.p.points.gte(new Decimal(15000000).times(upgradeEffect('p', 33)))) return decimalZero
        else if (!hasUpgrade('p', 33) && player.p.points.gte(new Decimal(15000000))) return decimalZero
        else return new Decimal(1)
    },
    midsection: [
        ["display-text", function() {
            if(hasUpgrade('p', 33)) return "Prestige Points are softcapped at " + new Decimal(10000000).times(upgradeEffect('p', 33)).divide(10000).round().divide(100) + " Million"
            else return "Prestige Points are softcapped at " + new Decimal(10) + " Million"
        }],
        ["display-text", function() {
            if(hasUpgrade('p', 33)) return "and hardcapped at " + new Decimal(15000000).times(upgradeEffect('p', 33)).divide(10000).round().divide(100) + " Million"
            else return "and hardcapped at " + new Decimal(15) + " Million"
        }],
        "blank"
    ],
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) player.p.points = new Decimal(0);
        if (hasMilestone("cp", 0) || hasMilestone("m", 0)) keep.push("upgrades");
        if (hasMilestone("cp", 0) || hasMilestone("m", 0)) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    passiveGeneration() { return (hasUpgrade('pp',13))?upgradeEffect('pp', 13)/100:0 },
    milestones: {
        0: {requirementDescription: "5,000,000 Points",
            done() {return player.points.gte(5000000) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlock two new layers (WIP, will still give you the endgame screen)",
            unlocked() {
                return (hasUpgrade('p', 31) && hasUpgrade('p', 33)) || hasMilestone("cp", 0) || hasMilestone("m", 0)
            },
        },
    },
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
                if(hasUpgrade('p', 31)) return player[this.layer].points.add(1).pow(0.5).times(upgradeEffect('p', 31))
                else return player[this.layer].points.add(1).pow(0.5)
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
        31: {
            title: "Point Booster",
            description: "'Point boost' is stronger based on your Prestige Booster",
            unlocked() {
                return hasMilestone('b', 1)
            },
            effect() {
                return player['b'].points.pow(0.1).max(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: new Decimal(1000000),
        },
        32: {
            title: "Inflation?",
            description: function() {
                if (hasMilestone('c', 0)) return "Gives you an additional 100 points per second. Not affected by multipliers. Only works once you do a row two reset."
                else if (hasUpgrade('p', 32) && player['c'].points > 0) return "I told you!"
                else if (player['c'].points > 0) return "Don't klick this, it will just disable point gain again. Get the 'I'm sorry' Upgrade first!"
                else if (hasUpgrade('p', 32)) return "GOTCHA! This upgrade actually disables point gain."
                else return "Gives you an additional 100 points per second. Not affected by multipliers, else it would be too op for early game."
            }
        },
        33: {
            title: "Cap Booster",
            description: "Prestige Point softcap and hardcap are higher based on your Power",
            unlocked() {
                return hasMilestone('pp', 1)
            },
            effect() {
                return player.pp.power.points.add(1).pow(0.01)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: new Decimal(1000000),
            
        },
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
    canBuyMax: function() {return hasMilestone('b', 0)},
    color: "#BB004B",
    effectDescription() {
        return " decreasing the prestige row 1 upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(10).add(1))
    },
    requires: function() {
        if(player['pp'].best > 0 && !hasMilestone('b',2)) return new Decimal(15000)
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
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) player.p.points = new Decimal(0);
        if (hasMilestone("cp", 2) && layers[resettingLayer].row == 2) keep.push("upgrades");
        if (hasMilestone("cp", 1) && layers[resettingLayer].row == 2) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    milestones: {
        0: {requirementDescription: "9 Prestige Boosters",
            done() {return player[this.layer].best.gte(9) || hasMilestone("cp", 1)}, // Used to determine when to give the milestone
            effectDescription: "You can buy max Prestige Boosters",
        },
        1: {requirementDescription: "25 Prestige Boosters",
            done() {return player[this.layer].best.gte(25) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks a prestige upgrade",
        },
        2: {requirementDescription: "1 Power Plant",
        done() {return (player.b.points.gte(1) && player.pp.points.gte(1)) || hasMilestone("cp", 1)}, // Used to determine when to give the milestone
        effectDescription: "Prestige Boosters behave as if you chose them first",
    }
    },
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
        }
    }
})

    addLayer("c", {
        name: "clicker", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: function() {
            if(hasUpgrade('c', 11)) return "C"
            else if (player['c'].points > 0||hasMilestone('c', 0)) return "R"
            else return "RIP"}, // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
            points: new Decimal(0),
        }},
        doReset(layer){
            return
        },
        branches: ["p"],
        effectDescription() {
            if(hasUpgrade('c', 11)) return " which do nothing other than provide side entertainment.<br>You can safely ignore this layer.<br><br>But if you keep clicking, you might find a whole clicker minigame in this layer (not yet)"
            else return "which reset the Prestige Layer"
        },
        onPrestige() {
            if (!hasUpgrade('c', 11)) layerDataReset("p", [])
        },
        buyables: {
            11: {
                unlocked() {return hasUpgrade('c', 11)},
                cost(x) { return new Decimal(0) },
                display() { return "Click me for 1 clicker point" },
                canAfford() { return true },
                buy() {
                    player[this.layer].points = player[this.layer].points.add(1)
                },
            },
        },
        tabFormat:  [
                        "main-display",
                        ["prestige-button", "", function (){ return hasUpgrade("c", 11) ? {'display': 'none'} : {}}],
                        "milestones",
                        "blank",
                        "buyables",
                        "blank",
                        "upgrades",
                    ],
                    
        canReset() {return !hasUpgrade('c', 11)},
        color: "#FF0000",
        requires: new Decimal(0),//player[this.layer].points,//.add(1).mult(25), // Can be a function that takes requirement increases into account
        resource:  function() {if(hasUpgrade('c', 11)) return "clicker points"
        else return "free prestige resets"}, // Name of prestige currency
        baseResource: function() {if(hasUpgrade('c', 11)) return "clicker points"
        else return "points"}, // Name of resource prestige is based on
        baseAmount() {if(hasUpgrade('c', 11)) return player['c'].points 
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
        layerShown(){return hasUpgrade('p', 32)||player['c'].points > 0||hasMilestone('c', 0)},
        milestones: {
            0: {
                requirementDescription: "I'm Sorry",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Disables the current effect of the inflation upgrade and makes it actually give you 100 points per second instead.",
                unlocked() {
                    return (!hasUpgrade('c', 11))
                },
            },
        },
        upgrades: {
            11: {
                unlocked() {
                    return player['c'].points > 24 || hasUpgrade('c', 11)
                },
                title: "Clicker",
                description: function() {
                    if (hasUpgrade('c', 11)) return "This layer is now a clicker layer and will no longer reset the prestige layer."
                    if(player['c'].points < 100) return "Do you really need 25 resets or did you just want this to turn this into a clicker?"
                    else if (player['c'].points < 200) return "Appearently you do, so feel free to continue while I keep increasing the price of this upgrade"
                    else if (player['c'].points < 250) return "You know what? This upgrade does nothing anyways, so I'll just give it to you once you reach 250 resets"
                    else return "Here you go, the useless upgrade is yours"
                },
                cost: function() { 
                    if(hasUpgrade('c', 11) || player['c'].points >= 200) return new Decimal(250)
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
    canBuyMax: function() {return hasMilestone('pp', 0)},
    color: "#FF9B00",
    effectDescription() {
        let mul = upgradeEffect('pp', 11) / 100 + 1
        return " which are generating " + format(player['pp'].best) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(1 + upgradeEffect('pp', 11) / 100)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 0.5)
    },
    requires: function() {
        if(player['b'].best > 0 && !hasMilestone('pp',2)) return new Decimal(15000)
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
    doReset(resettingLayer){ 
        let keep = [];
        if (layers[resettingLayer].row > this.row) player.pp.points = new Decimal(0);
        if (layers[resettingLayer].row > this.row) player.pp.power.points = new Decimal(0);
        if (hasMilestone("m", 2) && layers[resettingLayer].row == 2) keep.push("upgrades");
        if (hasMilestone("m", 1) && layers[resettingLayer].row == 2) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    milestones: {
        0: {requirementDescription: "9 Power Plants",
            done() {return player[this.layer].best.gte(9) || hasMilestone("m", 1)}, // Used to determine when to give the milestone
            effectDescription: "You can buy max Power Plants",
        },
        1: {requirementDescription: "25 Power Plants",
            done() {return player[this.layer].best.gte(25) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks a prestige upgrade",
        },
        2: {requirementDescription: "1 Prestige Booster",
        done() {return (player.b.points.gte(1) && player.pp.points.gte(1)) || hasMilestone("m", 2)}, // Used to determine when to give the milestone
        effectDescription: "Power Plants behave as if you chose them first",
    }
    },
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
        }
    }
})

addLayer("cp", {
    name: "Challenge Point", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["b"],
    color: "#FF009B",
    effectDescription() {
        if (player.cp.points == 0) return " decreasing the challenge goals by 0%"
        else return " decreasing the challenge goals by " + player.cp.points.sqrt().log(10).pow(2).min(99).mul(100).round().divide(100) + "%"
    },
    requires: function() {
        return new Decimal(5000000)
    },
    resource: "Challenge Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75,
    roundUpCost: true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Challenge Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('p',1)},
    milestones: {
        0: {requirementDescription: "1 Challenge Point",
            done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
            effectDescription: "You keep Prestige Upgrades and Milestones on all resets",
        },
        1: {requirementDescription: "3 Challenge Points",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "You keep all Prestige Booster Milestones on all row 3 resets",
        },
        2: {requirementDescription: "10 Challenge Points",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "You keep all Prestige Booster Upgrades on all row 3 resets",
        }
    },
    upgrades: {
        /*11: {
            title: "Accumulator",
            description: "Prestige Points boost maximum power capacity",
            effect() {
                return Math.pow(player['p'].points,0.25)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) + "%" }, // Add formatting to the effect
            cost: new Decimal(1),
        },*/
    }
})

addLayer("m", {
    name: "Market spaces", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["pp"],
    color: "#9B00FF",
    effectDescription() {
        return " unlocking " + player.m.points.min(6) + " buyables (max of 6) and increasing their effects by x" + player.m.points.sqrt().sqrt()   
    },
    requires: function() {
        if (player.cp.best.gte(1) && !player.m.best.gte(3)) return new Decimal(500000000)
        else return new Decimal(5000000)
    },
    resource: "Market Spaces", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75,
    roundUpCost: true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Market Spaces", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('p',1)},
    milestones: {
        0: {requirementDescription: "1 Market Space",
            done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
            effectDescription: "You keep Prestige Upgrades and Milestones on all resets",
        },
        1: {requirementDescription: "3 Market Spaces",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "You keep all Power Plant Milestones on all row 3 resets",
        },
        2: {requirementDescription: "10 Market Spaces",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "You keep all Power Plant Upgrades on all row 3 resets",
        }
    },
    upgrades: {
        /*11: {
            title: "Accumulator",
            description: "Prestige Points boost maximum power capacity",
            effect() {
                return Math.pow(player['p'].points,0.25)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) + "%" }, // Add formatting to the effect
            cost: new Decimal(1),
        },*/
    }
})