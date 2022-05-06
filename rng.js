var save;
var game = newGame();
var lowUniverse = 1;
var highUniverse = 1;
var maxSpire = 0;

// only thing from spire assault that gets used
var autoBattle = {oneTimers: {Nullicious: {owned: false}}}

// flag that createHeirloom checks
var heirloomsShown = false;


// Input for save
document.getElementById("saveInput").addEventListener("paste", (event) => {
	onSavePaste(event);
});


document.getElementById("heirloomSearchButton").addEventListener("click", (event) => {
	searchForHeirloom(event);
});


document.getElementById("lowNextFiveButton").addEventListener("click", (event) => {
	nextFiveHeirlooms(event,0);
});

document.getElementById("highNextFiveButton").addEventListener("click", (event) => {
	nextFiveHeirlooms(event,1);
});
	
document.getElementById("highNextFiveMaxButton").addEventListener("click", (event) => {
	nextFiveMaxHeirlooms(event);	
});

function onSavePaste(event) {
	let paste = event.clipboardData.getData("text");
	save = JSON.parse(LZString.decompressFromBase64(paste));
	
	game.global.universe = save.global.universe
	game.global.lastSpireCleared = save.global.lastSpireCleared
	
	document.getElementsByName("low")[0].checked = "checked"
	document.getElementsByName("high")[0].checked = "checked"
	
	// set seeds
	game.global.heirloomBoneSeed = save.global.heirloomBoneSeed;
	game.global.heirloomSeed = save.global.heirloomSeed;
	game.global.bestHeirloomSeed = save.global.bestHeirloomSeed;
	game.global.coreSeed = save.global.coreSeed;
	
	// resources to not be zero to get correct resource for quest
	game.resources.food = 1;
	game.resources.wood = 1;
	game.resources.metal = 1;
	game.resources.science = 1;
	game.resources.gems = 1;
	
	// set fluffy
	game.global.fluffyPrestige = save.global.fluffyPrestige
	game.global.fluffyExp = save.fluffyExp
	game.portal.Capable.level = save.portal.Capable.level
	Fluffy.calculateLevel();
	
	
	// heirlooms can't have crit unless relentlessness is unlocked
	game.portal.Relentlessness.locked = save.portal.Relentlessness.locked;
	
	// prevents some code that won't work from running
	game.stats.totalHeirlooms.value = 1
	
}

function setLowUniverse(ele){
        lowUniverse = parseInt(ele.value)
	console.log(lowUniverse);
}

function setHighUniverse(ele){
        highUniverse = parseInt(ele.value)
	console.log(highUniverse);
}

function setMaxSpire(value){
	maxSpire = value;
}

function searchForHeirloom(event){
	let low = parseInt(document.getElementById("lowZoneText").value);
	let high = parseInt(document.getElementById("highZoneText").value);
	
	//find max rarity
	game.global.universe = highUniverse;
	let rarity = getHeirloomRarityRanges(high).length-1;
	
	let heirloom;
	
	game.global.heirloomSeed = save.global.heirloomSeed;
	
	
	if (lowUniverse == 1){
		for (let j = game.global.lastSpireCleared + 1; 100*(j+1) < low && j <= maxSpire; j++) spireHeirloom(j)
	}
	
	let tempSeed = game.global.heirloomSeed
	
	
	for (let i = 0; i < 5; i++) {
		if (highUniverse == 1){
			for (let j = Math.floor(low/100); 100*(j+1) < high && j <= maxSpire; j++) spireHeirloom(j)
		}
		game.global.universe = highUniverse;
		heirloom = findNextHeirloom(high, rarity);
		
		if (heirloom)
			document.getElementById('heirloom'+i).innerText = "Low: " + i + " High: " + heirloom.ahead + "\n" + heirloomToString(heirloom);
		else {
			document.getElementById('heirloom'+i).innerText = "Could not find max rarity heirloom looking 100 ahead";
			return;
		}
		
		game.global.heirloomSeed = tempSeed
		game.global.universe = lowUniverse;
		createHeirloom(low)
		tempSeed = game.global.heirloomSeed
		
	}
}


function heirloomToString(heirloom){
	let text = ""
	text += heirloom.name + "\n"
	for (let i = 0; i < heirloom.mods.length; i++) text += heirloom.mods[i][0] + "\n"	
	return text
}

function findNextHeirloom(zone, rarity){
	let heirloom;
	for (let i = 0; i < 100; i++) {
		createHeirloom(zone);
		heirloom = game.global.heirloomsExtra[game.global.heirloomsExtra.length-1];
		if (heirloom.rarity == rarity) {
			heirloom.ahead = i+1;
			return heirloom;	
		}
	}
}
	
function nextFiveMaxHeirlooms(event){
	let high = parseInt(document.getElementById("highZoneText").value);
	var ele = document.getElementsByName("high");
        highUniverse = ele[0].checked ? 1 : 2;
	game.global.universe = highUniverse;
	game.global.heirloomSeed = save.global.heirloomSeed;
	let rarity = getHeirloomRarityRanges(high).length-1;
	
	if (game.global.universe == 1){
		for (let j = game.global.lastSpireCleared + 1; 100*(j+1) < high && j <= maxSpire; j++) spireHeirloom(j)
	}
	
	
	let count = 0;
	
	for (let i = 0; i < 5; i++) {
		heirloom = findNextHeirloom(high, rarity);
		
		if (heirloom){
			count += heirloom.ahead
			document.getElementById('heirloom'+i).innerText = count + " ahead" + "\n" + heirloomToString(heirloom);
		}
		else {
			document.getElementById('heirloom'+i).innerText = "Could not find max rarity heirloom looking 100 ahead";
			return;
		}
	}
	
}

function nextFiveHeirlooms(event, high){
	
	let zone = high ? parseInt(document.getElementById("highZoneText").value) : parseInt(document.getElementById("lowZoneText").value);
	if(high){
		var ele = document.getElementsByName("high");
        	highUniverse = ele[0].checked ? 1 : 2;
	}
	else{
		var ele = document.getElementsByName("low");
        	lowUniverse = ele[0].checked ? 1 : 2;
	}
	
	let heirloom;
	game.global.heirloomSeed = save.global.heirloomSeed;
	
	game.global.universe = high ? highUniverse : lowUniverse
	
	if (game.global.universe == 1){
		for (let j = game.global.lastSpireCleared + 1; 100*(j+1) < zone && j <= maxSpire; j++) spireHeirloom(j)
	}
	
	let count = 0;
	
	for (let i = 0; i < 5; i++) {
		createHeirloom(zone);
		heirloom = game.global.heirloomsExtra[game.global.heirloomsExtra.length-1];
		document.getElementById('heirloom'+i).innerText = (i + 1) + " ahead" + "\n" + heirloomToString(heirloom);
	}
}

function spireHeirloom(spire){
	let zone
	switch (spire) {
		case 0:
			return;
		case 1:
	    		zone = 201;
	  		break;
		case 2:
	 	case 3:
	 		zone = 400;
			break;
		case 4:
		case 5:
		case 6:
		case 7:
			zone = 100*(spire+1)
			break;
	 	default:
	    	console.log('Error in spireHeirloom');
	}
	createHeirloom(zone)
	let heirloom = game.global.heirloomsExtra[game.global.heirloomsExtra.length-1];
	console.log(spire, zone, heirloom)
}

