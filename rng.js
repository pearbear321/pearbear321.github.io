var save
var game = newGame()
var lowUniverse = 1
var highUniverse = 1
var maxSpire = 0
var badMods = []
var filter = false
var manualRarity = 0

// only thing from spire assault that gets used
var autoBattle = { oneTimers: { Nullicious: { owned: false } } }

// flag that createHeirloom checks
var heirloomsShown = false

// Input for save
document.getElementById("saveInput").addEventListener("paste", (event) => {
  onSavePaste(event)
})

document.getElementById("highZoneText").addEventListener("change", (event) => {
  buildModsDropChecks()
  updateManualRarities()
})

document
  .getElementById("heirloomSearchButton")
  .addEventListener("click", (event) => {
    searchForHeirloom(event)
  })

document
  .getElementById("lowNextFiveButton")
  .addEventListener("click", (event) => {
    nextFiveHeirlooms(event, 0)
  })

document
  .getElementById("lowNextFiveMaxButton")
  .addEventListener("click", (event) => {
    nextFiveMaxHeirlooms(event, false)
  })

document
  .getElementById("highNextFiveButton")
  .addEventListener("click", (event) => {
    nextFiveHeirlooms(event, 1)
  })

document
  .getElementById("highNextFiveMaxButton")
  .addEventListener("click", (event) => {
    nextFiveMaxHeirlooms(event, true)
  })

document.getElementById("filter").addEventListener("change", (event) => {
  showFilter(event)
})

document
  .getElementById("searchRarityManualInput")
  .addEventListener("change", (event) => {
    showRarityInput(event)
  })

function onSavePaste(event) {
  let paste = event.clipboardData.getData("text")
  save = JSON.parse(LZString.decompressFromBase64(paste))

  game.global.universe = save.global.universe
  game.global.lastSpireCleared = save.global.lastSpireCleared

  document.getElementsByName("low")[game.global.universe - 1].checked =
    "checked"
  document.getElementsByName("high")[game.global.universe - 1].checked =
    "checked"

  lowUniverse = game.global.universe
  highUniverse = game.global.universe

  // set seeds
  game.global.heirloomBoneSeed = save.global.heirloomBoneSeed
  game.global.heirloomSeed = save.global.heirloomSeed
  game.global.bestHeirloomSeed = save.global.bestHeirloomSeed
  game.global.coreSeed = save.global.coreSeed

  // resources to not be zero to get correct resource for quest
  game.resources.food = 1
  game.resources.wood = 1
  game.resources.metal = 1
  game.resources.science = 1
  game.resources.gems = 1

  // set fluffy
  game.global.fluffyPrestige = save.global.fluffyPrestige
  game.global.fluffyExp = save.fluffyExp
  game.portal.Capable.level = save.portal.Capable.level
  Fluffy.calculateLevel()

  // heirlooms can't have crit unless relentlessness is unlocked
  game.portal.Relentlessness.locked = save.portal.Relentlessness.locked

  // prevents some code that won't work from running
  game.stats.totalHeirlooms.value = 1
}

function setLowUniverse(ele) {
  lowUniverse = parseInt(ele.value)
}

function setHighUniverse(ele) {
  highUniverse = parseInt(ele.value)
  buildModsDropChecks()
  updateManualRarities()
}

function setMaxSpire(value) {
  maxSpire = value
}

function setManualRarity(value) {
  manualRarity = value
  buildModsDropChecks()
}

function searchForHeirloom(event) {
  let low = parseInt(document.getElementById("lowZoneText").value)
  let high = parseInt(document.getElementById("highZoneText").value)

  //find max rarity
  game.global.universe = highUniverse
  let rarity = getHeirloomRarityRanges(high).length - 1

  if (!!document.getElementById("searchRarityManualInput").checked) {
    rarity = manualRarity
  }

  let heirloom

  game.global.heirloomSeed = save.global.heirloomSeed

  game.global.universe = lowUniverse
  let j = game.global.lastSpireCleared + 1
  if (lowUniverse == 1) {
    for (; 100 * (j + 1) < low && j <= maxSpire; j++) spireHeirloom(j)
  }

  let tempj = j
  let tempSeed = game.global.heirloomSeed

  let count = 0
  for (let i = 0; i < 1000 && count < 5; i++) {
    if (highUniverse == 1) {
      for (; 100 * (j + 1) < high && j <= maxSpire; j++) spireHeirloom(j)
    }
    game.global.universe = highUniverse
    heirloom = findNextHeirloom(high, rarity, 30)

    if (heirloom) {
      document.getElementById("heirloom" + count).innerText =
        "Low: " +
        i +
        " High: " +
        heirloom.ahead +
        "\n" +
        heirloomToString(heirloom)
      count++
    }

    game.global.heirloomSeed = tempSeed
    game.global.universe = lowUniverse
    createHeirloom(low)

    tempSeed = game.global.heirloomSeed
    j = tempj
  }

  cleanupStoredHeirlooms()
}

function heirloomToString(heirloom) {
  let text = ""
  text += heirloom.name + "\n"

  let modName = ""
  let modPercent = ""

  for (let i = 0; i < heirloom.mods.length; i++) {
    modName = game.heirlooms[heirloom.type][heirloom.mods[i][0]].name
    modPercent = heirloom.mods[i][1]
    text += modPercent + "% " + modName + "\n"
  }
  return text
}

function findNextHeirloom(zone, rarity, limit) {
  let heirloom
  for (let i = 1; i < limit; i++) {
    createHeirloom(zone)
    heirloom = game.global.heirloomsExtra[game.global.heirloomsExtra.length - 1]
    if (heirloom.rarity >= rarity)
      if (applyFilter(heirloom)) {
        heirloom.ahead = i
        return heirloom
      }
  }
  return false
}

