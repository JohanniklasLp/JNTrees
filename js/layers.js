addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        rows: 1,
        cols: 4,
        11: {
            name: "Layer 2",
            done() { return player.b.points.gte(1) || player.pp.points.gte(1) || hasAchievement("a",11) },
            tooltip: function() {
                if (!hasMilestone('c',0)) return "Have at least 1 of either Prestige Booster or Power Plants."
                return "Have at least 1 of either Prestige Booster or Power Plants. Reward: 'Inflation?' works now"
            },
        },
        12: {
            name: "Full layer 2",
            done() { return player.b.points.gte(1) && player.pp.points.gte(1) || hasAchievement("a",12)},
            tooltip: "Have at least 1 of both Prestige Booster and Power Plants. Reward: Both Prestige Booster and Power Plants behave as if you chose them first",
        },
        13: {
            name: "Layer 3",
            done() { return player.cp.points.gte(1) || player.m.points.gte(1) || hasAchievement("a",13)},
            tooltip: "Have at least 1 of either Challenge Points or Market Spaces.",
        },
        14: {
            name: "Full layer 3",
            done() { return player.cp.points.gte(1) && player.m.points.gte(1) || hasAchievement("a",14)},
            tooltip: "Have at least 1 of both Challenge Points and Market Spaces. Reward: Both Challenge Points and Market Spaces behave as if you chose them first [NYI]",
        }
    },
    tabFormat: [
        "blank", 
        ["display-text", function() { return "Achievements: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
        "blank", "blank", "blank", "blank", "blank",
        "achievements",
    ],
})

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
        if (hasUpgrade('p', 13)) {
            if(inChallenge("cp",11)) mult = mult.times(upgradeEffect('p', 13)).times(player['b'].points.divide(2).add(1))
            else mult = mult.times(upgradeEffect('p', 13)).times(player['b'].points.divide(10).add(1))
        }
        if (hasUpgrade('b', 11)) {
            if(inChallenge("cp",11)) mult = mult.times(2).times(player['b'].points.divide(2).add(1))
            else mult = mult.times(2).times(player['b'].points.divide(10).add(1))
        }
        if (hasUpgrade('b', 12)) {
            if(inChallenge("cp",11))mult = mult.times(upgradeEffect('b', 12)).times(player['b'].points.divide(2).add(1))
            else mult = mult.times(upgradeEffect('b', 12)).times(player['b'].points.divide(10).add(1))
        }
        if (hasUpgrade('p', 33)) mult = mult.times(upgradeEffect('p', 13))
        if (!inChallenge("cp",12) && !inChallenge("cp",11)) mult = mult.times(Math.max(Math.sqrt(player['pp'].power.points) / 2,1))
        if (inChallenge("cp",12)) mult = mult.divide(Math.max(player['pp'].power.points.sqrt().times(0.5),1))
        if (inChallenge("cp",11)) mult = mult.times(Math.max(new Decimal(Math.sqrt(player['pp'].power.points)).times(2.5),1))
        return mult
    },
    update(diff) {
        if(hasUpgrade('p', 33)) player.p.points = player.p.points.min(new Decimal(15000000).times(upgradeEffect('p', 33).times(100).floor().divide(100)))
        else player.p.points = player.p.points.min(15000000)
    },
    softcap: function() {
        if(hasUpgrade('p', 33))
            return new Decimal(10000000).times(upgradeEffect('p', 33))
        else return new Decimal(10000000)
    },
    softcapPower: new Decimal(0.25),
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (hasUpgrade('p', 33) && player.p.points.gte(new Decimal(15000000).times(upgradeEffect('p', 33).times(100).floor().divide(100)))) return decimalZero
        else if (!hasUpgrade('p', 33) && player.p.points.gte(new Decimal(15000000))) return decimalZero
        else if (inChallenge("m", 11)) return new Decimal(0.65)
        else return new Decimal(1)
    },
    midsection: [
        ["display-text", function() {
            if(hasUpgrade('p', 33)) return "Prestige Points are softcapped at " + format(new Decimal(10000000).times(upgradeEffect('p', 33)).divide(1000000)) + " Million"
            else return "Prestige Points are softcapped at " + new Decimal(10) + " Million"
        }],
        ["display-text", function() {
            if(hasUpgrade('p', 33)) return "and hardcapped at " + format(new Decimal(15000000).times(upgradeEffect('p', 33)).divide(1000000)) + " Million"
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
        if ((hasMilestone("cp", 0) || hasMilestone("m", 0)) && !inChallenge("cp",11)) keep.push("upgrades");
        if (hasMilestone("cp", 0) || hasMilestone("m", 0)) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    passiveGeneration() { return (hasUpgrade('pp',13))?upgradeEffect('pp', 13)/100:0 },
    milestones: {
        0: {requirementDescription: "5,000,000 Points (not prestige points)",
            done() {return player.points.gte(5000000) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlock two new layers",
            unlocked() {
                return (hasUpgrade('p', 31) && hasUpgrade('p', 33)) || hasMilestone("cp", 0) || hasMilestone("m", 0)
            },
        },
    },
    upgrades: {
        11: {
            title: "Half the wait",
            description: "Double your point gain.",
            cost: function() {
                if(inChallenge("cp",11)) return Math.max(0,new Decimal(2).add(player['b'].best.pow(10)))
                return Math.max(0,new Decimal(2).subtract(player['b'].best))
            },
        },
        12: {
            title: "Point boost",
            description: "Increases your point gain based on your prestige points.",
            effect() {
                if(hasUpgrade('p', 31)) return player[this.layer].points.add(1).pow(0.5).times(upgradeEffect('p', 31))
                else return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {
                if(inChallenge("cp",11)) return Math.max(0,new Decimal(3).add(player['b'].best.pow(10)))
                return Math.max(0,new Decimal(3).subtract(player['b'].best))
            },
        },
        13: {
            title: "Prestige point boost",
            description: "Increases your prestige point gain based on your points.",
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() {
                if(inChallenge("cp",11)) return Math.max(0,new Decimal(6).add(player['b'].best.pow(10)))
                return Math.max(0,new Decimal(6).subtract(player['b'].best))
            },
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
            cost: function() { 
                if(inChallenge("cp",11)) return new Decimal(1000000).times(player['b'].best.max(1).pow(10))
                return new Decimal(1000000)
            },
        },
        32: {
            title: "Inflation?",
            description: function() {
                if (hasMilestone('c', 0) && !hasAchievement('a', 11)) return "Gives you an additional 100 points per second. Not affected by multipliers. Only works once you do a row two reset."
                else if (hasMilestone('c', 0) && hasAchievement('a', 11)) return "Gives you an additional 100 points per second. Not affected by multipliers."
                else if (hasUpgrade('p', 32)) return "GOTCHA! This upgrade actually disables point gain."
                else return "Gives you an additional 100 points per second. Not affected by multipliers, else it would be too op for early game."
            },
            cost: function() { 
                if(inChallenge("cp",11)) return new Decimal(player['b'].best.pow(10))
                return new Decimal(0)
            },
        },
        33: {
            title: "Cap Booster",
            description: "Prestige Point generation, softcap, and hardcap as well as the effect of 'Generator' are higher based on your Power.",
            unlocked() {
                return hasMilestone('pp', 1)
            },
            effect() {
                return player.pp.power.points.add(1).pow(0.01)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            cost: function() { 
                if(inChallenge("cp",11)) return new Decimal(1000000).times(player['b'].best.max(1).pow(10))
                return new Decimal(1000000)
            },
            tooltip: "For the hardcap, the floored value shown as 'Currently' will be used instead of the actual value, to make it easier on your eyes.",
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
        if (inChallenge("cp",11) && hasChallenge("cp",12)) return " increasing the prestige row 1 and 'Inflation?' upgrade cost and multiplying the other prestige row 2 upgrade cost by " + format(player['b'].best.pow(10)) + "</b> (based on best) and multiplying their effect by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).add(1)) + " (based on current)<br>as well as multiplying point gain by" + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).pow(challengeCompletions("cp",12)).add(1))
        if (inChallenge("cp",11)) return " increasing the prestige row 1 and 'Inflation?' upgrade cost and multiplying the other prestige row 2 upgrade cost by " + format(player['b'].best.pow(10)) + "</b> (based on best) and multiplying their effect by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).add(1)) + " (based on current)"
        if (inChallenge("cp",12) && hasChallenge("cp",12)) return " decreasing the prestige row 1 upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(2).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).add(1)) + " (based on current)<br>as well as multiplying point gain by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).pow(challengeCompletions("cp",12)).add(1))
        if (inChallenge("cp",12)) return " decreasing the prestige row 1 upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(2).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).add(1)) + " (based on current)"
        if (hasChallenge("cp",12)) return " decreasing the prestige row 1 upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).add(1)) + " (based on current)<br>as well as multiplying point gain by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).pow(challengeCompletions("cp",12)).add(1))
        else return " decreasing the prestige row 1 upgrade cost by " + format(player['b'].best) + "</b> (based on best, minimum of 0) and multiplying their effect by " + format(player['b'].points.divide(10).times(buyableEffect("m",12)).add(1)) + " (based on current)"
    },
    requires: function() {
        if(!hasAchievement('a', 11)) return new Decimal(10)
        if(!hasAchievement('a', 12) && player.pp.best.gt(0)) return new Decimal(15000)
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
        //if (hasMilestone("cp", 2) && layers[resettingLayer].row == 2) keep.push("upgrades"); "NYI"
        if (hasMilestone("cp", 1) && layers[resettingLayer].row == 2) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    milestones: {
        0: {requirementDescription: "6 Prestige Boosters",
            done() {return player[this.layer].best.gte(6) || hasMilestone("cp", 1)}, // Used to determine when to give the milestone
            effectDescription: "You can buy max Prestige Boosters",
        },
        1: {requirementDescription: "15 Prestige Boosters",
            done() {return player[this.layer].best.gte(15) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks a prestige upgrade",
        },
        2: {requirementDescription: "75 Prestige Boosters[NYI]",
            done() {return false}, // player[this.layer].best.gte(75)}, // Used to determine when to give the milestone
            effectDescription: "'Summer Sale' decreases the base cost instead of the total cost<br>Change the effect of 'Deflation'",
        },
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
                        function (){ return hasUpgrade("c", 11) ? {'milestones': 'none'} : {}},
                        "blank",
                        "buyables",
                        "blank",
                        "upgrades",
                    ],
                    
        canReset() {return !hasUpgrade('c', 11)},
        color: "#FF0000",
        requires: new Decimal(0),//player[this.layer].points,//.add(1).times(25), // Can be a function that takes requirement increases into account
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
                effectDescription: "Disables the current effect of the inflation upgrade. Added a reward to the 'Layer 2' achievement",
                unlocked() {
                    return (player['c'].points.gte(1))
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
        if (!player.pp.unlocked) return
        let mult = new Decimal(buyableEffect("m",11)).max(1)
        if (hasUpgrade('pp', 11)) mult = mult.times(new Decimal(upgradeEffect('pp', 11)).divide(100).add(1))
        if(inChallenge("cp",11)) player.pp.power.points = player.pp.power.points.add(player['pp'].best.times(diff).times(mult)).min(player['pp'].best.times(250).times(mult))
        else player.pp.power.points = player.pp.power.points.add(player['pp'].best.times(diff).times(mult)).min(player['pp'].best.times(250).times(mult))
        if (inChallenge("m", 11)) {
            let coin = new Decimal(player.pp.power.points).times(diff).times(0.9)
            player.pp.power.points = player.pp.power.points.subtract(coin)
            layers['m'].addCoins(coin)
        }
    },
    branches: ["p"],
    canBuyMax: function() {return hasMilestone('pp', 0)},
    color: "#FF9B00",
    effectDescription() {
        let mult = new Decimal(buyableEffect("m",11)).max(1)
        if (hasUpgrade('pp', 11)) mult = mult.times(new Decimal(upgradeEffect('pp', 11)).divide(100).add(1))
        if(inChallenge("cp",11) && hasChallenge("cp",11)) return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation and point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 2.5)
        if(inChallenge("cp",12) && hasChallenge("cp",11)) return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, dividing the prestige point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 0.5) + " and increasing point generation by " + format(new Decimal(Math.sqrt(new Decimal (Math.sqrt(player['pp'].power.points)))).times(challengeEffect("cp",11)).divide(2))
        if(inChallenge("cp",11)) return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 2.5)
        if(inChallenge("cp",12)) return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, dividing the prestige point generation by " + format(Math.sqrt(Math.sqrt(player['pp'].power.points)) * 0.5)
        if(hasChallenge("cp",11)) return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation and point generation by " + format(new Decimal(Math.sqrt(new Decimal (Math.sqrt(player['pp'].power.points)))).times(challengeEffect("cp",11)).divide(2))
        return " which are generating " + format(player['pp'].best.times(mult)) + " Power per second, with a limit of " + format(player['pp'].best.times(250).times(mult)) + " (based on best).<br><br>You have " + format(player['pp'].power.points) + " power, increasing the prestige point generation by " + format(new Decimal(Math.sqrt(new Decimal (Math.sqrt(player['pp'].power.points)))).times(challengeEffect("cp",11)) / 2)
    },
    requires: function() {
        if(!hasAchievement('a', 11)) return new Decimal(10)
        if(!hasAchievement('a', 12) && player.b.best.gt(0)) return new Decimal(15000)
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
        if (layers[resettingLayer].row > this.row || (layers[resettingLayer].row == this.row && player.cp.challenges[12]>0)) player.pp.power.points = new Decimal(0);
        //if (hasMilestone("m", 2) && layers[resettingLayer].row == 2) keep.push("upgrades"); "NYI"
        if (hasMilestone("m", 1) && layers[resettingLayer].row == 2) keep.push("milestones");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){return true},
    milestones: {
        0: {requirementDescription: "6 Power Plants",
            done() {return player[this.layer].best.gte(6) || hasMilestone("m", 1)}, // Used to determine when to give the milestone
            effectDescription: "You can buy max Power Plants",
        },
        1: {requirementDescription: "15 Power Plants",
            done() {return player[this.layer].best.gte(15) || hasMilestone("cp", 0) || hasMilestone("m", 0)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks a prestige upgrade",
        },
        2: {requirementDescription: "75 Power Plants[NYI]",
            done() {return false}, //player[this.layer].best.gte(75)}, // Used to determine when to give the milestone
            effectDescription: "'Self-Sufficient' decreases the base cost instead of the total cost<br>Change the effect of 'Deflation'",
        },
    },
    upgrades: {
        11: {
            title: "Accumulator",
            description: "Prestige Points boost power generation and maximum power capacity",
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
                let ef = new Decimal(Math.min(100,Math.max(1,Math.sqrt(player.pp.power.points) / 10)))
                if (hasUpgrade('p', 33)) ef = ef.times(upgradeEffect('p', 33))
                return ef
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
        let t1 = " unlocking " + player.cp.total + " Challenges (based on total, max of 6) and"
        if (player.cp.points == 0) return t1 + " decreasing the challenge goals by 0%"
        else return t1 + " decreasing the challenge goals by " + format(player.cp.points.sqrt().log(10).pow(2).min(99)) + "%"
    },
    requires: function() {
        if (inChallenge("m",11) || inChallenge("cp",11) || inChallenge("cp",12) || inChallenge("cp",21) || inChallenge("cp",22) || inChallenge("cp",31) || inChallenge("cp",32)) return new Decimal(1/0)
        if (player.m.best.gte(1) && !player.cp.best.gte(3)) return new Decimal(500000000)
        else return new Decimal(5000000)
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
    layerShown(){return hasMilestone('p',0)},
    milestones: {
        0: {requirementDescription: "1 Challenge Point",
            done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
            effectDescription: "You keep unlocked Prestige Upgrades and Milestones on all resets",
        },
        1: {requirementDescription: "3 Challenge Points",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "You keep all unlocked Prestige Booster Milestones on all row 3 resets",
        },
        2: {requirementDescription: "10 Challenge Points [NYI]",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "You keep all unlocked Prestige Booster Upgrades on all row 3 resets",
        }
    },
    challenges: {
        rows: 3,
        cols: 2,
        11: {
            name: "Boosted Power",
            challengeDescription: "Increase the effect of power, but Prestige Booster massively increase the cost of prestige Upgrades<br>This challenge ignores the 'keep prestige upgrades' milestones",
            unlocked() {return player.cp.best.gte(1)},
            goal() { return new Decimal(500000).times(new Decimal(10).pow(challengeCompletions(this.layer,this.id))).times(new Decimal(1).subtract(player.cp.points.sqrt().log(10).pow(2).min(99).divide(100))) },
            onEnter() {
                player.cp.activeChallenge = 11;
                doReset("cp", true)
            },
            rewardDescription() {return "Increase the effect of power, and power effect multiplies point gain per completion<br>Currently: x" + format(this.rewardEffect()) + "<br>Completions: " + challengeCompletions(this.layer,this.id) + "/10"},
            goalDescription() {return format(this.goal()) + " Points"},
            canComplete() {return player.points.gte(this.goal())},
            rewardEffect() {return new Decimal (challengeCompletions(this.layer,this.id)).times(0.25).add(1)},
            completionLimit: 10
        },
        12: {
            name: "Powered Boosts",
            challengeDescription: "Prestige Booster have a stronger effect, but power decreases the prestige point generation",
            unlocked() {return player.cp.best.gte(2)},
            goal() { return new Decimal(1000000).times(new Decimal(10).pow(challengeCompletions(this.layer,this.id))).times(new Decimal(1).subtract(player.cp.points.sqrt().log(10).pow(2).min(99).divide(100))) },
            onEnter() {
                player.cp.activeChallenge = 12;
                doReset("cp", true)
            },
            rewardDescription() {return "Increase the effect of Prestige Booster, and Prestige Booster effect multiplies point gain per completion<br>Currently: x" + format(this.rewardEffect()) + "<br>Completions: " + challengeCompletions(this.layer,this.id) + "/10"},
            goalDescription() {return format(this.goal()) + " Points"},
            canComplete() {return player.points.gte(this.goal())},
            rewardEffect() {return new Decimal (challengeCompletions(this.layer,this.id)).times(0.25).add(1)},
            completionLimit: 10
        },
        21: {
            name: "Capped [NYI]",
            challengeDescription: "Softcaps have a way smaller effect, but they apply sooner",
            unlocked() {return player.cp.best.gte(3)},
            goal() { return new Decimal(1/0) },
            onEnter() {
                player.cp.activeChallenge = 21;
                doReset("cp", true)
            },
            rewardDescription() {return "Increase the soft- and hardcap of points and prestige points"},
        },
        22: {
            name: "Deflation? [NYI, you shouldn't be here yet]",
            challengeDescription: "All row 3+ ressources (milestones, upgrades, buyables etc.) and 'Inflation?' have no effect and you are trapped in 'Capped' (same level as this challenge)",
            unlocked() {return player.cp.best.gte(4)},
            goal() { return new Decimal(1/0) },
            onEnter() {
                player.cp.activeChallenge = 22;
                doReset("cp", true)
            },
            rewardDescription() {return "'Inflation?' now increases the base point production, but at a way smaller effect"},
        },
        31: {
            name: "Hyper Power [NYI, seriously, stop it]",
            challengeDescription: "You are trapped in 'Boosted Power' (Level 11), Increase the effect of power even more, power resets on row 2 resets too, Power Plants past 10 do not increase the power limit, but Prestige Booster past 10 do.",
            unlocked() {return player.cp.best.gte(5)},
            goal() { return new Decimal(1/0) },
            onEnter(testInput=false) {
                player.cp.activeChallenge = 31;
                doReset("cp", true)
            },
            rewardDescription() {return "Prestige Booster past 10 boost power production and limit, but power also resets on row 2 resets and Prestige Booster no longer decrease upgrade costs"},
        },
        32: {
            name: "Mashup [NYI, I could just set your point gain to 0 you know]",
            challengeDescription: "You are trapped in 'Boosted Power', 'Powered Boosts', and 'Capped'. 'Boosted Power' is stronger the more Prestige Booster you have over Power Plants, 'Powered Boosts' is stronger, the more Power Plants you have over Prestige Booster, and 'Capped' is stronger the smaller the difference between Prestige Booster and Power Plants, with a max combined level of 22 and a minimum level of 1",
            unlocked() {return player.cp.best.gte(6)},
            goal() { return new Decimal(1/0) },
            onEnter(testInput=false) {
                player.cp.activeChallenge = 32;
                doReset("cp", true)
            },
            rewardDescription() {return "You can complete 'Capped' and 'Deflation' up to 100 times, Prestige Booster boost 'Boosted Power' reward and Power Plants boost 'Powered Boosts' reward"},
        },
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
    startData() { 
        return {
        unlocked: false,
		points: new Decimal(0),
        coins: {
            points: decimalZero,
            best: decimalZero,
            total: decimalZero,
        }
    }},
    branches: ["pp"],
    color: "#9B00FF",
    effectDescription() {
        return " unlocking " + player.m.total.min(6) + " Buyables (based on total, max of 6) and increasing their effects by x" + format(player.m.points.sqrt().sqrt()) + ".<br><br>You have " + format(player['m'].coins) + " coins."
    },
    requires: function() {
        if (inChallenge("m",11) || inChallenge("cp",11) || inChallenge("cp",12) || inChallenge("cp",21) || inChallenge("cp",22) || inChallenge("cp",31) || inChallenge("cp",32)) return new Decimal(1/0)
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
    addCoins: function(coin) {
        let ca = new Decimal(coin)
        let c = new Decimal(player['m'].coins)
        c = c.add(ca.divide(20))
        player['m'].coins = c
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Market Spaces", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('p',0)},
    milestones: {
        0: {requirementDescription: "1 Market Space",
            done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
            effectDescription: "You keep unlocked Prestige Upgrades and Milestones on all resets",
        },
        1: {requirementDescription: "3 Market Spaces",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "You keep all unlocked Power Plant Milestones on all row 3 resets",
        },
        2: {requirementDescription: "10 Market Spaces [NYI]",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "You keep all unlocked Power Plant Upgrades on all row 3 resets",
        }
    },
    challenges: {
        rows: 1,
        cols: 1,
        11: {
            name: "The Market",
            challengeDescription: "Prestige Point gain is dilated ^0.65, and sell 90% of your power per second<br>Entering and exiting the Market will do a Market Space reset",
            unlocked() {return player.m.unlocked},
            goal() { return new Decimal(1/0) },
            onStart(testInput=false) {
                if (testInput && player.m.auto) {
                    player.m.activeChallenge = 11;
                    doReset("m", true)
                }
            },
            rewardDescription() {return "Get coins based on your sold power"},
        }
    },
    buyables: {
        rows: 2,
        cols: 3,
        11: {
            title: "More Power",
            cost(x) {
                return x.times(2).pow(1.2).floor().add(1)
            },
            effect(x=player[this.layer].buyables[this.id]) {
                x = x.pow(1.05).divide(5).add(1).times(player.m.points.sqrt().sqrt())
                return x
            },
            display() {
                let t = "Cost: " + format(this.cost()) + "<br>"
                t = t + "Amount: " + getBuyableAmount(this.layer, this.id) + "<br>"
                t = t + "Increases power generation and limit. Currently: x" + format(this.effect())
                return t
            },
            unlocked() { return player[this.layer].total.gte(1) },
            canAfford() { return player[this.layer].coins.gte(this.cost()) },
            buy() {
                player[this.layer].coins = player[this.layer].coins.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1000,
        },
        12: {
            title: "More Boost",
            cost(x=player[this.layer].buyables[this.id]) {
                x = x.add(1).pow(3).divide(15).floor().add(1)
                return x
            },
            effect(x=player[this.layer].buyables[this.id]) {
                x = x.divide(5).add(1).times(player.m.points.sqrt().sqrt())
                return x
            },
            display() {
                let t = "Cost: " + format(this.cost()) + "<br>"
                t = t + "Amount: " + getBuyableAmount(this.layer, this.id) + "<br>"
                t = t + "Increases the effect of Prestige Boosters. Currently: x" + format(this.effect())
                return t
            },
            unlocked() { return player[this.layer].total.gte(2) },
            canAfford() { return player[this.layer].coins.gte(this.cost()) },
            buy() {
                player[this.layer].coins = player[this.layer].coins.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1000,
        },
        13: {
            title: "Deflation[NYI]",
            display() {
                return "Until pp/b milestone 3: Increases the effect of 'Self-Sufficient' and 'Summer Sale' <br>After pp/b milestone 3: Decreases the total cost of Power Plants and Prestige Boosters"
            },
            unlocked() { return player[this.layer].total.gte(3) },
        },
        21: {
            title: "[NYI, You shouldn't be here yet]",
            display() {
                return "Decreases the effect of softcaps and softcaps and hardcaps apply later"
            },
            unlocked() { return player[this.layer].total.gte(4) },
        },
        22: {
            title: "[NYI, seriously, stop]",
            display() {
                return "Your point gain is increased (based on unspent coins)"
            },
            unlocked() { return player[this.layer].total.gte(5) },
        },
        23: {
            title: "[NYI, I could just set point gain to 0 you know]",
            display() {
                return "Increases the effect of Market Stands and Challenge Points"
            },
            unlocked() { return player[this.layer].total.gte(6) },
        },
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