module.exports = {
  adventurer01: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","flowerRose","","","tallGrass","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerRose","","","","","","","",""],
    actionPlane: ["grass","grass","","","","","","","grass","grass","grass","grass","","","","","","","","grass","grass","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","",""],
    entities: [['sheep', 6, 4, 1]],
    playerStartPosition: [3, 4],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.isPlayerNextTo("sheep"),
  },
  adventurer02: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","","","","grass","grass","grass","grass","grass","grass","","","","","","","","","grass","grass","","","","","","","","","grass","grass","","","","","","","","","grass","grass","","","treeSpruce","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","grass","grass","grass","grass","","","","","","","grass","grass"],
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.countOfTypeOnMap("treeSpruce") === 0,
  },
  adventurer03: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","dirt","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt"],
    groundDecorationPlane: ["","","","","","","","","","","","flowerRose","","","tallGrass","","","","","","","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","flowerDandelion","","","","","","","","","tallGrass","","","","tallGrass","","tallGrass","flowerRose","","","","","tallGrass",""],
    actionPlane: ["grass","grass","grass","grass","","","","","","","","","grass","grass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","","treeOak","","","","","","","","grass","","","","","","","","",""],
    entities: [["sheep", 5, 3, 3], ["sheep", 4, 5, 3]],
    playerStartPosition: [2, 3],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("wool") >= 2,
  },
  adventurer04: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","flowerOxeeye","","","","","","","","","flowerDandelion","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","flowerRose","","tallGrass","tallGrass","","","","","","tallGrass","","flowerOxeeye"],
    actionPlane: ["","grass","grass","grass","grass","grass","grass","grass","grass","grass","","","","","grass","grass","grass","grass","grass","grass","","","","","","","","","","","","","","","","","treeSpruce","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [3, 7],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("planksBirch") === 1 &&
      verificationAPI.getInventoryAmount("planksSpruce") === 1 &&
      verificationAPI.getInventoryAmount("planksOak") === 1,
  },
  adventurer05: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirtCoarse","dirtCoarse","dirtCoarse","dirtCoarse","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","flowerOxeeye","tallGrass","","","","","","","","","tallGrass","tallGrass","flowerDandelion","","","","","","","","","flowerDandelion","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","","tallGrass","","",""],
    actionPlane: ["grass","grass","","","","","","","grass","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [6, 6],
    playerStartDirection: 3,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer06: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","planksBirch","planksBirch","planksBirch","planksBirch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [3, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "any", "", "", "any", "", "", "",
        "", "", "", "any", "", "", "any", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer07: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","dirt","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["flowerOxeeye","tallGrass","","","","tallGrass","","","flowerDandelion","tallGrass","tallGrass","tallGrass","flowerDandelion","","","","","","","flowerDandelion","","flowerDandelion","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","","","","","tallGrass","","","","","","","","","tallGrass","flowerDandelion","tallGrass","","","","","","","","tallGrass","tallGrass"],
    actionPlane: ["","","grass","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","grass","","","","","",""],
    entities: [["sheep", 8, 2, 3], ["sheep", 2, 6, 3]],
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer08: {
    isDaytime: false,
    groundPlane: ["grass","grass","grass","planksBirch","grass","grass","planksBirch","grass","grass","grass","grass","grass","grass","planksBirch","planksBirch","planksBirch","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","planksBirch","","","planksBirch","","","","","","torch","planksBirch","","planksBirch","planksBirch","","","","","","","","","","","","","","","","","","","torch","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","grass","","","","","","","","grass","grass","grass"],
    entities: [["creeper", 2, 2, 2], ["creeper", 4, 3, 2], ["creeper", 3, 4, 2], ["creeper", 5, 5, 2], ["creeper", 7, 3, 2], ["creeper", 7, 5, 2], ["creeper", 6, 7, 2], ["creeper", 9, 4, 2]],
    playerStartPosition: [2, 6],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.isPlayerAt([4, 1]) ||
      verificationAPI.isPlayerAt([4, 2]) ||
      verificationAPI.isPlayerAt([4, 0]) ||
      verificationAPI.isPlayerAt([5, 0]),
  },
  adventurer09: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","","oreCoal","oreCoal","oreCoal","stone","oreCoal","stone","stone","stone","","","","","","","stone","stone","stone","stone","","","","","","","oreCoal","stone","stone","stone","","stone","","","","","oreCoal","stone","stone","stone","stone","stone","oreCoal","oreCoal","","","stone","","","stone","stone","stone","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone"],
    playerStartPosition: [5, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreCoal") >= 2 &&
      verificationAPI.countOfTypeOnMap("torch") >= 2,
  },
  adventurer10: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","lava","stone","stone","lava","lava","lava","lava","lava","lava","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","torch","","","","","","","","","","lavaPop","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","","","","","","","","","stone","","","","","","","","","","","stone","stone","stone","","","","","","stone","stone","","","","","","stone","stone","","stone","stone","stone","","","","","","","","stone","stone","stone","stone","","","","","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [3, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreIron") >= 2,
  },
  adventurer11: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","lava","stone","stone","lava","stone","stone","lava","stone","lava","stone","stone","lava","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","stone","stone","oreCoal","oreCoal","stone","oreIron","oreIron","stone","stone","","","","","","","","","","stone","","","","","","stone","","stone","stone","stone","stone","","","stone","","","","stone","stone","stone","stone","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [1, 4],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.countOfTypeOnMap("oreIron") === 0 &&
      verificationAPI.countOfTypeOnMap("oreCoal") === 0,
  },
  adventurer12: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","lava","lava","lava","lava","stone","lava","stone","stone","stone","stone","lava","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","lava","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","oreRedstone","oreDiamond","stone","oreRedstone","stone","stone","stone","","","oreRedstone","","","oreRedstone","oreRedstone","stone","stone","stone","","","","","","","oreDiamond","stone","stone","","","","","","","","stone","stone","stone","","","","","","","oreRedstone","stone","stone","stone","","","","stone","stone","stone","oreRedstone","stone","stone","stone","","","","","","","","","stone","stone","","","","","","","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [3, 5],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreRedstone") >= 3,
  },
  adventurer13: {
    specialLevelType: "minecart",
    gridDimensions: [12, 10],
    groundPlane: ["grass","grass","planksBirch","grass","grass","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","planksBirch","planksBirch","planksBirch","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","dirt","water","water","grass","grass","grass","grass","grass","grass","grass","grass","water","dirt","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","dirt","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["tallGrass","tallGrass","","","","","","tallGrass","","","","","","flowerOxeeye","","","","","tallGrass","","","","tallGrass","","","","","","","","","","tallGrass","flowerDandelion","","","","tallGrass","","","","","","","","","","","tallGrass","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","tallGrass","flowerRose","",""],
    actionPlane: ["","","planksBirch","","","planksBirch","","","","","","","","","planksBirch","","planksBirch","planksBirch","","","","","","","","","railsRedstoneTorch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","railsEast","railsWest","treeBirch","","","","","","","","","","","","","","","","","","","","","","",""],
    fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [9, 7],
    playerStartDirection: 2,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsNorthEast", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsWest",
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer14: {
    specialLevelType: "freeplay",
    gridDimensions: [20, 20],
    groundPlane: ["grass","grass","grass","grass","dirt","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","water","water","water","water","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","water","water","grass","grass","grass","grass","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","dirt","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","dirt","grass","water","grass","grass","grass","water","water","water","water","water","water","water","stone","lava","lava","lava","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","dirt","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["oreLapis","oreLapis","stone","stone","stone","stone","stone","oreIron","oreIron","","oreRedstone","oreRedstone","oreRedstone","stone","","stone","stone","oreIron","oreGold","oreGold","oreLapis","oreCoal","","stone","oreIron","oreIron","","stone","","","stone","oreRedstone","stone","stone","","","","stone","stone","oreGold","oreCoal","stone","","","","","","","","","","stone","","stone","","","","","","","stone","","","","","","treeOak","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","treeSpruce","","","","","","","","","oreIron","","","","","","","","","","","","","","treeOak","","","","","","stone","oreIron","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","treeBirch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","oreDiamond","","","","","","","","treeSpruce","","","","","","","","","","","oreDiamond","oreDiamond","","","","","","","","","","","","","","","","","","","oreEmerald","oreLapis"],
    fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    entities: [["sheep", 0, 18, 1], ["sheep", 1, 14, 1], ["sheep", 2, 17, 1], ["sheep", 3, 15, 1], ["sheep", 4, 18, 1]],
    playerStartPosition: [10, 10],
    playerStartDirection: 0,
    verificationFunction: () => true,
  },
};