function showFilter(event) {
  filter = !!document.getElementById("filter").checked
  if (filter) document.getElementById("dropdowns").removeAttribute("hidden")
  else document.getElementById("dropdowns").setAttribute("hidden", true)
}

function showRarityInput(event) {
  show = !!document.getElementById("searchRarityManualInput").checked
  if (show) document.getElementById("manualRarity").removeAttribute("hidden")
  else document.getElementById("manualRarity").setAttribute("hidden", true)
}

function updateManualRarities() {
  const zone = parseInt(document.getElementById("highZoneText").value)
  game.global.universe = highUniverse
  game.global.heirloomSeed = save.global.heirloomSeed

  const ranges = getHeirloomRarityRanges(zone)
  document.getElementById("manualRarityChoice").innerHTML =
    game.heirlooms.rarityNames
      .map((r, index) =>
        ranges.length <= index || ranges[index] == -1
          ? ""
          : '<option value="' + index + '">' + r + "</option>"
      )
      .join("\n")
      .trim()

  document.getElementById("manualRarityChoice").value = ranges.length - 1
  manualRarity = ranges.length - 1
}

function buildModsDropChecks() {
  badMods = []
  //find max rarity
  const zone = parseInt(document.getElementById("highZoneText").value)
  game.global.universe = highUniverse
  game.global.heirloomSeed = save.global.heirloomSeed
  let rarity = getHeirloomRarityRanges(zone).length - 1

  if (!!document.getElementById("searchRarityManualInput").checked) {
    rarity = manualRarity
  }

  //get list of eligible mods
  var type = document.getElementById("type").value
  var eligible = []
  for (var item in game.heirlooms[type]) {
    var heirloom = game.heirlooms[type][item]
    if (item == "empty" && (rarity == 0 || rarity == 1)) continue
    if (heirloom.minTier && rarity < heirloom.minTier) continue
    if (heirloom.maxTier && rarity > heirloom.maxTier) continue
    if (typeof heirloom.filter !== "undefined" && !heirloom.filter()) continue
    if (heirloom.steps && heirloom.steps[rarity] === -1) continue
    eligible.push(item)
  }

  var ele = document.getElementById("modifiers")
  ele.innerHTML = ""
  for (let i = 0; i < eligible.length; i++) {
    ele.innerHTML +=
      '<input type="checkbox" id=checkbox' +
      i +
      ' onclick="updateBadMods(this)" value="' +
      eligible[i] +
      '">' +
      eligible[i] +
      "&nbsp;"
  }
}

function updateBadMods(ele) {
  if (ele.checked) badMods.push(ele.value)
  else badMods = badMods.filter((e) => e != ele.value)
  console.log(badMods)
}

function applyFilter(heirloom) {
  if (!filter) return true
  if (heirloom.type != document.getElementById("type").value) return false

  for (let i = 0; i < heirloom.mods.length; i++)
    for (let j = 0; j < badMods.length; j++)
      if (heirloom.mods[i][0] == badMods[j]) return false

  return true
}

function nextFiveMaxHeirlooms(event, high) {
  let zone = high
    ? parseInt(document.getElementById("highZoneText").value)
    : parseInt(document.getElementById("lowZoneText").value)

  var universe = (high
    ? document.getElementsByName("high")
    : document.getElementsByName("low"))[0].checked
    ? 1
    : 2
  if (high) {
    highUniverse = universe
    game.global.universe = universe
  } else {
    lowUniverse = universe
    game.global.universe = universe
  }

  game.global.heirloomSeed = save.global.heirloomSeed
  let rarity = getHeirloomRarityRanges(zone).length - 1

  if (!!document.getElementById("searchRarityManualInput").checked) {
    rarity = manualRarity
  }

  if (game.global.universe == 1) {
    for (
      let j = game.global.lastSpireCleared + 1;
      100 * (j + 1) < zone && j <= maxSpire;
      j++
    )
      spireHeirloom(j)
  }

  let count = 0
  let failed = false
  for (let i = 0; i < 5; i++) {
    if (failed) {
      document.getElementById("heirloom" + i).innerText = ""
      continue
    }

    heirloom = findNextHeirloom(zone, rarity, 100)
    if (heirloom) {
      count += heirloom.ahead
      document.getElementById("heirloom" + i).innerText =
        count + " ahead" + "\n" + heirloomToString(heirloom)
    } else {
      document.getElementById("heirloom" + i).innerText =
        "Could not find max rarity heirloom looking 100 ahead"
      failed = true
    }
  }

  cleanupStoredHeirlooms()
}

function nextFiveHeirlooms(event, high) {
  const zone = high
    ? parseInt(document.getElementById("highZoneText").value)
    : parseInt(document.getElementById("lowZoneText").value)

  game.global.heirloomSeed = save.global.heirloomSeed
  game.global.universe = high ? highUniverse : lowUniverse

  if (game.global.universe == 1) {
    for (
      let j = game.global.lastSpireCleared + 1;
      100 * (j + 1) < zone && j <= maxSpire;
      j++
    )
      spireHeirloom(j)
  }

  let count = 0
  let heirloom

  for (let i = 0; i < 5; i++) {
    createHeirloom(zone)
    heirloom = game.global.heirloomsExtra[game.global.heirloomsExtra.length - 1]
    document.getElementById("heirloom" + i).innerText =
      i + 1 + " ahead" + "\n" + heirloomToString(heirloom)
  }

  cleanupStoredHeirlooms()
}

function cleanupStoredHeirlooms() {
  game.global.heirloomsExtra = []
}
