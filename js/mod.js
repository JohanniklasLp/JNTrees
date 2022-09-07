let modInfo = {
	name: "Yet to be named",
	id: "JNBasic",
	author: "Johanniklas",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	name: "This is becoming challenging",
}

let changelog = `<h1>Changelog:</h1><br>
<h2>Current Endgame: 3 Market spaces or 3 Challenge Points (You are not supposed to unlock both yet)</h2><br><br>
<h3>If something is marked as "NYI" (Not yet implemented), it is achievable only after the current endgame and you are not supposed to get it yet</h3><br>
<h3>v0.4</h3><br>
		- Added achievements<br>
		- Removed the third milestones of the second layer<br>
		- Added a different milestone in its place<br>
		  Since they share the same ID, you might already have the new milestone even though you are not supposed to. To fix this, do a layer 3 reset or a hard reset. Or wait until I implement it and abuse it.<br>
		  I'm not fixing it because only a select few people had access to this game yet anyway.<br>
		- Moved the milestones of the second layer earlier<br>
		- Changed the effects and prices of some Upgrades<br>
		- Added the first two challenges<br>
		- Added the first two buyables<br>
		- Added the market in the market space layer<br><br>I would have included the other challenges and buyables too, but noticed how bad my code is now that I actually understand things. The next update will include them, and will release after rewriting parts of the code
<h3>v0.4pre3.5</h3><br>
		- Fixed Challenge Points not using the same price-increasing formula as Market Spaces<br><br>
<h3>v0.4pre3.4</h3><br>
		- Potential fix for Market Milestone 1 not keeping Prestige Milestone 1<br><br>
<h3>v0.4pre3.3</h3><br>
		- fixed Prestige Milestone 1 not having the correct id, thus the endgame screen not appearing when you get it<br><br>
<h3>v0.4pre3.2</h3><br>
		- fixed the patchnotes lol<br><br>
<h3>v0.4pre3.1</h3><br>
		- reset-layer bugfixes<br><br>
<h3>v0.4pre3</h3><br>
		- the changes in the reset layer weren't reflected in the point gain equation<br><br>
<h3>v0.4pre2</h3><br>
		- Some Bugfixes<br>
		- Changed the reset layer<br>
		- Added a softcap or two to points<br>
		- Renamed the tree. This comes with a one-time hard reset, since I also changed the ID<br><br>
<h3>v0.4pre</h3><br>
		- Added 2 new layers with Milestones<br>
		- The functionality of both layers is still missing, besides the Milestones<br>
		- Added some Milestones in existing layers (those will be moved to achievements once I add them)<br><br>
<h3>v0.3.2</h3><br>
		- Fix for softcap not working as intended<br><br>
<h3>v0.3.1</h3><br>
		- Actually changed the endgame to Prestige Milestone 1<br><br>
<h3>v0.3</h3><br>
		- Added a softcap and hardcap to prestige points<br>
		- Added two prestige upgrades and a prestige milestone<br>
		- Added two Prestige Booster and two Power Plant Milestones<br>
		- Replaced a Prestige Booster and a Power Plant Upgrade with a Milestone<br><br>
<h3>v0.2</h3><br>
		- Hard reset is recommended<br>
		- Reworked the Layer 1 reset layer, it's now the prestige reset layer<br>
		- Renamed testige layer, it's now the Prestige Booster layer<br>
		- Added the Power Plant layer<br>
		- When you choose either Power Plants or Prestige Boosters, the other one will get more expensive (once you have one of each, both will behave as if you chose them first) <br>
		- Some balancing changes<br><br>
<h3>v0.1</h3><br>
		- Added some Prestige Upgrades.<br>
		- Added the testige layer, which is basically the same layer as the prestige layer just based on prestige points instead.<br>
		- This will most likely be temporarily<br><br>
	<h3>v0.0</h3><br>
		- First Version.<br>
		- Points and Prestige Points were already a thing.`

let winText = `Congratulations! You have reached the current end of the game.`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "getSoftcap"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('p', 11)) gain = gain.times(2).times(player['b'].points.divide(10).add(1))
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 32) && !hasMilestone('c', 0)) gain = new Decimal(0)
	if (hasUpgrade('p', 32) && hasMilestone('c', 0) && hasAchievement("a", 11)) gain = gain.add(100)
	if (hasChallenge("cp",12)) gain = gain.times(player['b'].points.divide(10).add(1).times(buyableEffect("m",12)).times(challengeEffect("cp",12)).pow(challengeCompletions("cp",12)).pow(challengeCompletions("cp",12)))
	if (hasChallenge("cp",11)) gain = gain.times(player['pp'].power.points.sqrt().sqrt().max(1).times(challengeEffect("cp",11)).divide(2).pow(challengeCompletions("cp",11)).max(1))
	if (player.points.gte(10000000)) gain = gain.pow(0.5)
	if (player.points.gte(20000000)) gain = gain.pow(0.5)
	if (player.points.gte(30000000)) gain = gain.pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Points are softcapped at 10 million"
]

// Determines when the game "ends"
function isEndgame() {
	return player.cp.points.gte(3) || player.m.points.gte(3)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}