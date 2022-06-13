let modInfo = {
	name: "Just a test of the tree mechanics",
	id: "JNBasic",
	author: "Johanniklas",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	name: "This is becoming challenging",
}

let changelog = `<h1>Changelog:</h1><br>
<h2>Current Endgame: Prestige Milestone 1</h2><br><br>
<h3>v0.4pre3.1</h3><br>
		- reset-layer bugfixes
<h3>v0.4pre3</h3><br>
		- the changes in the reset layer weren't reflected in the point gain equation
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
	if (hasUpgrade('p', 32) && hasMilestone('c', 0) && (player['b'].best > 0 || player['pp'].best > 0)) gain = gain.add(100)
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
	return hasMilestone('p',0)
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