//createHeirloom calls these but I don't want them to do anything
function displaySelectedHeirloom(modSelected, selectedIndex, fromTooltip, locationOvr, indexOvr, fromPopup, fromSelect){return}
function checkAchieve(id, evalProperty, doubleChecking, noDisplay) {return}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

function getPerkLevel(what, usePortalUniverse){
	var portUpgrade = game.portal[what];
	var universe = (usePortalUniverse) ? portalUniverse : game.global.universe;
	if (universe == 1) {
		if (typeof portUpgrade.level !== 'undefined') return portUpgrade.level;
		return 0;
	}
	if (universe == 2){
		if (typeof portUpgrade.radLevel !== 'undefined') return portUpgrade.radLevel;
		return 0;
	}
	return 0;
}


function createHeirloom(zone, fromBones, spireCore, forceBest){
	var slots = game.heirlooms.slots;
	var rarityNames = game.heirlooms.rarityNames;
	//Determine Type
	var seed = (fromBones) ? game.global.heirloomBoneSeed : game.global.heirloomSeed;
	if (forceBest) seed = game.global.bestHeirloomSeed;
	var type;
	var rarity;
	if (spireCore){
		type = "Core";
		rarity = Math.round((zone - 200) / 100);
		if (rarity > 6) rarity = 6;
		if (rarity < 0) rarity = 0;
		game.stats.coresFound.value++;
		seed = game.global.coreSeed;
	}
	else{
		type = (getRandomIntSeeded(seed++, 0, 2) == 0) ? "Shield" : "Staff";
		//Determine type rarity
		rarity = getHeirloomRarity(zone, seed++, fromBones, forceBest);
	}
	//Sort through modifiers and build a list of eligible items. Check filters if applicable
	var eligible = [];
	for (var item in game.heirlooms[type]){
		var heirloom = game.heirlooms[type][item];
		if (item == "empty" && (rarity == 0 || rarity == 1)) continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[rarity] === -1) continue;
		eligible.push(item);
	}

	slots = slots[rarity];
	var name = rarityNames[rarity] + " " + type;
	//Heirloom configuration
	//{name: "", type: "", rarity: #, mods: [[ModName, value, createdStepsFromCap, upgradesPurchased, seed]]}
	var buildHeirloom = {id: (game.stats.totalHeirlooms.valueTotal + game.stats.totalHeirlooms.value), nuMod: 1, name: name, type: type, repSeed: getRandomIntSeeded(seed++, 1, 10e6), rarity: rarity, mods: []};
	buildHeirloom.icon = ((type == "Core") ? 'adjust' : (type == "Shield") ? '*shield3' : 'grain')
	var x = 0;
	if (!game.heirlooms.canReplaceMods[rarity]){
		x++;
		buildHeirloom.mods.push(["empty", 0, 0, 0, getRandomIntSeeded(seed++, 0, 1000)]);
	}
	for (x; x < slots; x++){
		var roll = getRandomIntSeeded(seed++, 0, eligible.length);
		var thisMod = eligible[roll];
		eligible.splice(roll, 1);
		var steps = (typeof game.heirlooms[type][thisMod].steps !== 'undefined') ? game.heirlooms[type][thisMod].steps : game.heirlooms.defaultSteps;
		steps = getRandomBySteps(steps[rarity], null, seed++);
		buildHeirloom.mods.push([thisMod, steps[0], steps[1], 0, getRandomIntSeeded(seed++, 0, 1000)]);
	}
	seed += 6 - (x * 2);
	buildHeirloom.mods.sort(function(a, b){
		a = a[0].toLowerCase();
		b = b[0].toLowerCase();
		if (a == "empty") return 1;
		if (b == "empty" || b > a) return -1;
		return a > b
	})
	if (game.global.challengeActive == "Daily" && !fromBones){
		buildHeirloom.nuMod *= (1 + (getDailyHeliumValue(countDailyWeight()) / 100));
	}
	if (autoBattle.oneTimers.Nullicious.owned && game.global.universe == 2) buildHeirloom.nuMod *= autoBattle.oneTimers.Nullicious.getMult();
	game.global.heirloomsExtra.push(buildHeirloom);
	displaySelectedHeirloom(false, 0, false, "heirloomsExtra", game.global.heirloomsExtra.length - 1, true);
	if ((game.stats.totalHeirlooms.value + game.stats.totalHeirlooms.valueTotal) == 0) document.getElementById("heirloomBtnContainer").style.display = "block";
	game.stats.totalHeirlooms.value++;
	checkAchieve("totalHeirlooms");
	if (heirloomsShown) displayExtraHeirlooms();
	if (spireCore) game.global.coreSeed = seed;
	else if (fromBones) game.global.heirloomBoneSeed = seed;
	else if (forceBest) game.global.bestHeirloomSeed = seed;
	else game.global.heirloomSeed = seed;
}

function getRandomBySteps(steps, mod, seed){
		if (mod && typeof mod[4] !== 'undefined'){
			seed = mod[4]++;
		}
		var possible = ((steps[1] - steps[0]) / steps[2]);
		var roll = getRandomIntSeeded(seed, 0, possible + 1);
		var result = steps[0] + (roll * steps[2]);
		result = Math.round(result * 100) / 100;
		return ([result, Math.round(possible - roll)]);
}

function getHeirloomZoneBreakpoint(zone, forBones){
	if (!zone) zone = game.global.world;
	var rarityBreakpoints = game.heirlooms.rarityBreakpoints;
	var universeBreakpoints = game.heirlooms.universeBreakpoints;
	var universe = game.global.universe;
	if (forBones && game.global.totalRadPortals > 0) universe = 2;
	for (var x = 0; x < rarityBreakpoints.length; x++){
		if (zone < rarityBreakpoints[x] && universe <= universeBreakpoints[x]) return x;
		if (universe < universeBreakpoints[x]) return x;
	}
	return rarityBreakpoints.length;
}

function getHeirloomRarityRanges(zone, forBones, forceIndex){
	if (forBones){
		if (game.global.totalRadPortals > 0) zone = game.global.highestRadonLevelCleared + 1;
		else zone = game.global.highestLevelCleared + 1;
	}
	var useBreakpoint = (typeof forceIndex !== 'undefined') ? forceIndex : getHeirloomZoneBreakpoint(zone, forBones); 
	var rarities = game.heirlooms.rarities[useBreakpoint];
	var canLower = 0;
	var addBonus = false;
	if (Fluffy.isRewardActive("stickler") && !(forBones && game.global.universe == 1 && game.global.totalRadPortals > 0)){
		canLower = 500;
		addBonus = true;
	}
	var newRarities = [];
	for (var x = 0; x < rarities.length; x++){
		if (rarities[x] == -1) {
			newRarities.push(-1);
			continue;
		}
		var newRarity = rarities[x];
		if (canLower > 0){
			if (newRarity > canLower){
				newRarity -= canLower;
				canLower = 0;
			}
			else {
				canLower -= newRarity;
				newRarities.push(-1);
				continue;
			}
		}
		if (addBonus && ((rarities.length - 1 == x) || rarities[x + 1] == -1)){
			newRarity += 500;
		}
		newRarities.push(newRarity);
	}
	return newRarities;
}

