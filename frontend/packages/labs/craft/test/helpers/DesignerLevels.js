const baseGroundPlane = ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirt", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt"];
const baseDecorationPlane = ["", "", "tallGrass", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "tallGrass", ""];
const baseActionPlane = ["grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass"];

const houseGroundPlane = ["grass", "grass", "grass", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass"];
const houseDecorationPlane = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "flowerOxeeye", "flowerOxeeye", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerOxeeye", "flowerOxeeye"];
const houseActionPlane = ["grass", "grass", "bricks", "", "", "", "bricks", "grass", "grass", "grass", "grass", "", "bricks", "bricks", "door", "bricks", "bricks", "", "grass", "grass", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "treeSpruce", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "treeSpruce", "", "", "grass", "grass", "grass", "", "", "", "", "", "", ""];

const fourChickens = [["chicken", 3, 3, 1], ["chicken", 6, 3, 1], ["chicken", 3, 6, 1], ["chicken", 6, 6, 1]];

module.exports = {
  designer01: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: [["chicken", 4, 4, 1]],
    usePlayer: false,
    levelVerificationTimeout: 5000,
    timeoutResult: verificationAPI => (
      verificationAPI.getCommandExecutedCount("moveForward") >= 1 &&
      verificationAPI.getCommandExecutedCount("turn") >= 1
    ),
    verificationFunction: verificationAPI => (
      !verificationAPI.isEntityTypeRunning("chicken") &&
      verificationAPI.getCommandExecutedCount("moveForward") >= 1 &&
      verificationAPI.getCommandExecutedCount("turn") >= 1
    ),
  },
  designer02: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: fourChickens,
    usePlayer: false,
    levelVerificationTimeout: 5000,
    timeoutResult: verificationAPI => (
      verificationAPI.getRepeatCommandExecutedCount("moveForward") > 0
    ),
    verificationFunction: () => false,
  },
  designer03: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: fourChickens,
    usePlayer: false,
    levelVerificationTimeout: 7000,
    timeoutResult: verificationAPI => (
      verificationAPI.getCommandExecutedCount("turnRandom") >= 1 ||
      verificationAPI.getRepeatCommandExecutedCount("turnRandom") >= 1
    ),
    verificationFunction: () => false,
  },
  designer04: {
    isEventLevel: true,
    groundPlane: houseGroundPlane,
    groundDecorationPlane: houseDecorationPlane,
    actionPlane: houseActionPlane,
    usePlayer: true,
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    levelVerificationTimeout: 20000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => (
      verificationAPI.isEntityOnBlocktype("Player", "planksOak")
    ),
  },
  designer05: {
    isEventLevel: true,
    groundPlane: houseGroundPlane,
    groundDecorationPlane: houseDecorationPlane,
    actionPlane: houseActionPlane,
    entities: [["sheep", 6, 3, 1]],
    usePlayer: true,
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    levelVerificationTimeout: 20000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => (
      verificationAPI.getInventoryAmount("all") >= 1
    ),
  },
  designer06: {
    isEventLevel: true,
    groundPlane: ["dirt", "dirt", "dirtCoarse", "dirt", "gravel", "dirtCoarse", "water", "water", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "water", "water", "dirt", "dirt", "dirt", "dirtCoarse", "grass", "grass", "grass", "dirtCoarse", "water", "water", "dirt", "dirt", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "stone", "", "stone", "stone", "", "", "", "stone", "stone", "stone", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "stone", "", "", "", "stone", "", "", "", "", "", "stone", "stone", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "", "", "", "stone", "", "", "", "stone", "", "", "", "", "grass", "stone", "", "", "stone", "stone", "", "", "", "grass", "grass"],
    entities: [["cow", 6, 1, 1], ["cow", 1, 2, 1]],
    usePlayer: true,
    playerStartPosition: [5, 6],
    playerStartDirection: 2,
    levelVerificationTimeout: 60000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => {
      const grassPositions = [[6, 6], [7, 6], [8, 6], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [6, 8], [7, 8], [8, 8], [9, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9]];
      let cowOnGrassCount = 0;
      for (let i = 0; i < grassPositions.length; i++) {
        if (verificationAPI.isEntityAt("cow", grassPositions[i])) {
          cowOnGrassCount++;
        }
      }
      return cowOnGrassCount >= 2;
    },
  },
  designer07: {
    isEventLevel: true,
    isDaytime: false,
    groundPlane: ["stone", "stone", "stone", "stone", "lava", "lava", "stone", "grass", "grass", "grass", "stone", "stone", "stone", "stone", "lava", "lava", "stone", "grass", "grass", "grass", "stone", "stone", "stone", "stone", "stone", "lava", "stone", "grass", "grass", "grass", "gravel", "stone", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "stone", "stone", "gravel", "gravel", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "dirtCoarse", "stone", "gravel", "gravel", "stone", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "stone", "gravel", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "lava", "stone", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "lava", "lava", "stone", "gravel", "stone", "stone", "stone", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "lavaPop", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "lavaPop", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "stone", "", "", "stone", "stone", "stone", "oreCoal", "stone", "stone", "oreCoal", "stone", "", "", "", "", "stone", "stone", "stone", "", "stone", "", "", "", "", "", "stone", "stone", "", "treeBirch", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "stone", "stone", "stone", "", "", "", "", "", "", "stone", "stone", "stone", "stone", "stone", "", "", "", "", "", "stone", "stone", "stone", "oreDiamond", "stone", "stone"],
    entities: [["sheep", 8, 4, 1], ["creeper", 2, 8, 1]],
    usePlayer: true,
    playerStartPosition: [3, 1],
    playerStartDirection: 2,
    levelVerificationTimeout: 60000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => {
      const successPositions = [[7, 4] , [7, 5]];
      for (let i = 0; i < successPositions.length; i++) {
        if (verificationAPI.isEntityAt("Player" , successPositions[i])) {
          return true;
        }
      }
    },
  },
  designer08: {
    isEventLevel: true,
    isDaytime: false,
    groundPlane: ["grass", "dirt", "dirt", "dirt", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "grass", "dirt", "dirt", "bricks", "bricks", "bricks", "bricks", "bricks", "grass", "grass", "grass", "grass", "dirt", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "planksSpruce", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "gravel", "grass", "grass", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "gravel", "grass", "dirt", "dirt", "dirt"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "tallGrass", "", "tallGrass", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "bricks", "bricks", "glass", "bricks", "bricks", "", "", "", "", "", "bricks", "", "", "", "bricks", "", "", "", "", "", "glass", "", "torch", "", "glass", "", "", "", "", "", "bricks", "", "", "", "bricks", "", "", "", "", "", "bricks", "bricks", "door", "bricks", "bricks", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    entities: [["zombie", 5, 7, 1], ["ironGolem", 5, 9, 1]],
    usePlayer: true,
    playerStartPosition: [5, 3],
    playerStartDirection: 2,
    levelVerificationTimeout: -1,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => verificationAPI.isEntityDied("zombie", 1),
  },
  designer09: {
    isEventLevel: true,
    groundPlane: ["dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "stone", "dirt", "dirt", "stone", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "stone", "dirt", "dirt", "stone", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "grass", "grass", "grass"],
    usePlayer: true,
    playerStartPosition: [4, 8],
    playerStartDirection: 0,
    levelVerificationTimeout: 60000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => (
      (verificationAPI.getEntityCount("all") >= 1 && !verificationAPI.isEntityTypeRunning("all")) ||
      verificationAPI.isEntityDied("zombie") ||
      verificationAPI.isEntityDied("creeper")
    ),
  },
};