function getHeirloomRarity(zone, seed, fromBones, forceBest){ //Zone is optional, and will override world
	if (!zone) zone = game.global.world;
	var rarities = getHeirloomRarityRanges(zone, fromBones);
	var nextTest = 0;
	var selectedRarity;
	var rarityRoll = getRandomIntSeeded(seed, 0, 10000);
	if (forceBest) rarityRoll = 9999;
	for (var y = 0; y < rarities.length; y++){
		if (rarities[y] == -1) continue;
		nextTest += rarities[y];
		if (rarityRoll < nextTest) {
			selectedRarity = y;
			break;
		}
	}
	if (zone >= 146 && selectedRarity == 1) giveSingleAchieve("Consolation Prize");
	return selectedRarity;
}

function seededRandom(seed){
	var x = Math.sin(seed++) * 10000;
	return parseFloat((x - Math.floor(x)).toFixed(7));
}

function getRandomIntSeeded(seed, minIncl, maxExcl) {
	var toReturn = Math.floor(seededRandom(seed) * (maxExcl - minIncl)) + minIncl;
	return (toReturn === maxExcl) ? minIncl : toReturn;
}

var Fluffy = {
	firstLevel: 1000,
	getFirstLevel: function () {
		var prestigeRequire = Math.pow(this.prestigeExpModifier, this.getCurrentPrestige());	
		return this.firstLevel * prestigeRequire;
	},
	growth: 4,
	specialExpModifier: 1, //For events, test server, etc
	specialModifierReason: "",
	get baseExp(){
		if (game.global.universe == 2) return 2.5;
		return 50;
	},
	get expGrowth(){
		if (game.global.universe == 2) return 1.02;
		return 1.015
	},
	currentLevel: 0,
	prestigeDamageModifier: 5,
	prestigeExpModifier: 5,
	currentExp: [],
	damageModifiers: [1, 1.1, 1.3, 1.6, 2, 2.5, 3.1, 3.8, 4.6, 5.5, 6.5],
	damageModifiers2: [1, 1.1, 1.3, 1.6, 2, 2.5, 3.1, 3.8, 4.6, 5.5, 25.5, 30.5, 38, 48, 61, 111, 171, 241, 321, 411, 511, 621, 741, 741],
	rewards: ["stickler", "helium", "liquid", "purifier", "lucky", "void", "helium", "liquid", "eliminator", "overkiller"],
	prestigeRewards: ["dailies", "voidance", "overkiller", "critChance", "megaCrit", "superVoid", "voidelicious", "naturesWrath", "voidSiphon", "plaguebrought"],
	rewardsU2: ["trapper", "prism", "heirloopy", "radortle", "healthy", "wealthy", "critChance", "gatherer", "dailies", "exotic", "shieldlayer", "tenacity", "megaCrit", "critChance", "smithy", "biggerbetterheirlooms", "shieldlayer", "void", "moreVoid", "tenacity", "SADailies", "justdam", "justdam"],
	prestigeRewardsU2: [],
	checkU2Allowed: function(){
		if (game.global.universe == 2) return true;
		var prestige = this.getCurrentPrestige();
		if (prestige > 8) return true;
		if (prestige < 8) return false;
		if (this.currentLevel >= 10) return true;
		return false;
	},
	getDamageModifiers: function(){
		if (game.global.universe == 1) return this.damageModifiers;
		return this.damageModifiers2;
	},
	prestige: function () {
		if (game.global.universe == 2) return;
		this.calculateLevel();
		if (this.currentLevel < 10) return;
		this.setCurrentExpTo(0);
		this.addToPrestige(1);
		this.handleBox();
	},
	abortPrestige: function () {
		if (this.getCurrentPrestige() < 1) return;
		this.addToPrestige(-1);
		this.setCurrentExpTo(Math.floor(this.getFirstLevel() * ((Math.pow(this.growth, 10) - 1) / (this.growth - 1))));
		this.handleBox();
	},
	canGainExp: function () {
		if (!this.isCapableHighEnough(this.currentLevel, true)) return false;
		return true;
	},
	isCapableHighEnough: function(fluffyLevel, notEqual){
		var capableLevel = this.getCapableLevel();
		if (notEqual) return (fluffyLevel < capableLevel);
		return (fluffyLevel <= capableLevel);
	},
	isActive: function(){
		return (game.global.spireRows >= 15 || this.getCapableLevel() > 0);
	},
	isMaxLevel: function() {
		return (this.currentLevel == this.getRewardList().length);
	},
	getBestExpStat: function(){
		if (game.global.universe == 2) return game.stats.bestFluffyExp2;
		return game.stats.bestFluffyExp;
	},
	getBestExpHourStat: function(){
		if (game.global.universe == 2) return game.stats.bestFluffyExpHour2;
		return game.stats.bestFluffyExpHour;
	},
	getCurrentExp: function(){
		if (game.global.universe == 2) return game.global.fluffyExp2;
		return game.global.fluffyExp;
	},
	setCurrentExpTo: function(amt){
		if (game.global.universe == 2) game.global.fluffyExp2 = amt;
		else game.global.fluffyExp = amt;
	},
	getCurrentPrestige: function(){
		if (game.global.universe == 2) return game.global.fluffyPrestige2;
		return game.global.fluffyPrestige;
	},
	addToPrestige: function(amt){
		if (game.global.universe == 2) game.global.fluffyPrestige2 += amt;
		else game.global.fluffyPrestige += amt;
	},
	getCapableLevel: function(){
		if (game.global.universe == 2) return this.rewardsU2.length;
		return getPerkLevel("Capable");
	},
	getRewardList: function(){
		if (game.global.universe == 2) return this.rewardsU2;
		return this.rewards;
	},
	getPrestigeRewardList: function(){
		if (game.global.universe == 2) return this.prestigeRewardsU2;
		return this.prestigeRewards;
	},
	lastPat: 0,
	patSeed: Math.floor(Math.random() * 1000),
	pat: function(){
		var stat = (game.global.universe == 1) ? game.stats.fluffyPats : game.stats.scruffyPats;
		stat.valueTotal++;
		this.lastPat = new Date().getTime();
		this.patSeed++;
		this.refreshTooltip();
	},
	getFluff: function () {
		var possibilities = [];
		var timeSeed = Math.floor(new Date().getTime() / 1000 / 30);
		var name = this.getName();
		if (new Date().getTime() - this.lastPat < 15000){
			var stat = (game.global.universe == 1) ? game.stats.fluffyPats.valueTotal : game.stats.scruffyPats.valueTotal;
			var extra = "You've pet " + name + " " + stat + " time" + needAnS(stat) + ".";
			possibilities = [name + " makes a purr-like sound. " + extra, name + " reminds you to scratch behind the ears. " + extra, name + " appreciates the pat! " + extra, name + " thinks you're the best. " + extra, name + " frickin loves pats! " + extra, name + " looks quite happy. " + extra];
			timeSeed = this.patSeed;
		}
		else if (this.currentLevel == this.getRewardList().length){
			possibilities = [name + "'s just chillin.", name + " can now predict the future, though he won't tell you what's going to happen.", name + "'s looking pretty buff.", name.toUpperCase() + " SMASH", name + "'s smelling great today.", name + " is a model Trimp.", name + " can do anything.", name + " once killed a Snimp with a well-timed insult.", name + " can juggle 3 dozen scientists without breaking a sweat.", name + " does a barrel roll.", name + "'s thinking about writing a book."];
		}
		else {
			possibilities = ["He's enjoying the grind.", "He can't wait to get stronger.", "He could probably use a shower.", "He's growing up so fast.", "His fur is looking healthy today.", "He's feeling quite capable.", "He still drools a bit in his sleep.", "He loves a good game of fetch.", "He's been practicing juggling.", "He does a flip.", "He's the only Trimp not scared by your campfire ghost stories."];
		}
		return possibilities[getRandomIntSeeded(timeSeed, 0, possibilities.length)];
	},
	getExp: function(){
		if (this.currentExp.length != 3) this.handleBox();
		return this.currentExp;
	},
	getName: function(){
		if (game.global.universe == 2) return "Scruffy";
		else return "Fluffy";
	},
	calculateExp: function(){
		var level = this.currentLevel;
		var experience = this.getCurrentExp();
		var removeExp = 0;
		if (level > 0){
			removeExp = Math.floor(this.getFirstLevel() * ((Math.pow(this.growth, level) - 1) / (this.growth - 1)));
		}
		var totalNeeded = Math.floor(this.getFirstLevel() * ((Math.pow(this.growth, level + 1) - 1) / (this.growth - 1)));
		experience -= removeExp;
		totalNeeded -= removeExp;
		this.currentExp = [level, experience, totalNeeded];
	},
	calculateLevel: function(){
		var level = Math.floor(log10(((this.getCurrentExp() / this.getFirstLevel()) * (this.growth - 1)) + 1) / log10(this.growth));
		if (!this.isCapableHighEnough(level)) level = this.getCapableLevel();
		if (game.global.universe == 1 && game.global.fluffyPrestige == 8 && this.currentLevel == 9 && level == 10){
			tooltip("A Whole New World", null, 'update');
		}
		this.currentLevel = level;
	},
	calculateInfo: function(){
		if (!this.isActive()){
			this.currentLevel = 0;
			this.currentExp = [];
			return;
		}
		this.calculateLevel();
		this.calculateExp();
		this.updateExp();
		if (this.currentLevel >= 1) giveSingleAchieve("Consolation Prize");
	},
	updateExp: function(){
		var expElem = document.getElementById('fluffyExp');
		var lvlElem = document.getElementById('fluffyLevel');
		var fluffyInfo = (this.cruffysTipActive()) ? game.challenges.Nurture.getExp() : this.getExp();
		var width = Math.ceil((fluffyInfo[1] / fluffyInfo[2]) * 100);
		if (width > 100) width = 100;
		expElem.style.width = width + "%";
		lvlElem.innerHTML = fluffyInfo[0];
	},
	rewardExp: function(count){
		if (!this.canGainExp()) return;
		if ((game.global.world < (this.getMinZoneForExp() + 1)) && !count) return;
		var reward = this.getExpReward(true, count);
		if (game.global.universe == 2) game.global.fluffyExp2 += reward;
		else game.global.fluffyExp += reward;
		if (game.global.challengeActive == "Nurture") game.challenges.Nurture.gaveExp(reward);
		if (game.global.challengeActive == "Experience") game.challenges.Experience.heldExperience += reward;
		this.handleBox();
		return reward;
	},
	getMinZoneForExp: function(){
		if (game.global.universe == 2) return 0;
		var zone = 300;
		if (getPerkLevel("Classy")) zone -= (getPerkLevel("Classy") * game.portal.Classy.modifier);
		return Math.floor(zone);
	},
	getExpReward: function(givingExp, count) {
		var xpZone = game.global.world - this.getMinZoneForExp();
		if (game.global.universe == 2) xpZone *= 3;
		var reward = (this.baseExp + (getPerkLevel("Curious") * game.portal.Curious.modifier)) * Math.pow(this.expGrowth, xpZone) * (1 + (getPerkLevel("Cunning") * game.portal.Cunning.modifier));
		reward *= this.specialExpModifier;
		if (game.talents.fluffyExp.purchased)
			reward *= 1 + (0.25 * this.getCurrentPrestige());
		if (playerSpireTraps.Knowledge.owned){
			var knowBonus = playerSpireTraps.Knowledge.getWorldBonus();
			reward *= (1 + (knowBonus / 100));
		}
		if (autoBattle.oneTimers.Battlescruff.owned && game.global.universe == 2){
			reward *= (1 + ((autoBattle.maxEnemyLevel - 1) / 50));
		}
		if (count) reward *= count;
		if (getHeirloomBonus("Staff", "FluffyExp") > 0){
			reward *= (1 + (getHeirloomBonus("Staff", "FluffyExp") / 100));
		}
		if (givingExp) this.getBestExpStat().value += reward;
		//----Modifiers below this comment will not apply to best fluffy exp bone portal credit or stats----
		if (game.global.challengeActive == "Daily")
			reward *= (1 + (getDailyHeliumValue(countDailyWeight()) / 100));
		if (getUberEmpowerment() == "Ice") reward *= (1 + (game.empowerments.Ice.getLevel() * 0.0025));
		return reward;
	},
	getLevel: function(ignoreCapable){
		if (this.currentExp.length != 3) this.handleBox();
		var level = this.currentLevel;
		var capableLevels = this.getCapableLevel();
		if (ignoreCapable){
			level = Math.floor(log10(((this.getCurrentExp() / this.getFirstLevel()) * (this.growth - 1)) + 1) / log10(this.growth));
			if (level >= this.getRewardList().length) level = this.getRewardList().length;
			return level;
		}
		if (!this.isCapableHighEnough(level)) level = capableLevels;
		return level;
	},
	getDamageModifier: function () {
		var exp = this.getExp();
		var prestigeBonus = Math.pow(this.prestigeDamageModifier, this.getCurrentPrestige());
		var minLevel = (game.talents.fluffyAbility.purchased) ? 0 : 1;
		if (exp[0] < minLevel || exp.length != 3) return 1;
		var damageModifiers = this.getDamageModifiers();
		var bonus = damageModifiers[exp[0]];
		if (exp[0] >= damageModifiers.length || (exp[0] == this.getCapableLevel() && !(game.global.universe == 2 && this.getCapableLevel() == 10))) return 1 + ((bonus - 1) * prestigeBonus);
		var remaining = (damageModifiers[exp[0] + 1] - bonus);
		bonus += ((exp[1] / exp[2]) * remaining);
		return 1 + ((bonus - 1) * prestigeBonus);
	},
	getBonusForLevel: function(level) {
		var prestigeBonus = Math.pow(this.prestigeDamageModifier, this.getCurrentPrestige());
		var damageModifiers = this.getDamageModifiers();
		var possible = (damageModifiers[level] - damageModifiers[level - 1]) * 100 * prestigeBonus;
		if (this.currentLevel >= level) {
			return prettify(Math.round(possible)) + "%";
		}
		if (level == this.currentLevel + 1 && this.isCapableHighEnough(this.currentLevel, true)) {
			var earned = possible * (this.currentExp[1] / this.currentExp[2]);
			return prettify(earned) + "% / " + prettify(Math.round(possible)) + "%";
		}
		return "0% / " + prettify(Math.round(possible)) + "%";
	},
	isRewardActive: function(reward){
		var calculatedPrestige = this.getCurrentPrestige();
		if (game.talents.fluffyAbility.purchased) calculatedPrestige++;
		if (this.currentLevel + calculatedPrestige == 0) return 0;
		var indexes = [];
		var rewardsList = this.getRewardList();
		var prestigeRewardsList = this.getPrestigeRewardList();
		for(var x = 0; x < rewardsList.length; x++){
			if (rewardsList[x] == reward)
				indexes.push(x);
		}
		for (var z = 0; z < prestigeRewardsList.length; z++){
			if (prestigeRewardsList[z] == reward)
				indexes.push(rewardsList.length + z)
		}
		var count = 0;
		for (var y = 0; y < indexes.length; y++){
			if (this.currentLevel + calculatedPrestige > indexes[y]) count++;
		}
		return count;
	},
	handleBox: function(){
		var boxElem = document.getElementById('fluffyBox');
		var xpElem = document.getElementById('fluffyExpContainer');
		if (Fluffy.isActive()){
			boxElem.style.display = 'block';
			this.calculateInfo();
			if (this.currentLevel == this.getRewardList().length)
				xpElem.style.display = 'none';
			else
				xpElem.style.display = 'block';
		}
		else {
			boxElem.style.display = 'none';
		}
	},
	refreshTooltip: function (justOnce) {
		if (openTooltip != "Fluffy") return;
		var fluffyTip = Fluffy.tooltip(true);
		var topElem = document.getElementById('fluffyTooltipTopContainer');
		var bottomElem = document.getElementById('fluffyLevelBreakdownContainer');
		if (topElem && bottomElem) {
			topElem.innerHTML = fluffyTip[0];
			bottomElem.innerHTML = fluffyTip[1];
			if (!justOnce) setTimeout(Fluffy.refreshTooltip, 1000);
		}
		
	},
	checkAndRunVoidance: function() {
		if (!this.isRewardActive('voidance')) return;
		for (var x = 0; x < 2; x++){
			var map = createVoidMap();
			var mapName = map.split(' ');
			createVoidMap(mapName[0], mapName[1]);
		}
	},
	checkAndRunVoidelicious: function () {
		if (!this.isRewardActive('voidelicious')) return;
		var prefixes = ['Deadly', 'Poisonous', 'Heinous', 'Destructive'];
		var suffixes = ['Nightmare', 'Void', 'Descent', 'Pit'];
		for (var x = 0; x < prefixes.length; x++){
			for (var y = 0; y < suffixes.length; y++){
				createVoidMap(prefixes[x], suffixes[y]);
			}
		}

	},
	expBreakdown: function (what) {
		var elem = document.getElementById("fluffyExpBreakdown");
		switch(what){
			case "clear":
				elem.innerHTML = "";
				return;
			case "daily":
				var text = 'Applies when running a Daily Challenge, and matches the extra ' + heliumOrRadon() + ' from your Daily.' 
				text += ((game.global.challengeActive == "Daily") ? ' Currently ' + prettify(1 + (getDailyHeliumValue(countDailyWeight()) / 100)) + '.' : ' Currently 1.');
				text += " Does not apply to Best " + Fluffy.getName() + " Exp."
				elem.innerHTML = text;
				return;
			case "zone":
				elem.innerHTML = 'Your Zone number. Currently ' + game.global.world + '.';
				return;
			case "cunning":
				elem.innerHTML = 'The amount of levels placed in the Cunning Perk. Currently ' + getPerkLevel("Cunning") + '.';
				return;
			case "curious":
				elem.innerHTML = 'The amount of levels placed in the Curious Perk. Currently ' + getPerkLevel("Curious") + '.';
				return;
			case "classy":
				elem.innerHTML = 'The Zone Fluffy can start earning Experience at. This value is normally 301, and is currently reduced by ' + Math.floor(getPerkLevel("Classy") * game.portal.Classy.modifier) + ' thanks to ' + ((game.portal.Classy.modifier > 1) ? getPerkLevel("Classy") + " level" + ((getPerkLevel("Classy") == 1) ? "" : "s") + " of " : "") + 'Classy.';
				return;
			case "special":
				elem.innerHTML = this.specialModifierReason;
				return;
			case "staff":
				elem.innerHTML = 'The bonus modifier applied from "Pet Exp" on a Plagued or higher tier Staff. Currently ' + (1 + (getHeirloomBonus("Staff", "FluffyExp") / 100)).toFixed(2) + '.';
				return;
			case "flufffocus":
				elem.innerHTML = 'The bonus modifier from the Flufffocus Mastery (+25% exp per Prestige). ' + Fluffy.getName() + ' has evolved ' + this.getCurrentPrestige() + ' time' + ((this.getCurrentPrestige() == 1) ? '' : 's') + ', bringing this modifier to ' + prettify(1 + (0.25 * this.getCurrentPrestige())) + '.';
				return;
			case "knowledge":
				elem.innerHTML = 'The bonus from your Knowledge Towers. You have ' + playerSpireTraps.Knowledge.owned + ' Knowledge Tower' + needAnS(playerSpireTraps.Knowledge.owned) + ', granting a bonus of ' + playerSpireTraps.Knowledge.getWorldBonus(true) + '% each, bringing this modifier to ' + (1 + (playerSpireTraps.Knowledge.getWorldBonus() / 100)) + ".";
				return;
			case "ice":
				elem.innerHTML = 'From Enlightened Ice. Equal to (1 + (0.0025 * Ice Levels)), currently ' + prettify((1 + (0.0025 * game.empowerments.Ice.getLevel()))) + '. Does not apply to Best Fluffy Exp.'
				return;
			case "labs":
				elem.innerHTML = 'From Nurture. Increases Exp gain by 10% (compounding) per constructed Laboratory. Currently granting ' + prettify(game.buildings.Laboratory.getExpMult()) + 'x.';
				return;
			case "battlescruff":
				elem.innerHTML = 'From the Battlescruff Spire Assault reward. Increases Scruffy XP gained by 2% per level cleared, currently granting ' + prettify(1 + ((autoBattle.maxEnemyLevel - 1) / 50)) + 'x.';
		}
	},
	cruffysToggled: false,
	cruffysTipActive: function(){
		if (!this.cruffysToggled) return false;
		if (game.challenges.Nurture.boostsActive()) return true;
		this.cruffysToggled = false;
		return false;
	},
	toggleCruffys: function(){
		var tipTitle = document.getElementById('tipTitle');
		this.cruffysToggled = !this.cruffysToggled;
		if (tipTitle != null) tipTitle.innerHTML = (this.cruffysToggled) ? "<b>IT'S CRUFFYS</b>" : this.getName();
		this.handleBox();
		this.refreshTooltip();
		var toggleBtn = document.getElementById('toggleCruffyTipBtn');
		if (toggleBtn != null) toggleBtn.innerHTML = "Show " + ((this.cruffysToggled) ? "Scruffy" : "Cruffys") + " Info";
		var patBtn = document.getElementById('fluffyPatBtn');
		if (patBtn != null) patBtn.style.display = (this.cruffysToggled) ? "none" : "inline-block";
	},
	tooltip: function (big){
		var showCruffys = (this.cruffysTipActive());
		var savedLevel = Fluffy.getLevel(true);
		var fluffyInfo = Fluffy.getExp();
		var rewardsList = this.getRewardList();
		var prestigeRewardsList = this.getPrestigeRewardList();
		var calculatedPrestige = this.getCurrentPrestige();
		var name = this.getName();
		if (game.talents.fluffyAbility.purchased) 
			calculatedPrestige++;
		if (calculatedPrestige > prestigeRewardsList.length) 
			calculatedPrestige = prestigeRewardsList.length + 1;

		if (showCruffys){
			rewardsList = game.challenges.Nurture.rewardsList;
			savedLevel = game.challenges.Nurture.getLevel();
			calculatedPrestige = 0;
			fluffyInfo = game.challenges.Nurture.getExp();
			name = "Cruffys";
		}

		var bottomText = "";
		var topText = "<div style='width: 100%; font-size: 0.95em;'><div class='fluffyThird'>";
		var minZoneForExp = Fluffy.getMinZoneForExp() + 1;
		if (game.global.universe == 1 && (this.getCurrentPrestige() > 0 || this.currentLevel == rewardsList.length)) topText += "<span style='color: #740774'>Evolution " + this.getCurrentPrestige() + " </span>";
		topText += "Level " + fluffyInfo[0] + "</div><div class='fluffyThird'>";
		if (savedLevel >= rewardsList.length && (!showCruffys || fluffyInfo[0] >= 19)) {
			topText += "Max"
		}
		else {
			topText += (Fluffy.canGainExp()) ? "<span>" : "<span class='red'>"
			topText += prettify(fluffyInfo[1]) + " / " + prettify(fluffyInfo[2]) + " Exp";
			topText += "</span>";
		}
		if (!showCruffys) topText += "</div><div class='fluffyThird'>+" + prettify((Fluffy.getDamageModifier() - 1) * 100) + "% damage"
		topText += "</div></div>";
		if (showCruffys && game.global.challengeActive != "Nurture"){
			topText += "- Cruffys cannot gain Experience after the Nurture Challenge ends, but will stick around for " + (game.challenges.Nurture.cruffysUntil - game.global.world) + " more Zones.<br/>- " + Fluffy.getFluff();
		}
		else if (!Fluffy.isMaxLevel() && (!showCruffys || fluffyInfo[0] < 19)){
			if (savedLevel > fluffyInfo[0]) topText += "<span class='red'>- " + name + "'s level and damage bonus are currently reduced. " + name + " will return to level " + savedLevel + " when points are placed back in Capable.</span>";
			else if (!Fluffy.canGainExp()) topText += "<span class='red'>- " + name + " needs " + ((this.getCapableLevel() == 0) ? " at least one point of Capable to gain any Exp" + ((game.portal.Capable.locked) ? ". Complete Spire II to unlock Capable!" : "") : " more points in Capable to gain Exp above level " + this.getCapableLevel() + ".") + "</span>";
			else {
				if (game.global.world < minZoneForExp) topText += "<span class='red'>- " + name + " cannot gain any Experience from Zones lower than " + minZoneForExp + "</span>";
				else{
					var remainingXp = fluffyInfo[2] - fluffyInfo[1];
					var xpReward = Fluffy.getExpReward();
					if (showCruffys) xpReward *= game.buildings.Laboratory.getExpMult();
					var fluffyStat = Fluffy.getBestExpStat();
					var remainingRuns = (fluffyStat.value > 0) ? Math.ceil(remainingXp / fluffyStat.value) : -1;
					topText += "- " + name + " is earning " + prettify(xpReward) + " Exp per Zone. " + name + " needs " + prettify(remainingXp) + " more Exp to level";
					if (remainingRuns > -1 && !showCruffys) topText += ", equivalent to repeating your current run to this zone about " + prettify(remainingRuns) + " more time" + needAnS(remainingRuns) + ".";
					else topText += ".";
					topText += "<br/>- " + Fluffy.getFluff();
				}
			}
			
		}
		else topText += "- " + Fluffy.getFluff();
		topText += "</br>";
		if (!big) return topText;
		//clicked

		if (Fluffy.currentLevel == 10 && this.getCurrentPrestige() < prestigeRewardsList.length)
			topText += "<span class='fluffyEvolveText'>" + name + " is ready to Evolve! This will reset his damage bonus and most abilities back to level 0, but he will regrow to be stronger than ever. You can cancel this Evolution at any point to return to level 10.<br/><span class='btn btn-md btn-success' onclick='Fluffy.prestige(); Fluffy.refreshTooltip(true);'>Evolve!</span></span><br/>";
		if (Fluffy.canGainExp() && game.global.world >= minZoneForExp && (!showCruffys || fluffyInfo[0] < 19)) {
			topText += "- " + name + "'s Exp gain at the end of each Zone is equal to: ";
			var fluffFormula = "<br/><span style='padding-left: 1em'>";
			var startNumber = Fluffy.getMinZoneForExp();
			if (isPerkUnlocked("Classy")) startNumber = '<span class="fluffFormClassy" onmouseover="Fluffy.expBreakdown(\'classy\')" onmouseout="Fluffy.expBreakdown(\'clear\')">' + (startNumber + 1) + "</span> - 1";
			if (isPerkUnlocked("Curious")) fluffFormula += "(" + Fluffy.baseExp + " + (Curious * " + game.portal.Curious.modifier + ")) * (" + Fluffy.expGrowth + "^(Zone - " + startNumber + ")) * (1 + (Cunning * " + game.portal.Cunning.modifier + "))";
			else if (isPerkUnlocked("Cunning")) fluffFormula += Fluffy.baseExp + " * (" + Fluffy.expGrowth + "^(Zone - " + startNumber + ")) * (1 + (Cunning * " + game.portal.Cunning.modifier + "))";
			else if (game.global.universe == 2) fluffFormula += Fluffy.baseExp + " * (" + Fluffy.expGrowth + "^(Zone * 3))";
			else fluffFormula += Fluffy.baseExp + " * (" + Fluffy.expGrowth + "^(Zone - " + startNumber + "))";
			fluffFormula += "</span>";
			if (getHighestLevelCleared() >= 29) fluffFormula += ' * <span class="fluffFormDaily" onmouseover="Fluffy.expBreakdown(\'daily\')" onmouseout="Fluffy.expBreakdown(\'clear\')">daily' + heliumOrRadon() + 'Modifier</span>';
			if (game.talents.fluffyExp.purchased && game.global.universe == 1) fluffFormula += ' * <span class="fluffFormFlufffocus" onmouseover="Fluffy.expBreakdown(\'flufffocus\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Flufffocus</span>';
			if (getHeirloomBonus("Staff", "FluffyExp") > 0) fluffFormula += ' * <span class="fluffFormStaff" onmouseover="Fluffy.expBreakdown(\'staff\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Staff</span>';
			if (playerSpireTraps.Knowledge.owned) fluffFormula += ' * <span class="fluffFormKnowledge" onmouseover="Fluffy.expBreakdown(\'knowledge\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Knowledge</span>';
			if (Fluffy.specialExpModifier > 1) fluffFormula += ' * <span class="fluffFormSpecial" onmouseover="Fluffy.expBreakdown(\'special\')" onmouseout="Fluffy.expBreakdown(\'clear\')">' + Fluffy.specialExpModifier + "</span>";
			if (getUberEmpowerment() == "Ice") fluffFormula += ' * <span class="fluffFormIce" onmouseover="Fluffy.expBreakdown(\'ice\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Ice</span>';
			if (showCruffys) fluffFormula += ' * <span class="fluffFormLab" onmouseover="Fluffy.expBreakdown(\'labs\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Labs</span>';
			if (game.global.universe == 2 && autoBattle.oneTimers.Battlescruff.owned) fluffFormula += ' * <span class="fluffFormBattlescruff" onmouseover="Fluffy.expBreakdown(\'battlescruff\')" onmouseout="Fluffy.expBreakdown(\'clear\')">Battlescruff</span>';
			fluffFormula = fluffFormula.replace('Zone', '<span onmouseover="Fluffy.expBreakdown(\'zone\')" onmouseout="Fluffy.expBreakdown(\'clear\')" class="fluffFormZone">Zone</span>');
			fluffFormula = fluffFormula.replace('Cunning', '<span onmouseover="Fluffy.expBreakdown(\'cunning\')" onmouseout="Fluffy.expBreakdown(\'clear\')" class="fluffFormCunning">Cunning</span>')
			fluffFormula = fluffFormula.replace('Curious', '<span onmouseover="Fluffy.expBreakdown(\'curious\')" onmouseout="Fluffy.expBreakdown(\'clear\')" class="fluffFormCurious">Curious</span>')			
			topText += fluffFormula;
		}
		if (calculatedPrestige > 0 && Fluffy.currentLevel < 10 && !(calculatedPrestige == 1 && game.talents.fluffyAbility.purchased))
			topText += "<br/><span class='btn btn-sm btn-warning' onmousedown='cancelTooltip(); tooltip(\"confirm\", null, \"update\", \"You are about to abort " + name + "&#39;s Evolution. This will return you to level 10 on your last Evolution, but you will permanently lose all Experience earned towards the current Evolution. Are you sure you want to abort?\", \"Fluffy.abortPrestige()\", \"Abort Evolution\")'>Abort Evolution</span>"
		var xpBreakdownFill = (document.getElementById('fluffyExpBreakdown') ? document.getElementById('fluffyExpBreakdown').innerHTML : "");
		topText += "<div id='fluffyExpBreakdown'>" + xpBreakdownFill + "</div>";
		bottomText += "<table id='fluffyLevelBreakdown'><tbody><tr style='font-weight: bold; font-size: 1.25em; text-align: center;'><td style='padding: 0 1em'>Level</td><td>Ability</td><td style='padding: 0 1em'>+Damage</td></tr>";
		for (var x = 0; x < rewardsList.length; x++){
			var highlighted;
			// if (showCruffys) highlighted = (cruffysLevel >= (x + 1));
			// else 
			highlighted = ((fluffyInfo[0] + calculatedPrestige) >= (x + 1));
			bottomText += (highlighted) ? "<tr class='fluffyRowComplete'>" : "<tr>";
			if (savedLevel < x && calculatedPrestige == 0 && game.global.universe == 1)
				bottomText += "<td>Lv " + (x + 1) + "</td><td>????</td><td></td>"
			else{
				var levelDisplay = (x + 1) - calculatedPrestige;
				if (levelDisplay < 0) levelDisplay = 0;
				var description = (fluffyInfo[0] < levelDisplay - 2) ? "????" : Fluffy.rewardConfig[rewardsList[x]].description;
				bottomText += "<td>Lv " + levelDisplay + "</td><td>" + description + "</td>";
				if (showCruffys) bottomText += "<td></td></tr>"
				else bottomText += "<td style='text-align: center'>" + ((levelDisplay > 0) ? Fluffy.getBonusForLevel(levelDisplay) : "&nbsp;") + "</td></tr>";
			}
		}
		var countedPrestige = calculatedPrestige;
		if (fluffyInfo[0] == rewardsList.length) countedPrestige++;
		if (countedPrestige > 0){
			for (var y = 0; y < prestigeRewardsList.length; y++){
				var levelDisplay = rewardsList.length + (y + 1) - countedPrestige;
				if (levelDisplay > rewardsList.length) continue;
				if (levelDisplay < 0) levelDisplay = 0;
				bottomText += (fluffyInfo[0] >= rewardsList.length - calculatedPrestige + (y + 1)) ? "<tr class='fluffyRowComplete'>" : "<tr>";
				levelDisplay = ((countedPrestige - 1 == y && countedPrestige != calculatedPrestige) ? levelDisplay : ((countedPrestige == calculatedPrestige) ? levelDisplay : levelDisplay + 1));
				var displayedPrestige = y + 1;
				if (calculatedPrestige != this.getCurrentPrestige()) {
					displayedPrestige -= (calculatedPrestige - this.getCurrentPrestige())
				}
				bottomText += "<td><b>E" + displayedPrestige + "</b> Lv " + levelDisplay + "</td><td>" + Fluffy.rewardConfig[prestigeRewardsList[y]].description + "</td>";
				bottomText += "<td style='text-align: center'>" + ((levelDisplay > 0 && calculatedPrestige > y) ? Fluffy.getBonusForLevel(levelDisplay) : "&nbsp;") + "</td></tr>";
			}
		}
		bottomText += "</tbody></table>"
		return [topText, bottomText];
	},
	getVoidStackCount: function () {
		var count = 1;
		if (this.isRewardActive('void')) count++;
		else return 1;
		if (this.isRewardActive('superVoid')) count += 4;
		if (game.talents.voidSpecial2.purchased) count++;
		return count;
	},
	getRadortleMult: function(){
		return Math.pow(1.03, game.global.lastRadonPortal);
	},
	rewardConfig: {
		stickler: {
			description: "Adds a 5% chance to earn the highest available heirloom tier, and subtracts a 5% chance from the lowest tier."
		},
		purifier: {
			description: "Corrupt and Healthy enemies in active Spires have a 50% chance to be missing their special ability."
		},
		lucky: {
			description: "When completing a map with a cache, you have a +25% chance to find a second cache."
		},
		overkiller: {
			description: "Overkill can now reach one extra enemy."
		},
		helium: {
			get description(){
			return heliumOrRadon() + " gain from all sources is increased by 25%."
			}
		},
		void: {
			get description(){
				return "Allows up to two Void Maps with the same name to stick together. After completing this 2x Void Map, " + Fluffy.getName() + " will clear the extra one instantly, granting 50% more " + heliumOrRadon() + " than normal and a second Heirloom.";
			}
		},
		moreVoid: {
			get description(){
				return "Start each U2 run with 1 extra Void Map for every 5 Void Maps cleared on your last U2 run. (" + game.stats.totalVoidMaps.value + " cleared so far this run, granting " + Math.floor(game.stats.totalVoidMaps.value / 5) + " extra next run)";
			}
		},
		eliminator: {
			description: "Corrupt and Healthy enemies in active Spires no longer have any special abilities."
		},
		liquid: {
			description: "Adds 2.5% to your liquification bonus (half of a Spire)."
		},
		voidance: {
			description: "Each Portal, start with two double stacked Void Maps."
		},
		dailies: {
			get description(){
				return "Adds 100% to the " + heliumOrRadon() + " modifier of all Daily Challenges.";
			}
		},
		critChance: {
			description: "Gives your Trimps an additional 50% crit chance."
		},
		megaCrit: {
			get description(){
				var chance = Math.ceil(getPlayerCritChance());
				var text = "Adds +2x to your MegaCrit multiplier, increasing ";
				if (chance < 3) chance = 3;
				var current = [getMegaCritDamageMult(chance - 1), getMegaCritDamageMult(chance)];
				var start = getMegaCritDamageMult(2);
				if (!Fluffy.isRewardActive('megaCrit')) current = [Math.pow(start + 2, chance - 2), Math.pow((start + 2), chance - 1)];
				var counted = 0;
				for (var x = chance - 1; x < chance + 1; x++){
					text += "<span class='critSpan' style='background-color: #5f5f5f; padding: 0.3%;'>" + getCritText(x) + "</span> damage to " + current[counted] + "x";
					if (counted == 0) text += " and ";
					else text += ".";
					counted++;
				}
				return text;
			}
		},
		superVoid: {
			get description(){
				var count = 6;
				if (game.talents.voidSpecial2.purchased) count++;
				return "Allows an additional 4 Void Maps with the same name to stick together, bringing the max stack size to " + count + ". Each map in the stack that Fluffy clears grants an additional 50% Helium to all other maps in the stack, giving a bonus of up to +" + Math.floor((count - 1) * 50) + "% to each of the " + (count - 1) + " Fluffy maps from a " + count + " stack."
			}
		},
		voidelicious: {
			description: "Start each Portal with 1 of each uniquely named Void Map (16 total)."
		},
		naturesWrath: {
			description: "Improves Empowerments of Nature! Poison gains +10 to Stack Transfer rate, Helium rewards from Wind are increased by 5x, and the damage bonus from Ice is doubled."
		},
		voidSiphon: {
			description: "Your Trimps gain 5% attack each time you clear a Void Map. This bonus stacks additively and resets on Portal."
		},
		plaguebrought: {
			description: "Your Trimps gain +50% to their Plaguebringer modifier, and all Nature stacks accumulate twice as fast."
		},
		trapper: {
			description: "Traps are 10x larger and more effective."
		},
		healthy: {
			description: "Your Trimps gain +50% health."
		},
		wealthy: {
			get description(){
				return "Doubles the amount of resources gained from Battle (excluding " + heliumOrRadon() + ").";
			}
		},
		prism: {
			description: "Adds 25% of your Trimps' max health to their Prismatic Shield."
		},
		gatherer: {
			description: "Resources gathered by your Trimps are doubled."
		},
		exotic: {
			get description(){
				var boneInc = game.permaBoneBonuses.exotic.addChance();
				return "Increases the chance of finding Exotic Imports, bringing the average from " + (3 + boneInc) + " per zone to " + (3.5 + boneInc) + ".";
			}
		},
		reincarnate: {
			description: "When a group of Trimps would die, they have a 20% chance to be restored to full health instead. Cannot trigger if Trimps were killed in one hit."
		},
		heirloopy: {
			description: "Pet Exp, Plaguebringer, Void Map Drop Chance and Crit Chance mods on Heirlooms no longer suffer a penalty in Universe 2."
		},
		radortle: {
			get description(){
				return "Increases Radon gain from all sources by 3% for each Zone you reached on your last Portal in this Universe (compounding). You reached Z" + game.global.lastRadonPortal + " last Portal, worth +" + prettify((Fluffy.getRadortleMult() - 1) * 100) + "% Radon.";
			}
		},
		shieldlayer: {
			description: "Gives your Prismatic Shield an additional layer."
		},
		tenacity: {
			description: "Start each zone with 15% of last zone's Tenacity time already applied."
		},
		smithy: {
			description: "Reduces the compounding cost increase of all Smithy materials by 20% (from x50 per Smithy purchased to x40)."
		},
		biggerbetterheirlooms: {
			description: "Allows you to spend an additional 10% of your total earned Nullifium on all of your Heirlooms."
		},
		justdam: {
			description: "Provides no bonus other than damage. Will some day evolve into a more powerful boost!"
		},
		SADailies: {
			get description(){
				var cleared = autoBattle.maxEnemyLevel - 1;
				return "Your Trimps gain +4% Attack and +0.25% Crit Chance per Spire Assault level cleared while on a Daily Challenge. You have cleared " + cleared + " SA levels, granting +" + prettify((this.attackMod() - 1) * 100) + "% Attack and +" + prettify(this.critChance() * 100) + "% Crit Chance on Daily Challenges." 
			},
			critChance: function(){
				return (0.0025 * (autoBattle.maxEnemyLevel - 1));
			},
			attackMod: function(){
				return 1 + (0.04 * (autoBattle.maxEnemyLevel - 1));
			}
		},

		//Cruffys
		cruf1: {
			description: "Multiplies Radon earned by 1.5."
		},
		cruf2: {
			description: "Multiplies Radon earned by 2, and grants 5% increased health and attack to your Trimps."
		},
		cruf3: {
			description: "Multiplies Radon earned by 2.5, and increases all looted or gathered resources by 15%."
		},
		cruf4: {
			description: "Multiplies Radon earned by 3, and grants 20% Void Map Drop Chance."
		},
		cruf5: {
			description: "Grants 35% Crit Chance and adds 50% to base Crit Damage."
		},
		cruf6: {
			description: "Multiplies Radon earned by 1.75, and increases Cruffys' Trimp health and attack bonuses by 10%."
		},
		cruf7: {
			description: "Multiplies Radon earned by 2, and adds 25% to the Level 3 Resource bonus."
		},
		cruf8: {
			description: "Multiplies Radon earned by 1.1, and Cruffys will stick around for 5 Zones after Nurture ends, granting all non-Radon bonuses."
		},
		cruf9: {
			description: "Multiplies Radon earned by 1.1, and increases Cruffys' Trimp attack, health, and resource bonuses by an additional 20%. Cruffys will stay in your Universe for 5 additional Zones after Nurture ends."
		},
		cruf10: {
			get description(){
				var text = "Multiplies Radon earned by 1.04, and increases Cruffys' Trimp attack, health, and resource bonuses by an additional 10%. Cruffys will stay in your Universe for 1 additional Zone after Nurture ends for every 2 levels earned (11, 13, 15 etc). This is repeatable up to 10 times to a max level of 19."
				var level = game.challenges.Nurture.getLevel();
				if (level > 10){
					var stick = Math.floor((level - 9) / 2);
					text += "<br/><br/><b>Currently multiplying Radon earned by " + prettify(Math.pow(1.04, (level - 9))) + ", increasing attack, health and resources by " + prettify((level - 9) * 10) + "% and Cruffys will stay for " + stick + " additional Zone" + needAnS(stick) + ".</b>";
				}
				return text;
			}
		}
	}
}
