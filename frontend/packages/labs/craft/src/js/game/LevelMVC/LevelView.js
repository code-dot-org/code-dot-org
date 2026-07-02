import Phaser from 'phaser';

import { createEvent } from '../../utils';
import Boat from '../Entities/Boat';

import FacingDirection from './FacingDirection';
import LevelBlock from './LevelBlock';
import Position from './Position';
import { randomInt, generateFrameNames } from './Utils';



export default class LevelView {
  constructor(controller) {
    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;

    this.baseShading = null;
    this.prismarinePhase = 0;

    this.uniforms = {
      time: {type: '1f', value: 0},
      surface: {type: 'sampler2D', value: null},
      tint: {type: '4fv', value: [67 / 255, 213 / 255, 238 / 255, 1]},
      x: {type: '1f', value: 0},
      y: {type: '1f', value: 0},
    };
    // TODO(phaser4-filter): the aquatic underwater "wave" shader was a CE
    // Phaser.Filter applied to game.world. Port the GLSL to a Phaser 4
    // camera Filter (Phaser.Filters). Visual-only; gameplay unaffected.
    this.waveShader = null;

    this.player = null;
    this.agent = null;
    this.selectionIndicator = null;

    this.groundGroup = null;
    this.shadingGroup = null;
    this.actionGroup = null;
    this.fluffGroup = null;
    this.fowGroup = null;
    this.collectibleItems = [];
    //{sprite : sprite, type : blockType, position : [x,y]}
    this.trees = [];

    this.miniBlocks = {
      bed: "bed",
      boat: "boat",
      bookEnchanted: "book_enchanted",
      bricks: "bricks",
      bucketEmpty: "bucket_empty",
      bucketLava: "bucket_lava",
      milk: "bucket_milk",
      bucketWater: "bucket_water",
      cactus: "cactus",
      carrots: "carrot",
      chest: "chest",
      clay: "clay_ball",
      coal: "coal",
      dirtCoarse: "coarse_dirt",
      cobblestone: "cobblestone",
      compass: "compass",
      blackConcrete: "concrete_black",
      blueConcrete: "concrete_blue",
      brownConcrete: "concrete_brown",
      blackConcretePowder: "concrete_powder_black",
      blueConcretePowder: "concrete_powder_blue",
      brownConcretePowder: "concrete_powder_brown",
      deadbush: "deadbush",
      diamond: "diamond",
      axeDiamond: "diamond_axe",
      pickaxeDiamond: "diamond_pickaxe",
      shovelDiamond: "diamond_shovel",
      dirt: "dirt",
      door: "door",
      doorIron: "door_iron",
      egg: "egg",
      emerald: "emerald",
      flint: "flint",
      flintAndSteel: "flint_and_steel",
      daisy: "flower_daisy",
      dandelion: "flower_dandelion",
      poppy: "flower_rose",
      glowstoneDust: "glowstone_dust",
      ingotGold: "gold_ingot",
      gravel: "gravel",
      gunPowder: "gunpowder",
      hardenedClay: "hardend_clay",
      hardenedClayBlack: "hardened_clay_stained_black",
      hardenedClayBlue: "hardened_clay_stained_blue",
      hardenedClayBrown: "hardened_clay_stained_brown",
      hardenedClayCyan: "hardened_clay_stained_cyan",
      hardenedClayGray: "hardened_clay_stained_gray",
      hardenedClayGreen: "hardened_clay_stained_green",
      hardenedClayLightBlue: "hardened_clay_stained_light_blue",
      hardenedClayLime: "hardened_clay_stained_lime",
      hardenedClayMagenta: "hardened_clay_stained_magenta",
      hardenedClayOrange: "hardened_clay_stained_orange",
      hardenedClayPink: "hardened_clay_stained_pink",
      hardenedClayPurple: "hardened_clay_stained_purple",
      hardenedClayRed: "hardened_clay_stained_red",
      hardenedClaySilver: "hardened_clay_stained_silver",
      hardenedClayWhite: "hardened_clay_stained_white",
      hardenedClayYellow: "hardened_clay_stained_yellow",
      heartofthesea: "heartofthesea_closed",
      ingotIron: "iron_ingot",
      lapisLazuli: "lapis_lazuli",
      logAcacia: "log_acacia",
      logBirch: "log_birch",
      logJungle: "log_jungle",
      logOak: "log_oak",
      logSpruce: "log_spruce",
      mapEmpty: "map_empty",
      minecart: "minecart_normal",
      nautilus: "nautilus",
      netherbrick: "netherbrick",
      netherrack: "netherrack",
      obsidian: "obsidian",
      piston: "piston",
      planksAcacia: "planks_acacia",
      planksBirch: "planks_birch",
      planksJungle: "planks_jungle",
      planksOak: "planks_oak",
      planksSpruce: "planks_spruce",
      potato: "potato",
      potion: "potion_bottle_drinkable",
      pressurePlateOak: "pressure_plate_oak",
      prismarine: "prismarine",
      quartzOre: "quartz",
      railGolden: "rail_golden",
      railNormal: "rail_normal",
      redstoneDust: "redstone_dust",
      redstoneTorch: "redstone_torch",
      reeds: "reeds",
      sand: "sand",
      sandstone: "sandstone",
      seaPickles: "sea_pickle",
      seedsWheat: "seeds_wheat",
      snow: "snow",
      snowBall: "snowball",
      tnt: "tnt",
      torch: "torch",
      turtle: "turtle",
      cropWheat: "wheat",
      wool_black: "wool_colored_black",
      wool_blue: "wool_colored_blue",
      wool_brown: "wool_colored_brown",
      wool_cyan: "wool_colored_cyan",
      wool_gray: "wool_colored_gray",
      wool_green: "wool_colored_green",
      wool_light_blue: "wool_colored_light_blue",
      wool_lime: "wool_colored_lime",
      wool_magenta: "wool_colored_magenta",
      wool_orange: "wool_colored_orange",
      wool_pink: "wool_colored_pink",
      wool_purple: "wool_colored_purple",
      wool_red: "wool_colored_red",
      wool_silver: "wool_colored_silver",
      wool: "wool_colored_white",
      wool_yellow: "wool_colored_yellow",
    };

    this.blocks = {
      "bedrock": ["blocks", "Bedrock", -13, 0],
      "bricks": ["blocks", "Bricks", -13, 0],
      "oreCoal": ["blocks", "Coal_Ore", -13, 0],
      "dirtCoarse": ["blocks", "Coarse_Dirt", -13, 0],
      "cobblestone": ["blocks", "Cobblestone", -13, 0],
      "oreDiamond": ["blocks", "Diamond_Ore", -13, 0],
      "dirt": ["blocks", "Dirt", -13, 0],
      "oreEmerald": ["blocks", "Emerald_Ore", -13, 0],
      "farmlandWet": ["blocks", "Farmland_Wet", -13, 0],
      "flowerDandelion": ["blocks", "Flower_Dandelion", -13, 0],
      "flowerOxeeye": ["blocks", "Flower_Oxeeye", -13, 0],
      "flowerRose": ["blocks", "Flower_Rose", -13, 0],
      "glass": ["blocks", "Glass", -13, 0],
      "oreGold": ["blocks", "Gold_Ore", -13, 0],
      "grass": ["blocks", "Grass", -13, 0],
      "gravel": ["blocks", "Gravel", -13, 0],
      "oreIron": ["blocks", "Iron_Ore", -13, 0],
      "oreLapis": ["blocks", "Lapis_Ore", -13, 0],
      "lava": ["blocks", "Lava_0", -13, 0],
      "logAcacia": ["blocks", "Log_Acacia", -13, 0],
      "logBirch": ["blocks", "Log_Birch", -13, 0],
      "logJungle": ["blocks", "Log_Jungle", -13, 0],
      "logOak": ["blocks", "Log_Oak", -13, 0],
      "logSpruce": ["blocks", "Log_Spruce", -13, 0],
      "logSpruceSnowy": ["blocks", "Log_Spruce", -13, 0],
      "obsidian": ["blocks", "Obsidian", -13, 0],
      "planksAcacia": ["blocks", "Planks_Acacia", -13, 0],
      "planksBirch": ["blocks", "Planks_Birch", -13, 0],
      "planksJungle": ["blocks", "Planks_Jungle", -13, 0],
      "planksOak": ["blocks", "Planks_Oak", -13, 0],
      "planksSpruce": ["blocks", "Planks_Spruce", -13, 0],
      "oreRedstone": ["blocks", "Redstone_Ore", -13, 0],
      "sand": ["blocks", "Sand", -13, 0],
      "sandstone": ["blocks", "Sandstone", -13, 0],
      "stone": ["blocks", "Stone", -13, 0],
      "tnt": ["tnt", "TNTexplosion0", -80, -58],
      "water": ["blocks", "Water_0", -13, 0],
      "wool": ["blocks", "Wool_White", -13, 0],
      "wool_orange": ["blocks", "Wool_Orange", -13, 0],
      "wool_black": ["blocks", "Wool_Black", -13, 0],
      "wool_blue": ["blocks", "Wool_Blue", -13, 0],
      "wool_brown": ["blocks", "Wool_Brown", -13, 0],
      "wool_cyan": ["blocks", "Wool_Cyan", -13, 0],
      "wool_gray": ["blocks", "Wool_Gray", -13, 0],
      "wool_green": ["blocks", "Wool_Green", -13, 0],
      "wool_light_blue": ["blocks", "Wool_LightBlue", -13, 0],
      "wool_lime": ["blocks", "Wool_Lime", -13, 0],
      "wool_magenta": ["blocks", "Wool_Magenta", -13, 0],
      "wool_pink": ["blocks", "Wool_Pink", -13, 0],
      "wool_purple": ["blocks", "Wool_Purple", -13, 0],
      "wool_red": ["blocks", "Wool_Red", -13, 0],
      "wool_silver": ["blocks", "Wool_Silver", -13, 0],
      "wool_yellow": ["blocks", "Wool_Yellow", -13, 0],

      "leavesAcacia": ["leavesAcacia", "Leaves_Acacia0.png", -100, 0],
      "leavesBirch": ["leavesBirch", "Leaves_Birch0.png", -100, 0],
      "leavesJungle": ["leavesJungle", "Leaves_Jungle0.png", -100, 0],
      "leavesOak": ["leavesOak", "Leaves_Oak0.png", -100, 0],
      "leavesSpruce": ["leavesSpruce", "Leaves_Spruce0.png", -100, 0],
      "leavesSpruceSnowy": ["leavesSpruceSnowy", "Leaves_SpruceSnowy0.png", -100, 36],

      "watering": ["blocks", "Water_0", -13, 0],
      "cropWheat": ["blocks", "Wheat0", -13, 0],
      "torch": ["torch", "Torch0", -13, 0],

      "tallGrass": ["blocks", "TallGrass", -13, 0],

      "lavaPop": ["lavaPop", "LavaPop01", -13, 0],
      "redstoneSparkle": ["redstoneSparkle", "redstone_sparkle1.png", 7, 23],
      "fire": ["fire", "", -11, 135],
      "bubbles": ["bubbles", "", -11, 135],
      "explosion": ["explosion", "", -70, 60],

      "door": ["door", "", -12, -15],
      "doorIron": ["doorIron", "", -12, -15],

      "rails": ["blocks", "Rails_Vertical", -13, -0],
      "railsNorthEast": ["blocks", "Rails_BottomLeft", -13, 0],
      "railsNorthWest": ["blocks", "Rails_BottomRight", -13, 0],
      "railsEast": ["blocks", "Rails_Horizontal", -13, 0],
      "railsWest": ["blocks", "Rails_Horizontal", -13, 0],
      "railsEastWest": ["blocks", "Rails_Horizontal", -13, 0],
      "railsSouthEast": ["blocks", "Rails_TopLeft", -13, 0],
      "railsSouthWest": ["blocks", "Rails_TopRight", -13, 0],
      "railsNorth": ["blocks", "Rails_Vertical", -13, -0],
      "railsSouth": ["blocks", "Rails_Vertical", -13, -0],
      "railsNorthSouth": ["blocks", "Rails_Vertical", -13, -0],

      "railsUnpowered": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredNorth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredSouth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredNorthSouth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredEast": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredWest": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredEastWest": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],

      "railsPowered": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredNorth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredSouth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredNorthSouth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredEast": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredWest": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredEastWest": ["blocks", "Rails_PoweredHorizontal", -13, 0],

      "railsRedstoneTorch": ["blocks", "Rails_RedstoneTorch", -12, 9],

      "redstoneWire": ["blocks", "redstone_dust_dot_off", -13, 0],
      "redstoneWireHorizontal": ["blocks", "redstone_dust_line_h_off", -13, 0],
      "redstoneWireVertical": ["blocks", "redstone_dust_line_v_off", -13, 0],
      "redstoneWireUpRight": ["blocks", "redstone_dust_corner_BottomLeft_off", -13, 0],
      "redstoneWireUpLeft": ["blocks", "redstone_dust_corner_BottomRight_off", -13, 0],
      "redstoneWireDownRight": ["blocks", "redstone_dust_corner_TopLeft_off", -13, 0],
      "redstoneWireDownLeft": ["blocks", "redstone_dust_corner_TopRight_off", -13, 0],
      "redstoneWireTUp": ["blocks", "redstone_dust_cross_up_off", -13, 0],
      "redstoneWireTDown": ["blocks", "redstone_dust_cross_down_off", -13, 0],
      "redstoneWireTLeft": ["blocks", "redstone_dust_cross_left_off", -13, 0],
      "redstoneWireTRight": ["blocks", "redstone_dust_cross_right_off", -13, 0],
      "redstoneWireCross": ["blocks", "redstone_dust_cross_off", -13, 0],

      "redstoneWireOn": ["blocks", "redstone_dust_dot", -13, 0],
      "redstoneWireHorizontalOn": ["blocks", "redstone_dust_line_h", -13, 0],
      "redstoneWireVerticalOn": ["blocks", "redstone_dust_line_v", -13, 0],
      "redstoneWireUpRightOn": ["blocks", "redstone_dust_corner_BottomLeft", -13, 0],
      "redstoneWireUpLeftOn": ["blocks", "redstone_dust_corner_BottomRight", -13, 0],
      "redstoneWireDownRightOn": ["blocks", "redstone_dust_corner_TopLeft", -13, 0],
      "redstoneWireDownLeftOn": ["blocks", "redstone_dust_corner_TopRight", -13, 0],
      "redstoneWireTUpOn": ["blocks", "redstone_dust_cross_up", -13, 0],
      "redstoneWireTDownOn": ["blocks", "redstone_dust_cross_down", -13, 0],
      "redstoneWireTLeftOn": ["blocks", "redstone_dust_cross_left", -13, 0],
      "redstoneWireTRightOn": ["blocks", "redstone_dust_cross_right", -13, 0],
      "redstoneWireCrossOn": ["blocks", "redstone_dust_cross", -13, 0],

      "pressurePlateUp": ["blocks", "PressurePlate_Up", -13, 0],
      "pressurePlateDown": ["blocks", "PressurePlate_Down", -13, 0],

      "pistonUp": ["blocks", "piston_up", -13, 0],
      "pistonDown": ["blocks", "piston_down", -13, 0],
      "pistonLeft": ["blocks", "piston_left", -13, 0],
      "pistonRight": ["blocks", "piston_right", -13, 0],
      "pistonUpOn": ["blocks", "piston_base_up", -26, -13],
      "pistonDownOn": ["blocks", "piston_base_down", -26, -13],
      "pistonLeftOn": ["blocks", "piston_base_left", -26, -13],
      "pistonRightOn": ["blocks", "piston_base_right", -26, -13],

      "pistonArmLeft": ["blocks", "piston_arm_left", -26, -13],
      "pistonArmRight": ["blocks", "piston_arm_right", -26, -13],
      "pistonArmUp": ["blocks", "piston_arm_up", -26, -13],
      "pistonArmDown": ["blocks", "piston_arm_down", -26, -13],

      "pistonUpSticky": ["blocks", "piston_up", -13, 0],
      "pistonDownSticky": ["blocks", "piston_down_sticky", -13, 0],
      "pistonLeftSticky": ["blocks", "piston_left", -13, 0],
      "pistonRightSticky": ["blocks", "piston_right", -13, 0],
      "pistonUpOnSticky": ["blocks", "piston_base_up", -26, -13],
      "pistonDownOnSticky": ["blocks", "piston_base_down_sticky", -26, -13],
      "pistonLeftOnSticky": ["blocks", "piston_base_left", -26, -13],
      "pistonRightOnSticky": ["blocks", "piston_base_right", -26, -13],

      "pistonArmLeftSticky": ["blocks", "piston_arm_left", -26, -13],
      "pistonArmRightSticky": ["blocks", "piston_arm_right", -26, -13],
      "pistonArmUpSticky": ["blocks", "piston_arm_up", -26, -13],
      "pistonArmDownSticky": ["blocks", "piston_arm_down_sticky", -26, -13],

      "cactus": ["blocks", "cactus", -13, 0],
      "deadBush": ["blocks", "dead_bush", -13, 0],
      "glowstone": ["blocks", "glowstone", -13, 0],
      "grassPath": ["blocks", "grass_path", -13, 0],
      "ice": ["blocks", "ice", -13, 0],
      "netherrack": ["blocks", "netherrack", -13, 0],
      "netherBrick": ["blocks", "nether_brick", -13, 0],
      "quartzOre": ["blocks", "quartz_ore", -13, 0],
      "snow": ["blocks", "snow", -13, 0],
      "snowyGrass": ["blocks", "snowy_grass", -13, 0],
      "topSnow": ["blocks", "top_snow", -13, 0],

      "sandDeep": ["blocks", "Sand_Deep", -13, 0],
      "gravelDeep": ["blocks", "Gravel_Deep", -13, 0],
      "reeds": ["blocks", "Reeds", -13, -18],
      "Nether_Portal": ["blocks", "NetherPortal1", 0, -58],

      //hooking up all old blocks that we had assets for but never used in previous years
      "bedFoot": ["blocks", "Bed_Foot", -13, 0],
      "bedHead": ["blocks", "Bed_Head", -13, 10],
      "clay": ["blocks", "Clay", -13, 0],
      "glassBlack": ["blocks", "Glass_Black", -13, 0],
      "glassBlue": ["blocks", "Glass_Blue", -13, 0],
      "glassBrown": ["blocks", "Glass_Brown", -13, 0],
      "glassCyan": ["blocks", "Glass_Cyan", -13, 0],
      "glassGray": ["blocks", "Glass_Gray", -13, 0],
      "glassGreen": ["blocks", "Glass_Green", -13, 0],
      "glassLightBlue": ["blocks", "Glass_LightBlue", -13, 0],
      "glassLime": ["blocks", "Glass_Lime", -13, 0],
      "glassMagenta": ["blocks", "Glass_Magenta", -13, 0],
      "glassOrange": ["blocks", "Glass_Orange", -13, 0],
      "glassPink": ["blocks", "Glass_Pink", -13, 0],
      "glassPurple": ["blocks", "Glass_Purple", -13, 0],
      "glassRed": ["blocks", "Glass_Red", -13, 0],
      "glassSilver": ["blocks", "Glass_Silver", -13, 0],
      "glassWhite": ["blocks", "Glass_White", -13, 0],
      "glassYellow": ["blocks", "Glass_Yellow", -13, 0],
      "terracotta": ["blocks", "Terracotta", -13, 0],
      "terracottaBlack": ["blocks", "Terracotta_Black", -13, 0],
      "terracottaBlue": ["blocks", "Terracotta_Blue", -13, 0],
      "terracottaBrown": ["blocks", "Terracotta_Brown", -13, 0],
      "terracottaCyan": ["blocks", "Terracotta_Cyan", -13, 0],
      "terracottaGray": ["blocks", "Terracotta_Gray", -13, 0],
      "terracottaGreen": ["blocks", "Terracotta_Green", -13, 0],
      "terracottaLightBlue": ["blocks", "Terracotta_LightBlue", -13, 0],
      "terracottaLime": ["blocks", "Terracotta_Lime", -13, 0],
      "terracottaMagenta": ["blocks", "Terracotta_Magenta", -13, 0],
      "terracottaOrange": ["blocks", "Terracotta_Orange", -13, 0],
      "terracottaPink": ["blocks", "Terracotta_Pink", -13, 0],
      "terracottaPurple": ["blocks", "Terracotta_Purple", -13, 0],
      "terracottaRed": ["blocks", "Terracotta_Red", -13, 0],
      "terracottaSilver": ["blocks", "Terracotta_Silver", -13, 0],
      "terracottaWhite": ["blocks", "Terracotta_White", -13, 0],
      "terracottaYellow": ["blocks", "Terracotta_Yellow", -13, 0],

      // 2018 blocks.
      "strippedOak": ["blocks", "Stripped_Oak", -12, 0],
      "strippedDarkOak": ["blocks", "Stripped_Dark_Oak", -12, 0],
      "stoneBricks": ["blocks", "Stone_Bricks", -12, 0],
      "chiseledStoneBricks": ["blocks", "Stone_Bricks_Chisled", -12, 0],
      "mossyStoneBricks": ["blocks", "Stone_Bricks_Mossy", -12, 0],
      "crackedStoneBricks": ["blocks", "Stone_Bricks_Cracked", -12, 0],
      "magmaBlock": ["blocks", "Magma_Block0", -12, 0],
      "blueCoralBlock": ["blocks", "Coral_Block_Blue", -12, 0],
      "pinkCoralBlock": ["blocks", "Coral_Block_Pink", -12, 0],
      "magentaCoralBlock": ["blocks", "Coral_Block_Magenta", -12, 0],
      "redCoralBlock": ["blocks", "Coral_Block_Red", -12, 0],
      "yellowCoralBlock": ["blocks", "Coral_Block_Yellow", -12, 0],
      "deadCoralBlock": ["blocks", "Coral_Block_Dead_Blue", -12, 0],
      "blueDeadCoralBlock": ["blocks", "Coral_Block_Dead_Blue", -12, 0],
      "pinkDeadCoralBlock": ["blocks", "Coral_Block_Dead_Pink", -12, 0],
      "magentaDeadCoralBlock": ["blocks", "Coral_Block_Dead_Magenta", -12, 0],
      "readDeadCoralBlock": ["blocks", "Coral_Block_Dead_Red", -12, 0],
      "yellowDeadCoralBlock": ["blocks", "Coral_Block_Dead_Yellow", -12, 0],
      "prismarine": ["blocks", "Prismarine0", -12, 0],
      "prismarineBricks": ["blocks", "Prismarine_Bricks", -12, 0],
      "darkPrismarine": ["blocks", "Prismarine_Dark", -12, 0],
      "seaLantern": ["blocks", "Sea_Lantern0", -12, 0],
      "packedIce": ["blocks", "Ice_Packed", -12, 0],
      "blueIce": ["blocks", "Ice_Blue", -12, 0],
      "blackConcrete": ["blocks", "Concrete_Black", -12, 0],
      "seaGrass": ["blocks", "Seagrass0", -12, 0],
      "kelp": ["blocks", "KelpSingle_0", -12, 0],
      "polishedGranite": ["blocks", "Granite_Polished", -12, 0],
      "coralFanBlueBottom": ["blocks", "Coral_Fan_Blue_Bottom", -12, 0],
      "coralFanPinkBottom": ["blocks", "Coral_Fan_Pink_Bottom", -12, 0],
      "coralFanMagentaBottom": ["blocks", "Coral_Fan_Magenta_Bottom", -12, 0],
      "coralFanRedBottom": ["blocks", "Coral_Fan_Red_Bottom", -12, 0],
      "coralFanYellowFanBottom": ["blocks", "Coral_Fan_Yellow_Bottom", -12, 0],
      "coralFanBlueTop": ["blocks", "Coral_Fan_Blue_Top", -12, 0],
      "coralFanPinkTop": ["blocks", "Coral_Fan_Pink_Top", -12, 0],
      "coralFanMagentaTop": ["blocks", "Coral_Fan_Magenta_Top", -12, 0],
      "coralFanRedTop": ["blocks", "Coral_Fan_Red_Top", -12, 0],
      "coralFanYellowFanTop": ["blocks", "Coral_Fan_Yellow_Top", -12, 0],
      "coralFanBlueLeft": ["blocks", "Coral_Fan_Blue_Left", -12, 0],
      "coralFanPinkLeft": ["blocks", "Coral_Fan_Pink_Left", -12, 0],
      "coralFanMagentaLeft": ["blocks", "Coral_Fan_Magenta_Left", -12, 0],
      "coralFanRedLeft": ["blocks", "Coral_Fan_Red_Left", -12, 0],
      "coralFanYellowFanLeft": ["blocks", "Coral_Fan_Yellow_Left", -12, 0],
      "coralFanBlueRight": ["blocks", "Coral_Fan_Blue_Right", -12, 0],
      "coralFanPinkRight": ["blocks", "Coral_Fan_Pink_Right", -12, 0],
      "coralFanMagentaRight": ["blocks", "Coral_Fan_Magenta_Right", -12, 0],
      "coralFanRedRight": ["blocks", "Coral_Fan_Red_Right", -12, 0],
      "coralFanYellowFanRight": ["blocks", "Coral_Fan_Yellow_Right", -12, 0],
      "coralPlantBlue": ["blocks", "Coral_Plant_Blue", -12, 0],
      "coralPlantBlueDeep": ["blocks", "Coral_Plant_Blue_Sand", -12, 0],
      "coralPlantPink": ["blocks", "Coral_Plant_Pink", -12, 0],
      "coralPlantPinkDeep": ["blocks", "Coral_Plant_Pink_Sand", -12, 0],
      "coralPlantMagenta": ["blocks", "Coral_Plant_Magenta", -12, 0],
      "coralPlantMagentaDeep": ["blocks", "Coral_Plant_Magenta_Sand", -12, 0],
      "coralPlantRed": ["blocks", "Coral_Plant_Red", -12, 0],
      "coralPlantRedDeep": ["blocks", "Coral_Plant_Red_Sand", -12, 0],
      "coralPlantYellow": ["blocks", "Coral_Plant_Yellow", -12, 0],
      "coralPlantYellowDeep": ["blocks", "Coral_Plant_Yellow_Sand", -12, 0],
      "magmaUnderwater": ["blocks", "Magma_Bubble_Boat0", -12, 4],
      "magmaDeep": ["blocks", "Magma_Bubble_Deep0", -12, 0],
      "bubbleColumn": ["blocks", "Bubble_Column0", -12, 0],
      "conduit": ["blocks", "Conduit00", -13, -10],

      "seaPickles": ["blocks", "SeaPickle", -10, -30],
      "Chest": ["blocks", "Chest0", -12, -20],
      "chest": ["blocks", "Chest0", -12, -20], // compat
      "invisible": ["blocks", "Invisible", 0, 0],
    };
    this.actionPlaneBlocks = [];
    this.toDestroy = [];
    this.resettableTweens = [];
    this.treeFluffTypes = {

      "treeAcacia": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2]],
      "treeBirch": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]],
      "treeJungle": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3], [1, -3]],
      "treeOak": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [0, -3]],
      "treeSpruce": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]],
      "treeSpruceSnowy": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]]
    };
  }

  /** Prismarine blocks share one canvas texture that blends between frames. */
  initPrismarine() {
    if (!this.prismarine) {
      this.prismarine = this.scene.textures.exists('prismarine')
        ? this.scene.textures.get('prismarine')
        : this.scene.textures.createCanvas('prismarine', 64, 64);
      this.prismarineFrames = [];

      for (let i = 0; i < 6; i++) {
        this.prismarineFrames[i] = this.scene.textures.getFrame('blocks', 'Prismarine' + i);
      }
      this.drawPrismarineFrame(this.prismarineFrames[0], 1);
    }
  }

  drawPrismarineFrame(frame, alpha) {
    const context = this.prismarine.context;
    context.globalAlpha = alpha;
    context.drawImage(
      frame.source.image,
      frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
      0, 0, 64, 64
    );
    context.globalAlpha = 1;
    this.prismarine.refresh();
  }

  updatePrismarine() {
    const from = Math.floor(this.prismarinePhase);
    const to = Math.ceil(this.prismarinePhase) % 6;
    const blend = this.prismarinePhase - from;
    this.drawPrismarineFrame(this.prismarineFrames[from], 1);
    if (blend > 0) {
      this.drawPrismarineFrame(this.prismarineFrames[to], blend);
    }
  }

  get scene() {
    return this.controller.scene;
  }

  /**
   * Register a sprite-local animation from atlas frame names. The optional
   * onComplete fires every time the animation finishes (non-looping only).
   */
  createAnim(sprite, key, frames, frameRate = 60, loop = false, onComplete = null) {
    sprite.anims.create({
      key,
      frames: frames.map(frame => ({key: sprite.texture.key, frame})),
      frameRate,
      repeat: loop ? -1 : 0,
    });
    if (onComplete) {
      sprite.on('animationcomplete-' + key, onComplete);
    }
  }

  resetSpriteOrigin(sprite) {
    if (sprite.originX !== 0 || sprite.originY !== 0) {
      sprite.setOrigin(0, 0);
    }
  }

  /**
   * Make a top-left-anchored sprite inside a display group (container).
   * Undefined key gets the transparent default texture (CE blank sprites).
   */
  createSprite(group, x, y, key, frame) {
    const sprite = this.scene.add.sprite(x, y, key ?? '__DEFAULT', frame);
    this.resetSpriteOrigin(sprite);
    sprite.on('animationstart', () => this.resetSpriteOrigin(sprite));
    sprite.on('animationupdate', () => this.resetSpriteOrigin(sprite));
    sprite.sortOrder = 0;
    group.add(sprite);
    return sprite;
  }

  yToIndex(y) {
    return this.controller.levelModel.yToIndex(y);
  }

  create(levelModel) {
    this.createGroups();
    this.reset(levelModel);

    if (levelModel.isUnderwater()) {
      const underwaterOverlay = this.scene.add.sprite(0, 0, 'underwaterOverlay').setOrigin(0, 0);
      underwaterOverlay.visible = false;
      underwaterOverlay.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.uniforms.surface.value = underwaterOverlay.texture;
    }
  }

  resetEntity(entity) {
    this.preparePlayerSprite(entity.name, entity);
    entity.getAnimationTarget().anims.stop();
    this.setPlayerPosition(entity.position, entity.isOnBlock, entity);
    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(entity.position[0], entity.position[1]);
      this.selectionIndicator.visible = true;
    }
    this.initWithIdleAnimation(entity.position, entity.facing, entity.isOnBlock, entity);
  }

  reset(levelModel) {
    this.player = levelModel.player;
    this.agent = levelModel.agent;

    this.resettableTweens.forEach((tween) => {
      tween.stop();
    });
    this.resettableTweens.length = 0;
    this.collectibleItems = [];
    this.trees = [];

    this.resetGroups(levelModel);

    if (levelModel.usePlayer) {
      this.resetEntity(this.player);

      if (levelModel.usingAgent) {
        this.resetEntity(this.agent);
      }
    }

    if (levelModel.isUnderwater()) {
      if (levelModel.getOceanType() === 'cold') {
        this.uniforms.tint.value = [57 / 255, 56 / 255, 201 / 255, 1];
      }
      // TODO(phaser4-filter): apply the ported wave shader to the main camera
    }

    this.updateShadingGroup(levelModel.shadingPlane);
    this.updateFowGroup(levelModel.fowPlane);

    const camera = this.scene.cameras.main;
    if (this.controller.followingPlayer()) {
      camera.setBounds(0, 0, levelModel.planeWidth * 40, levelModel.planeHeight * 40);
      // CE's camera.follow(undefined) was a silent no-op (event levels
      // without a player still set gridDimensions)
      if (this.player && this.player.sprite) {
        camera.startFollow(this.player.sprite, true);
      }
      this.controller.worldGroup.setScale(1);
    } else {
      camera.setBounds(0, 0, 400, 400);
    }
  }

  update() {
    for (let i = 0; i < this.toDestroy.length; ++i) {
      this.toDestroy[i].destroy();
    }
    this.toDestroy = [];

    if (this.prismarine) {
      this.prismarinePhase = (this.prismarinePhase + this.controller.originalFpsToScaled(0.015)) % 6;
      this.updatePrismarine();
    }
  }

  render() {
    this.actionGroup.sort('sortOrder');
    // CE also sorted fluffGroup by 'z' (auto-assigned insertion index), which
    // is a no-op re-ordering; native containers already render in add order.

    const view = this.scene.cameras.main.worldView;
    this.uniforms.x.value = view.x / view.width;
    this.uniforms.y.value = view.y / view.height;
    this.uniforms.time.value++;
  }

  scaleShowWholeWorld(completionHandler) {
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    const camera = this.scene.cameras.main;

    camera.stopFollow();
    camera.removeBounds();

    this.addResettableTween({
      targets: camera,
      scrollX: 0,
      scrollY: 0,
      duration: 1000,
      ease: 'Expo.easeOut',
    });

    this.addResettableTween({
      targets: this.controller.worldGroup,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY,
      duration: 1000,
      ease: 'Expo.easeOut',
      onComplete: () => {
        completionHandler();
      },
    });
  }

  getDirectionName(facing) {
    return "_" + FacingDirection.directionToRelative(facing).toLowerCase();
  }

  playDoorAnimation(position, open, completionHandler) {
    let blockIndex = (this.yToIndex(position[1])) + position[0];
    let block = this.actionPlaneBlocks[blockIndex];
    let animationName = open ? "open" : "close";
    this.playScaledSpeed(block, animationName);
    this.onAnimationEnd(block, animationName, () => {
      completionHandler();
    });
  }

  playOpenConduitAnimation(position) {
    const blockIndex = (this.yToIndex(position[1])) + position[0];
    const block = this.actionPlaneBlocks[blockIndex];
    this.playScaledSpeed(block, "activation");
    this.onAnimationEnd(block, "activation", () => {
      this.controller.levelModel.actionPlane.getBlockAt(position).isEmissive = true;
      this.controller.updateShadingPlane();
      this.controller.updateFowPlane();
      this.playScaledSpeed(block, "open");
    });
  }

  playCloseConduitAnimation(position) {
    const blockIndex = (this.yToIndex(position[1])) + position[0];
    const block = this.actionPlaneBlocks[blockIndex];
    this.playScaledSpeed(block, "deactivation");
    this.onAnimationEnd(block, "deactivation", () => {
      this.controller.levelModel.actionPlane.getBlockAt(position).isEmissive = false;
      this.controller.updateShadingPlane();
      this.controller.updateFowPlane();
    });
  }

  playOpenChestAnimation(position) {
    const blockIndex = (this.yToIndex(position[1])) + position[0];
    const block = this.actionPlaneBlocks[blockIndex];
    this.playScaledSpeed(block, "open");
    this.onAnimationEnd(block, "open", () => {
      const treasure = this.getTreasureTypeFromChest(this.controller.levelModel.actionPlane.getBlockAt(position));
      if (treasure) {
        this.createMiniBlock(position[0], position[1], treasure, {
          collectibleDistance: -1,
          xOffsetRange: 0,
          yOffsetRange: 0,
          isOnBlock: true,
        });
      }
    });
  }

  getTreasureTypeFromChest(blockData) {
    return blockData.blockType.substring(0, blockData.blockType.length - 5);
  }

  /**
   * Plays <animationName><direction> on the entity's animation sprite and
   * returns the fully-qualified animation key (for event subscription).
   */
  playPlayerAnimation(animationName, position, facing, isOnBlock = false, entity = this.player) {
    let direction = this.getDirectionName(facing);
    entity.sprite.sortOrder = this.yToIndex(position[1]) + entity.getSortOrderOffset();

    let animName = animationName + direction;
    this.playScaledSpeed(entity.getAnimationTarget(), animName);
    return animName;
  }

  playIdleAnimation(position, facing, isOnBlock, entity = this.player) {
    const animationName = this.controller.levelModel.isUnderwater() ? "walk" : "idle";
    this.playPlayerAnimation(animationName, position, facing, isOnBlock, entity);
  }

  initWithIdleAnimation(position, facing, isOnBlock, entity = this.player){
    this.playPlayerAnimation("idle", position, facing, isOnBlock, entity);
  }

  playSuccessAnimation(position, facing, isOnBlock, completionHandler, entity = this.player) {
    this.controller.delayBy(250, () => {
      this.audioPlayer.play("success");
      const animName = this.playPlayerAnimation("celebrate", position, facing, isOnBlock, entity);
      this.onAnimationEnd(entity.getAnimationTarget(), animName, () => {
        completionHandler();
      });
    });
  }

  playFailureAnimation(position, facing, isOnBlock, completionHandler, entity = this.player) {
    this.controller.delayBy(500, () => {
      this.audioPlayer.play("failure");
      const animName = this.playPlayerAnimation("fail", position, facing, isOnBlock, entity);
      this.onAnimationEnd(entity.getAnimationTarget(), animName, () => {
        this.controller.delayBy(800, completionHandler);
      });
    });
  }

  playBumpAnimation(position, facing, isOnBlock, entity = this.player) {
    const animName = this.playPlayerAnimation("bump", position, facing, isOnBlock, entity);
    this.onAnimationEnd(entity.getAnimationTarget(), animName, () => {
      this.playIdleAnimation(position, facing, isOnBlock, entity);
    });
    return animName;
  }

  playDrownFailureAnimation(position, facing, isOnBlock, completionHandler) {
    var sprite;

    this.playPlayerAnimation("fail", position, facing, isOnBlock);
    this.createBlock(this.fluffGroup, position[0], position[1], "bubbles");

    sprite = this.createSprite(this.fluffGroup, 0, 0, "finishOverlay");
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    sprite.scaleX = scaleX;
    sprite.scaleY = scaleY;
    sprite.alpha = 0;
    sprite.tint = 0x324bff;

    this.addResettableTween({
      targets: sprite,
      alpha: 0.5,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        completionHandler();
      },
    });
  }

  playBurnInLavaAnimation(position, facing, isOnBlock, completionHandler) {
    var sprite;

    this.playPlayerAnimation("jumpUp", position, facing, isOnBlock);
    this.createBlock(this.fluffGroup, position[0], position[1], "fire");

    sprite = this.createSprite(this.fluffGroup, 0, 0, "finishOverlay");
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    sprite.scaleX = scaleX;
    sprite.scaleY = scaleY;
    sprite.alpha = 0;
    sprite.tint = 0xd1580d;

    this.addResettableTween({
      targets: sprite,
      alpha: 0.5,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        completionHandler();
      },
    });
  }

  playDestroyTntAnimation(position, facing, isOnBlock, tntArray, newShadingPlaneData, completionHandler) {
    var block,
      lastAnimation;
    if (tntArray.length === 0) {
      completionHandler();
      return;
    }

    this.audioPlayer.play("fuse");
    for (var tnt in tntArray) {
      block = this.actionPlaneBlocks[this.coordinatesToIndex(tntArray[tnt])];
      this.playScaledSpeed(block, "explode");
      lastAnimation = block;
    }

    this.onAnimationEnd(lastAnimation, "explode", () => {
      this.audioPlayer.play("explode");
      completionHandler();
    });
  }

  playCreeperExplodeAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
    this.controller.delayBy(180, () => {
      const playerSprite = this.player.getAnimationTarget();
      const bumpAnim = this.playPlayerAnimation("bump", position, facing, false);
      this.onAnimationEnd(playerSprite, bumpAnim, () => {
        //add creeper windup sound
        this.audioPlayer.play("fuse");
        this.playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler, this);

        this.controller.delayBy(200, () => {
          const jumpAnim = this.playPlayerAnimation("jumpUp", position, facing, false);
          this.onAnimationLoopOnce(playerSprite, jumpAnim, () => {
            this.playIdleAnimation(position, facing, isOnBlock);
          });
        });
      });
    });
  }
  // flash
  flashEntity(entity) {
    return this.flashSpriteToWhite(entity.sprite);
  }

  flashBlock(position) {
    let blockIndex = (this.yToIndex(position[1])) + position[0];
    let block = this.actionPlaneBlocks[blockIndex];
    return this.flashSpriteToWhite(block);
  }

  /**
   * Overlay the sprite with a white silhouette of its current frame and
   * pulse it three times. The silhouette is drawn into a throwaway
   * CanvasTexture (CE used BitmapData alphaMask).
   */
  flashSpriteToWhite(sprite) {
    const frame = sprite.frame;
    const key = `__flash_${Date.now()}_${Math.random()}`;
    const canvasTexture = this.scene.textures.createCanvas(
      key,
      Math.max(1, frame.cutWidth),
      Math.max(1, frame.cutHeight)
    );
    const context = canvasTexture.context;
    context.drawImage(
      frame.source.image,
      frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
      0, 0, frame.cutWidth, frame.cutHeight
    );
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, frame.cutWidth, frame.cutHeight);
    context.globalCompositeOperation = 'source-over';
    canvasTexture.refresh();

    const flashSprite = this.scene.add.sprite(sprite.x, sprite.y, key).setOrigin(0, 0);
    flashSprite.sortOrder = (sprite.sortOrder ?? 0) + 0.5;
    if (sprite.parentContainer) {
      sprite.parentContainer.add(flashSprite);
    }
    flashSprite.alpha = 0;

    const fadeMs = 60;
    const pauseMs = fadeMs * 4;
    let totalDuration = fadeMs * 2;
    const steps = [
      {targets: flashSprite, alpha: 1, duration: fadeMs, ease: 'Linear'},
      {targets: flashSprite, alpha: 0, duration: fadeMs, ease: 'Linear'},
    ];
    for (let i = 0; i < 2; i++) {
      steps.push(
        {targets: flashSprite, alpha: 0, duration: pauseMs, ease: 'Linear'},
        {targets: flashSprite, alpha: 1, duration: fadeMs, ease: 'Linear'},
        {targets: flashSprite, alpha: 0, duration: fadeMs, ease: 'Linear'}
      );
      totalDuration += pauseMs + fadeMs * 2;
    }

    this.addResettableTween({
      targets: flashSprite,
      tweens: steps,
      onComplete: () => {
        flashSprite.destroy();
        this.scene.textures.remove(key);
      },
    });

    return totalDuration * 2;
  }

  playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
    let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
    let blockToExplode = this.actionPlaneBlocks[blockIndex];

    blockToExplode.once('animationcomplete-explode', () => {
      blockToExplode.setActive(false).setVisible(false);
      this.playExplosionAnimation(position, facing, destroyPosition, isOnBlock, () => {
        this.controller.delayBy(100, () => {
          this.playFailureAnimation(position, facing, false, completionHandler);
        });
      }, false);
      this.audioPlayer.play("explode");
      this.playExplosionCloudAnimation(destroyPosition);
    });

    const explodeAnimation = blockToExplode.anims.get('explode');
    blockToExplode.anims.play({
      key: 'explode',
      frameRate: explodeAnimation.frameRate / this.controller.slowMotion,
    });
  }

  playExplosionCloudAnimation(position) {
    this.createBlock(this.fluffGroup, position[0], position[1], "explosion");
  }

  coordinatesToIndex(coordinates) {
    return (this.yToIndex(coordinates[1])) + coordinates[0];
  }

  playMinecartTurnAnimation(position, isUp, isOnBlock, completionHandler, turnDirection) {
    const facing = isUp ? FacingDirection.North : FacingDirection.South;
    var animation = this.playPlayerAnimation("mineCart_turn" + turnDirection, position, facing, false);
    return animation;
  }

  playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed) {
    //if we loop the sfx that might be better?
    this.audioPlayer.play("minecart");
    this.playPlayerAnimation("mineCart", position, facing, false);
    const target = this.positionToScreen(nextPosition);
    const tween = this.addResettableTween({
      targets: this.player.sprite,
      x: target.x,
      y: target.y,
      duration: speed,
      ease: 'Linear',
    });
    this.player.sprite.sortOrder = this.yToIndex(nextPosition[1]) + 10;

    return tween;
  }

  playMinecartAnimation(isOnBlock, completionHandler) {
    //start at 3,2
    const position = new Position(3, 2);
    this.setPlayerPosition(position, isOnBlock);
    this.player.facing = 2;

    const tween = this.playLevelEndAnimation(position, this.player.facing, isOnBlock, completionHandler, false);
    this.scene.cameras.main.setBounds(0, 0, 440, 400);
    this.scene.cameras.main.startFollow(this.player.sprite, true);

    tween.once('complete', () => {
      this.playTrack(position, this.player.facing, isOnBlock, this.player, completionHandler);
    });
  }

  playTrack(position, facing, isOnBlock, entity = this.player, completionHandler) {
    entity.onTracks = true;

    // Need to get track on current position to avoid mishandling immediate turns
    let track = this.controller.levelModel.actionPlane.getMinecartTrack(position, facing);

    let nextPos = Position.forward(entity.position, facing);

    if (entity.getOffTrack || (!track && !this.isFirstTimeOnRails(position, nextPos))) {
      entity.getOffTrack = false;
      entity.onTracks = false;
      if (completionHandler) {
        completionHandler();
      }
      return;
    }

    // If track is undefined, it means the player was not on a rail
    // but if we reached this, that means we're trying to get on a rail for the first time
    // and we need to grab that track -in front of us-
    if (track === undefined) {
      track = this.controller.levelModel.actionPlane.getMinecartTrack(nextPos, facing);
      // Having a weird bug on publish where rail destruction while riding causes a destructure of
      // non-iterable instance error. If getTrack fails with currPos and nextPos, just call the whole thing off.
      // so that we don't reach the const assignment below.
      if (track === undefined) {
        entity.getOffTrack = false;
        entity.onTracks = false;
        if (completionHandler) {
          completionHandler();
        }
        return;
      }
    }

    let direction;
    const [arraydirection, nextPosition, nextFacing, speed] = track;
    this.player.position = nextPosition;

    //turn
    if (arraydirection.substring(0, 4) === "turn") {
      direction = arraydirection.substring(5);
      const isUp = facing === FacingDirection.North || nextFacing === FacingDirection.North;
      const turnKey = this.playMinecartTurnAnimation(position, isUp, isOnBlock, completionHandler, direction);
      this.onAnimationEnd(this.player.getAnimationTarget(), turnKey, () => {
        this.playTrack(nextPosition, nextFacing, isOnBlock, entity, completionHandler);
      });
    } else {
      const moveTween = this.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed);
      moveTween.once('complete', () => {
        this.playTrack(nextPosition, nextFacing, isOnBlock, entity, completionHandler);
      });
    }
  }

  /**
  * Handling the first case of walking onto a track while not currently on one
  */
  isFirstTimeOnRails(currPos, nextPos) {
    let nextBlock = this.controller.levelModel.actionPlane.getBlockAt(nextPos);
    let currBlock = this.controller.levelModel.actionPlane.getBlockAt(currPos);
    if ((nextBlock && currBlock) && (!currBlock.isRail && nextBlock.isRail)) {
      return true;
    }
    return false;
  }

  addHouseBed(bottomCoordinates) {
    //Temporary, will be replaced by bed blocks
    var bedTopCoordinate = (bottomCoordinates[1] - 1);
    var sprite = this.createSprite(this.actionGroup, 38 * bottomCoordinates[0], 35 * bedTopCoordinate, "bed");
    sprite.sortOrder = this.yToIndex(bottomCoordinates[1]);
  }

  addDoor(coordinates) {
    var sprite;
    let toDestroy = this.actionPlaneBlocks[this.coordinatesToIndex(coordinates)];
    this.createActionPlaneBlock(coordinates, "door");
    //Need to grab the correct blocktype from the action layer
    //And use that type block to create the ground block under the door
    sprite = this.createBlock(this.groundGroup, coordinates[0], coordinates[1], "wool_orange");
    toDestroy.setActive(false).setVisible(false);
    sprite.sortOrder = this.yToIndex(6);
  }

  playSuccessHouseBuiltAnimation(position, facing, isOnBlock, createFloor, houseObjectPositions, completionHandler, updateScreen) {
    //fade screen to white
    //Add house blocks
    //fade out of white
    //Play success animation on player.
    var tweenToW = this.playLevelEndAnimation(position, facing, isOnBlock, () => {
      this.controller.delayBy(4000, completionHandler);
    }, true);
    tweenToW.once('complete', () => {
      this.audioPlayer.play("houseSuccess");
      //Change house ground to floor
      var xCoord;
      var yCoord;
      var sprite;

      for (var i = 0; i < createFloor.length; ++i) {
        xCoord = createFloor[i][1];
        yCoord = createFloor[i][2];
        /*this.groundGroup._data[this.coordinatesToIndex([xCoord,yCoord])].setActive(false).setVisible(false);*/
        sprite = this.createBlock(this.groundGroup, xCoord, yCoord, "wool_orange");
        sprite.sortOrder = this.yToIndex(yCoord);
      }

      this.addHouseBed(houseObjectPositions[0]);
      this.addDoor(houseObjectPositions[1]);
      this.groundGroup.sort('sortOrder');
      updateScreen();
    });
  }

  //Tweens in and then out of white. returns the tween to white for adding callbacks
  playLevelEndAnimation(position, facing, isOnBlock, completionHandler, playSuccessAnimation) {
    const sprite = this.createSprite(this.fluffGroup, 0, 0, "finishOverlay");
    var [scaleX, scaleY] = this.controller.scaleFromOriginal();
    sprite.scaleX = scaleX;
    sprite.scaleY = scaleY;
    sprite.alpha = 0;

    const tweenToW = this.addResettableTween({
      targets: sprite,
      alpha: 1,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.selectionIndicator.visible = false;
        this.setPlayerPosition(position, isOnBlock);
        this.addResettableTween({
          targets: sprite,
          alpha: 0,
          duration: 700,
          ease: 'Linear',
          onComplete: playSuccessAnimation
            ? () => {
                this.playSuccessAnimation(position, facing, isOnBlock, completionHandler);
              }
            : undefined,
        });
      },
    });

    return tweenToW;
  }

  playBlockSound(groundType) {
    if (groundType === "water" || groundType === "lava" || this.controller.levelModel.isUnderwater()) {
      return;
    }
    const oreString = groundType.substring(0, 3);
    if (groundType === "stone" || groundType === "cobblestone" || groundType === "bedrock" ||
      oreString === "ore" || groundType === "bricks") {
      this.audioPlayer.play("stepStone");
    } else if (groundType === "grass" || groundType === "dirt" || groundType === "dirtCoarse" ||
      groundType === "wool_orange" || groundType === "wool") {
      this.audioPlayer.play("stepGrass");
    } else if (groundType === "gravel") {
      this.audioPlayer.play("stepGravel");
    } else if (groundType === "farmlandWet") {
      this.audioPlayer.play("stepFarmland");
    } else {
      this.audioPlayer.play("stepWood");
    }
  }

  /**
   * Play the MoveForward animation for the given entity. Note that both
   * MoveForward and MoveBackward are implemented using the same walk
   * animations, and the only difference between the two is the logic they use
   * for moving north after placing a block
   *
   * @see LevelView.playWalkAnimation
   */
  playMoveForwardAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
    // make sure to render high for when moving north after placing a block
    const targetYIndex = entity.position[1] + (facing === FacingDirection.North ? 1 : 0);
    this.playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler);
  }

  /**
   * @see LevelView.playMoveForwardAnimation
   */
  playMoveBackwardAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
    // make sure to render high for when moving north after placing a block
    const targetYIndex = entity.position[1] + (facing === FacingDirection.South ? 1 : 0);
    this.playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler);
  }

  playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler) {
    let tween;
    let position = entity.position;

    //stepping on stone sfx
    this.playBlockSound(groundType);

    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(position[0], position[1]);
    }

    // Update the sort order 3/4 of the way through the animation
    let sortOrderUpdated = false;
    const updateSortOrder = tweenRef => {
      if (!sortOrderUpdated && tweenRef.progress >= 0.75) {
        sortOrderUpdated = true;
        entity.sprite.sortOrder = this.yToIndex(targetYIndex) + entity.getSortOrderOffset();
      }
    };

    if (!shouldJumpDown) {
      this.playPlayerAnimation('walk', oldPosition, facing, isOnBlock, entity);
      const target = this.positionToScreen(position, isOnBlock, entity);
      tween = this.addResettableTween({
        targets: entity.sprite,
        x: target.x,
        y: target.y,
        duration: 180,
        ease: 'Linear',
      });
    } else {
      tween = this.playPlayerJumpDownVerticalAnimation(facing, position, oldPosition);
    }

    tween.on('update', updateSortOrder);
    tween.once('complete', () => {
      completionHandler();
    });
  }

  /**
   * Animate the player jumping down from on top of a block to ground level.
   * @param {FacingDirection} facing
   * @param {Array<int>}position
   * @param {?Array<int>} oldPosition
   * @return {Phaser.Tween}
   */
  playPlayerJumpDownVerticalAnimation(facing, position, oldPosition = position) {
    if (!this.controller.levelModel.isUnderwater()) {
      const animName = "jumpDown" + this.getDirectionName(facing);
      this.playScaledSpeed(this.player.getAnimationTarget(), animName);
    }

    const start = this.positionToScreen(oldPosition);
    const end = this.positionToScreen(position);
    const tween = this.addResettableTween({
      targets: this.player.sprite,
      x: [start.x, end.x, end.x],
      y: [start.y, end.y - 50, end.y],
      interpolation: 'bezier',
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.audioPlayer.play("fall");
      },
    });

    return tween;
  }

  playPlaceBlockAnimation(position, facing, blockType, blockTypeAtPosition, entity, completionHandler) {
    let blockIndex = this.yToIndex(position[1]) + position[0];

    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(position[0], position[1]);
    }

    if (entity === this.agent || LevelBlock.isWalkable(blockType)) {
      const punchKey = this.playPlayerAnimation("punch", position, facing, false, entity);
      this.onAnimationEnd(entity.getAnimationTarget(), punchKey, () => {
        completionHandler();
      });
    } else {
      this.audioPlayer.play("placeBlock");

      let direction = this.getDirectionName(facing);

      if (blockTypeAtPosition !== "") {
        this.playExplosionAnimation(position, facing, position, blockTypeAtPosition, (() => {
        }), false);
      }

      if (!this.controller.levelModel.isUnderwater()) {
        this.playScaledSpeed(this.player.getAnimationTarget(), "jumpUp" + direction);
      }
      this.addResettableTween({
        targets: this.player.sprite,
        y: -55 + 40 * position[1],
        duration: 125,
        // CE fell back to linear (Easing.Cubic.EaseOut never existed)
        ease: 'Linear',
        onComplete: () => {
          if (blockTypeAtPosition !== "") {
            this.actionPlaneBlocks[blockIndex].setActive(false).setVisible(false);
          }
          completionHandler();
        },
      });
    }
  }

  playPlaceBlockInFrontAnimation(entity = this.player, playerPosition, facing, blockPosition, completionHandler) {
    this.setSelectionIndicatorPosition(blockPosition[0], blockPosition[1]);

    const punchKey = this.playPlayerAnimation("punch", playerPosition, facing, false, entity);
    this.onAnimationEnd(entity.getAnimationTarget(), punchKey, () => {
      completionHandler();
    });
  }

  correctForShadowOverlay(blockType, sprite) {
    if (blockType.startsWith("piston")) {
      sprite.sortOrder -= 0.1;
    }
  }

  removeActionPlaneBlock(blockIndex) {
    const sprite = this.actionPlaneBlocks[blockIndex];
    if (!sprite) {
      return;
    }

    this.actionGroup.remove(sprite);
    this.groundGroup.remove(sprite);
    sprite.destroy();
    this.actionPlaneBlocks[blockIndex] = null;
  }

  createActionPlaneBlock(position, blockType) {
    const block = new LevelBlock(blockType);
    const blockIndex = (this.yToIndex(position[1])) + position[0];

    // Remove the old sprite at this position, if there is one.
    this.removeActionPlaneBlock(blockIndex);

    if (block.isEmpty) {
      return;
    }

    // Create a new sprite.
    let sprite;
    if (block.getIsMiniblock()) {
      // miniblocks defined on the action plane like this should have a
      // closer collectible range and a narrower drop offset than normal
      sprite = this.createMiniBlock(position[0], position[1], blockType, {
        collectibleDistance: 1,
        xOffsetRange: 10,
        yOffsetRange: 10
      });
    } else {
      const group = block.shouldRenderOnGroundPlane() ? this.groundGroup : this.actionGroup;
      const offset = block.shouldRenderOnGroundPlane() ? -0.5 : 0;
      if (block.getIsChestblock()){
        // if this is a treasure chest, render a normal chest and blockType will be used later to determine treasure type
        sprite = this.createBlock(group, position[0], position[1] + offset, "Chest");
      } else {
        sprite = this.createBlock(group, position[0], position[1] + offset, blockType);
      }
    }

    if (sprite) {
      sprite.sortOrder = this.yToIndex(position[1]);
      this.correctForShadowOverlay(blockType, sprite);
    }

    this.actionPlaneBlocks[blockIndex] = sprite;
  }

  playShearAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
    let blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
    let blockToShear = this.actionPlaneBlocks[blockIndex];

    blockToShear.anims.stop();
    this.playScaledSpeed(blockToShear, "used");
    this.onAnimationLoopOnce(blockToShear, "used", () => {
      this.playScaledSpeed(blockToShear, "face");
    });

    this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
  }

  playShearSheepAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
    this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

    const punchKey = this.playPlayerAnimation("punch", playerPosition, facing, false);
    this.onAnimationEnd(this.player.getAnimationTarget(), punchKey, () => {
      let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
      let blockToShear = this.actionPlaneBlocks[blockIndex];

      blockToShear.anims.stop();
      this.playScaledSpeed(blockToShear, "used");
      this.onAnimationLoopOnce(blockToShear, "used", () => {
        this.playScaledSpeed(blockToShear, "face");
      });

      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
    });
  }

  destroyBlockWithoutPlayerInteraction(destroyPosition) {
    let blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
    let blockToDestroy = this.actionPlaneBlocks[blockIndex];

    let destroyOverlay = this.createSprite(this.actionGroup, -12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
    destroyOverlay.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.createAnim(destroyOverlay, "destroy", generateFrameNames("destroy", 1, 12, "", 0), 30, false);
    this.onAnimationEnd(destroyOverlay, "destroy", () => {
      this.actionPlaneBlocks[blockIndex] = null;

      if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
        blockToDestroy.onBlockDestroy(blockToDestroy);
      }

      blockToDestroy.setActive(false).setVisible(false);
      destroyOverlay.setActive(false).setVisible(false);
      this.toDestroy.push(blockToDestroy);
      this.toDestroy.push(destroyOverlay);
      this.audioPlayer.play('dig_wood1');
    });

    this.playScaledSpeed(destroyOverlay, "destroy");
  }

  playDestroyBlockAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler) {
    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
    }

    var playerAnimation = undefined;
    if (entity === this.agent || this.controller.levelModel.isUnderwater()) {
      playerAnimation = "punchDestroy";
    } else {
      playerAnimation = blockType.match(/(ore|stone|clay|bricks|bedrock)/) ? "mine" : "punchDestroy";
    }
    this.playPlayerAnimation(playerAnimation, playerPosition, facing, false, entity);
    this.playMiningParticlesAnimation(facing, destroyPosition);
    this.playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler);
  }

  playPunchDestroyAirAnimation(playerPosition, facing, destroyPosition, completionHandler, entity = this.player) {
    this.playPunchAnimation(playerPosition, facing, destroyPosition, "punchDestroy", completionHandler, entity);
  }

  playPunchAirAnimation(playerPosition, facing, destroyPosition, completionHandler, entity = this.player) {
    this.playPunchAnimation(playerPosition, facing, destroyPosition, "punch", completionHandler, entity);
  }

  playPunchAnimation(playerPosition, facing, destroyPosition, animationType, completionHandler, entity = this.player) {
    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
    }
    const animName = this.playPlayerAnimation(animationType, playerPosition, facing, false, entity);
    this.onAnimationEnd(entity.getAnimationTarget(), animName, () => {
      completionHandler();
    });
  }

  /**
   * Play the block Destroy Overlay animation. As a side effect, also actually
   * destroy the block in the level model, update the visualization, and play
   * the block Explision animation.
   *
   * Note that if the block is of a type that does not require an overlay
   * animation, this method (confusingly) simply calls the side effects
   * immediately.
   */
  playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler) {
    const blockIndex = (this.yToIndex(destroyPosition[1])) + destroyPosition[0];
    const blockToDestroy = this.actionPlaneBlocks[blockIndex];

    const afterDestroy = () => {
      if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
        blockToDestroy.onBlockDestroy(blockToDestroy);
      }

      this.controller.levelModel.destroyBlockForward(entity);
      this.controller.updateShadingPlane();
      this.controller.updateFowPlane();

      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(playerPosition[0], playerPosition[1]);
      }

      this.audioPlayer.play('dig_wood1');
      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true, entity);
    };

    if (LevelBlock.skipsDestructionOverlay(blockType)) {
      // "flat" blocks are by definition not cube shaped and so shouldn't accept
      // the cube-shaped destroy overlay animation. In this case, destroy the
      // block immediately without waiting for the animation.
      afterDestroy();
    } else {
      const destroyOverlay = this.createSprite(this.actionGroup, -12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
      if (LevelBlock.isFlat(blockType)) {
        destroyOverlay.y += 20;
        destroyOverlay.setCrop(0, 0, 60, 40);
      }
      destroyOverlay.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.createAnim(destroyOverlay, "destroy", generateFrameNames("destroy", 1, 12, "", 0), 30, false);
      this.onAnimationEnd(destroyOverlay, "destroy", () => {
        destroyOverlay.setActive(false).setVisible(false);
        this.toDestroy.push(destroyOverlay);

        afterDestroy();
      });
      this.playScaledSpeed(destroyOverlay, "destroy");
    }
  }

  playMiningParticlesAnimation(facing, destroyPosition) {
    let miningParticlesData = [
      [24, -100, -80],   // left
      [12, -120, -80],   // bottom
      [0, -60, -80],   // right
      [36, -80, -60],   // top
    ];

    let direction = this.getDirectionName(facing);
    let miningParticlesIndex = (direction === "_left" ? 0 : direction === "_bottom" ? 1 : direction === "_right" ? 2 : 3);
    let miningParticlesFirstFrame = miningParticlesData[miningParticlesIndex][0];
    let miningParticlesOffsetX = miningParticlesData[miningParticlesIndex][1];
    let miningParticlesOffsetY = miningParticlesData[miningParticlesIndex][2];
    let miningParticles = this.createSprite(this.actionGroup, miningParticlesOffsetX + 40 * destroyPosition[0], miningParticlesOffsetY + 40 * destroyPosition[1], "miningParticles", "MiningParticles" + miningParticlesFirstFrame);
    miningParticles.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.createAnim(miningParticles, "miningParticles", generateFrameNames("MiningParticles", miningParticlesFirstFrame, miningParticlesFirstFrame + 11, "", 0), 30, false);
    this.onAnimationEnd(miningParticles, "miningParticles", () => {
      miningParticles.setActive(false).setVisible(false);
      this.toDestroy.push(miningParticles);
    });
    this.playScaledSpeed(miningParticles, "miningParticles");
  }

  playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, placeBlock, entity = this.player) {
    var explodeAnim = this.createSprite(this.actionGroup, -36 + 40 * destroyPosition[0], -30 + 40 * destroyPosition[1], "blockExplode", "BlockBreakParticle0");

    switch (blockType) {
      case "treeAcacia":
      case "logAcacia":
        explodeAnim.tint = 0x6c655a;
        break;
      case "treeBirch":
      case "logBirch":
        explodeAnim.tint = 0xdad6cc;
        break;
      case "treeJungle":
      case "logJungle":
        explodeAnim.tint = 0x6a4f31;
        break;
      case "treeOak":
      case "logOak":
        explodeAnim.tint = 0x675231;
        break;
      case "treeSpruce":
      case "logSpruce":
        explodeAnim.tint = 0x4b3923;
        break;
      case "planksAcacia":
        explodeAnim.tint = 0xba6337;
        break;
      case "planksBirch":
        explodeAnim.tint = 0xd7cb8d;
        break;
      case "planksJungle":
        explodeAnim.tint = 0xb88764;
        break;
      case "planksOak":
        explodeAnim.tint = 0xb4905a;
        break;
      case "planksSpruce":
        explodeAnim.tint = 0x805e36;
        break;
      case "stone":
      case "oreCoal":
      case "oreDiamond":
      case "oreIron":
      case "oreGold":
      case "oreEmerald":
      case "oreRedstone":
        explodeAnim.tint = 0xC6C6C6;
        break;
      case "grass":
      case "cropWheat":
        explodeAnim.tint = 0x5d8f23;
        break;
      case "dirt":
        explodeAnim.tint = 0x8a5e33;
        break;

      case "redstoneWireOn":
      case "redstoneWireHorizontalOn":
      case "redstoneWireVerticalOn":
      case "redstoneWireUpRightOn":
      case "redstoneWireUpLeftOn":
      case "redstoneWireDownRightOn":
      case "redstoneWireDownLeftOn":
      case "redstoneWireTUpOn":
      case "redstoneWireTDownOn":
      case "redstoneWireTLeftOn":
      case "redstoneWireTRightOn":
      case "redstoneWireCrossOn":
        explodeAnim.tint = 0x990707;
        break;

      case "redstoneWire":
      case "redstoneWireHorizontal":
      case "redstoneWireVertical":
      case "redstoneWireUpRight":
      case "redstoneWireUpLeft":
      case "redstoneWireDownRight":
      case "redstoneWireDownLeft":
      case "redstoneWireTUp":
      case "redstoneWireTDown":
      case "redstoneWireTLeft":
      case "redstoneWireTRight":
      case "redstoneWireCross":
        explodeAnim.tint = 0x290202;
        break;

      default:
        break;
    }

    explodeAnim.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    this.createAnim(explodeAnim, "explode", generateFrameNames("BlockBreakParticle", 0, 7, "", 0), 30, false);
    this.onAnimationEnd(explodeAnim, "explode", () => {
      explodeAnim.setActive(false).setVisible(false);
      this.toDestroy.push(explodeAnim);

      if (placeBlock) {
        if (!this.controller.getIsDirectPlayerControl()) {
          this.playPlayerAnimation("idle", playerPosition, facing, false, entity);
        }
        if (completionHandler !== null) {
          this.playItemDropAnimation(destroyPosition, blockType, completionHandler);
        }
      }
    });
    this.playScaledSpeed(explodeAnim, "explode");
    if (this.controller.getIsDirectPlayerControl() ^ !placeBlock) {
      if (completionHandler) {
        completionHandler();
      }
    }
  }

  playItemDropAnimation(destroyPosition, blockType, completionHandler) {
    let autoAcquire;
    if (this.controller.getIsDirectPlayerControl() && completionHandler) {
      completionHandler();
    } else {
      autoAcquire = () => {
        const player = this.controller.levelModel.player;
        this.playItemAcquireAnimation(player.position, player.facing, sprite, completionHandler, blockType);
      };
    }
    const sprite = this.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType, {onComplete: autoAcquire});

    if (sprite) {
      sprite.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
    }
  }

  /**
   * Play a sprite-local animation with its frame rate rescaled for the
   * current slowMotion setting (CE dilated the animation clock globally).
   */
  playScaledSpeed(sprite, name, factor = 1) {
    const animation = sprite.anims ? sprite.anims.get(name) : null;
    if (!animation) {
      console.log("can't find animation name : " + name);
      return;
    }
    const fps = this.controller.originalFpsToScaled(animation.frameRate) * factor;
    sprite.anims.play({key: name, frameRate: fps / this.controller.slowMotion});
  }

  playItemAcquireAnimation(playerPosition, facing, sprite, completionHandler, blockType) {
    const target = this.positionToScreen(playerPosition);
    this.addResettableTween({
      targets: sprite,
      x: target.x + 20,
      y: target.y + 20,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        const caughtUpToPlayer = Position.equals(this.player.position, playerPosition);
        if (sprite.active && caughtUpToPlayer) {
          this.audioPlayer.play("collectedBlock");
          this.player.inventory[blockType] =
            (this.player.inventory[blockType] || 0) + 1;
          sprite.setActive(false).setVisible(false);
          this.toDestroy.push(sprite);
          const event = createEvent('craftCollectibleCollected');
          event.blockType = blockType;
          window.dispatchEvent(event);
          if (completionHandler) {
            completionHandler();
          }
        } else {
          this.playItemAcquireAnimation(this.player.position, this.player.facing, sprite, completionHandler, blockType);
        }
      },
    });
  }

  /**
   * Convert a grid coordinate position to a screen X/Y location.
   * @param {Array<int>} position
   * @param {?boolean} isOnBlock
   * @return {{x: number, y: number}}
   */
  positionToScreen(position, isOnBlock = false, entity = this.player) {
    const x = position[0];
    const y = position[1];
    const xOffset = entity.offset[0];
    const yOffset = entity.offset[1];
    return {
      x: xOffset + 40 * x,
      y: yOffset + (isOnBlock ? -23 : 0) + 40 * y,
    };
  }

  /**
   * @param {Position} position
   * @param {boolean} isOnBlock
   * @param {Entity} entity
   */
  setPlayerPosition(position, isOnBlock, entity = this.player) {
    const screen = this.positionToScreen(position, isOnBlock, entity);
    entity.sprite.x = screen.x;
    entity.sprite.y = screen.y;
    entity.sprite.sortOrder = this.yToIndex(screen.y) + entity.getSortOrderOffset();
  }

  setSelectionIndicatorPosition(x, y) {
    this.selectionIndicator.x = -35 + 23 + 40 * x;
    this.selectionIndicator.y = -55 + 43 + 40 * y;
  }

  /**
   * @param {Array<Array<int>>} gridSpaces An array of x and y grid coordinates.
   */
  drawHintPath(gridSpaces) {
    this.hintGroup.removeAll(true);

    const bounds = this.scene.cameras.main.getBounds();
    if (this.scene.textures.exists('hintPath')) {
      this.scene.textures.remove('hintPath');
    }
    const hintPath = this.scene.textures.createCanvas('hintPath', bounds.width, bounds.height);

    const context = hintPath.context;
    context.setLineDash([10, 10]);
    context.lineDashOffset = 5;
    context.lineWidth = 2;
    context.strokeStyle = '#fff';
    context.shadowColor = '#000';
    context.shadowOffsetY = 7;
    context.shadowBlur = 4;

    context.beginPath();
    gridSpaces.forEach(([x, y]) => {
      context.lineTo(40 * x + 19, 40 * y + 19);
    });
    context.stroke();
    hintPath.refresh();

    const sprite = this.createSprite(this.hintGroup, 0, 0, 'hintPath');
    sprite.alpha = 0;

    this.addResettableTween({
      targets: sprite,
      tweens: [
        {alpha: 1, duration: 830, ease: 'Quad.easeOut'},
        {alpha: 0.4, duration: 500, ease: 'Quad.easeInOut', yoyo: true, repeat: -1},
      ],
    });
  }

  /** Display groups are containers inside the controller's world group. */
  createGroup(yOffset = 0) {
    const group = this.scene.add.container(0, 0);
    group.yOffset = yOffset;
    this.controller.worldGroup.add(group);
    return group;
  }

  createGroups() {
    this.groundGroup = this.createGroup(-2);
    this.shadingGroup = this.createGroup(-2);
    this.hintGroup = this.createGroup();
    this.actionGroup = this.createGroup(-22);
    this.fluffGroup = this.createGroup(-160);
    this.fowGroup = this.createGroup(0);
  }

  resetGroups(levelData) {
    var sprite,
      x,
      y;

    this.groundGroup.removeAll(true);
    this.actionGroup.removeAll(true);
    this.hintGroup.removeAll(true);
    this.fluffGroup.removeAll(true);
    this.shadingGroup.removeAll(true);
    this.fowGroup.removeAll(true);

    this.baseShading = this.createGroup();

    this.actionPlaneBlocks = [];
    this.refreshGroundGroup();

    for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let position = new Position(x, y);
        sprite = null;

        const groundBlock = levelData.groundDecorationPlane.getBlockAt(position);
        if (!groundBlock.isEmpty) {
          sprite = this.createBlock(this.actionGroup, x, y, groundBlock.blockType);
          if (sprite) {
            sprite.sortOrder = this.yToIndex(y);
          }
        }

        const actionBlock = levelData.actionPlane.getBlockAt(position);
        if (!actionBlock.shouldRenderOnGroundPlane()) {
          this.createActionPlaneBlock(position, actionBlock.blockType);
        }
      }
    }

    for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let position = new Position(x, y);
        if (!levelData.fluffPlane.getBlockAt(position).isEmpty) {
          sprite = this.createBlock(this.fluffGroup, x, y, levelData.fluffPlane.getBlockAt(position).blockType);
        }
      }
    }

    // We might have some default states that should be updated now that the actionPlane is set
    this.controller.levelModel.actionPlane.refreshRedstone();
    this.controller.levelModel.actionPlane.resolveConduitState();
    this.refreshActionGroup(this.controller.levelModel.actionPlane.getAllPositions());
  }

  refreshGroundGroup() {
    this.groundGroup.removeAll(true);
    for (var y = 0; y < this.controller.levelModel.planeHeight; ++y) {
      for (var x = 0; x < this.controller.levelModel.planeWidth; ++x) {
        let position = new Position(x, y);
        const groundBlock = this.controller.levelModel.groundPlane.getBlockAt(position);
        var sprite = this.createBlock(this.groundGroup, x, y, groundBlock.blockType);

        if (sprite) {
          sprite.sortOrder = this.yToIndex(y);
        }

        const actionBlock = this.controller.levelModel.actionPlane.getBlockAt(position);
        if (actionBlock && actionBlock.shouldRenderOnGroundPlane()) {
          this.createActionPlaneBlock(position, actionBlock.blockType);
        }
      }
    }
  }

  refreshActionGroup(positions) {
    // We need to add indices to refresh if there are other blocks in the action plane that might
    // conflict with the drawing of refreshed blocks.
    for (let i = 0; i < positions.length; ++i) {
      const positionBelow = Position.south(positions[i]);
      const indexIsValid = this.controller.levelModel.actionPlane.inBounds(positionBelow);
      if (indexIsValid) {
        let blockToCheck = this.controller.levelModel.actionPlane.getBlockAt(positionBelow);
        const indexIsEmpty = blockToCheck.blockType === "";
        if (!indexIsEmpty) {
          positions.push(positionBelow);
        }
      }
    }

    // Once all blocks that need to be refreshed are accounted for, go in and actually refresh.
    positions.forEach(position => {
      if (position) {
        const newBlock = this.controller.levelModel.actionPlane.getBlockAt(position);

        // we don't want to refresh doors or conduits. They're not destroyable / placeable, and
        // refreshing will lead to bad animation states
        if (newBlock && newBlock.getIsDoor()
        || newBlock && (newBlock.getIsConduit() && newBlock.isActivatedConduit)) {
          return;
        }

        if ((newBlock && newBlock.getIsMiniblock())
        || newBlock && newBlock.getIsTree()) {
          return;
        }

        if (newBlock && newBlock.blockType) {
          this.createActionPlaneBlock(position, newBlock.blockType);
        } else if (newBlock) {
          // Remove the old sprite at this position, if there is one.
          const index = this.coordinatesToIndex(position);
          this.removeActionPlaneBlock(index);
        }
      }
    });
  }

  updateShadingGroup(shadingData) {
    var index, shadowItem, sx, sy, atlas;

    [this.baseShading, this.selectionIndicator].forEach(child => {
      if (child && this.shadingGroup.list.includes(child)) {
        this.shadingGroup.remove(child);
      }
    });
    this.shadingGroup.removeAll(true);

    this.shadingGroup.add(this.baseShading);
    // guard: during resetGroups the old indicator is already destroyed
    if (this.selectionIndicator && this.selectionIndicator.scene) {
      this.shadingGroup.add(this.selectionIndicator);
    }

    for (index = 0; index < shadingData.length; ++index) {
      shadowItem = shadingData[index];

      atlas = shadowItem.atlas;
      sx = 40 * shadowItem.x;
      sy = 40 * shadowItem.y;

      const sprite = this.createSprite(this.shadingGroup, sx, sy, atlas, shadowItem.type);
      if (atlas === 'WaterAO') {
        sprite.tint = 0x555555;
      }
    }
  }

  updateFowGroup(fowData) {
    var index, fx, fy, atlas;

    this.fowGroup.removeAll(true);

    for (index = 0; index < fowData.length; ++index) {
      let fowItem = fowData[index];

      if (fowItem !== "") {
        atlas = "undergroundFow";
        fx = -40 + 40 * fowItem.x;
        fy = -40 + 40 * fowItem.y;

        var sprite = this.createSprite(this.fowGroup, fx, fy, atlas, fowItem.type);
        sprite.alpha = 0.8;
      }
    }
  }

  playRandomPlayerIdle(facing, entity = this.player) {
    var facingName,
      rand,
      animationName;

    facingName = this.getDirectionName(facing);
    rand = Math.trunc(Math.random() * 4) + 1;

    switch (rand) {
      case 1:
        animationName = "idle";
        break;
      case 2:
        animationName = "lookLeft";
        break;
      case 3:
        animationName = "lookRight";
        break;
      case 4:
        animationName = "lookAtCam";
        break;
      default:
    }

    animationName += facingName;
    this.playScaledSpeed(entity.getAnimationTarget(), animationName);
  }

  generatePlayerCelebrateFrames() {
    let frameList = [];

    //Face Down
    for (let i = 0; i < 6; ++i) {
      frameList.push("Player_001");
    }
    //Crouch Left
    frameList = frameList.concat("Player_259");
    frameList = frameList.concat("Player_260");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Pause
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    frameList.push("Player_001");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");
    //Jump
    frameList.push("Player_261");
    frameList.push("Player_297");
    frameList.push("Player_298");
    frameList.push("Player_297");
    frameList.push("Player_261");

    return frameList;
  }

  generateFramesWithEndDelay(frameName, startFrame, endFrame, endFrameFullName, buffer, frameDelay) {
    var frameList = generateFrameNames(frameName, startFrame, endFrame, "", buffer);
    for (var i = 0; i < frameDelay; ++i) {
      frameList.push(endFrameFullName);
    }
    return frameList;
  }

  generateReverseFrames(frameName, startFrame, endFrame, suffix, buffer) {
    var frameList = generateFrameNames(frameName, startFrame, endFrame, suffix, buffer);
    return frameList.concat(generateFrameNames(frameName, endFrame - 1, startFrame, suffix, buffer));
  }

  preparePlayerSprite(playerName, entity = this.player) {
    // The rig carries the animations; the container is what moves (CE used
    // an invisible parent sprite with the rig as a child).
    entity.animationRig = this.scene.make.sprite(
      {x: 0, y: 0, key: `player${playerName}`, frame: 'Player_121'},
      false
    ).setOrigin(0, 0);
    entity.sprite = this.scene.add.container(0, 0, [entity.animationRig]);
    entity.sprite.sortOrder = 0;
    this.actionGroup.add(entity.sprite);

    if (this.controller.followingPlayer() && entity === this.player) {
      this.scene.cameras.main.startFollow(entity.sprite, true);
    }

    if (entity.shouldUpdateSelectionIndicator()) {
      this.selectionIndicator = this.createSprite(this.shadingGroup, 24, 44, 'selectionIndicator');
    }

    this.generateAnimations(FacingDirection.South, 0, entity);
    this.generateAnimations(FacingDirection.East, 60, entity);
    this.generateAnimations(FacingDirection.North, 120, entity);
    this.generateAnimations(FacingDirection.West, 180, entity);

    const frameRate = 20;
    const idleFrameRate = 10;
    let frameList;

    frameList = this.generateFramesWithEndDelay("Player_", 263, 262, "Player_262", 3, 5);
    frameList.push("Player_263");
    entity.addAnimation('lookAtCam_down', frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause_down");
    });

    frameList = this.generateFramesWithEndDelay("Player_", 270, 269, "Player_269", 3, 5);
    frameList.push("Player_270");
    entity.addAnimation('lookAtCam_right', frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause_right");
    });

    frameList = this.generateFramesWithEndDelay("Player_", 277, 276, "Player_276", 3, 5);
    frameList.push("Player_277");
    entity.addAnimation('lookAtCam_up', frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause_up");
    });

    frameList = this.generateFramesWithEndDelay("Player_", 284, 283, "Player_283", 3, 5);
    frameList.push("Player_284");
    entity.addAnimation('lookAtCam_left', frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause_left");
    });

    entity.addAnimation('mine_down', generateFrameNames("Player_", 241, 244, "", 3), frameRate, true);
    entity.addAnimation('mine_right', generateFrameNames("Player_", 245, 248, "", 3), frameRate, true);
    entity.addAnimation('mine_up', generateFrameNames("Player_", 249, 252, "", 3), frameRate, true);
    entity.addAnimation('mine_left', generateFrameNames("Player_", 253, 256, "", 3), frameRate, true);

    entity.addAnimation('mineCart_down', generateFrameNames("Minecart_", 5, 5, "", 2), frameRate, false);
    entity.addAnimation('mineCart_turnleft_down', generateFrameNames("Minecart_", 6, 6, "", 2), frameRate, false);
    entity.addAnimation('mineCart_turnright_down', generateFrameNames("Minecart_", 12, 12, "", 2), frameRate, false);

    entity.addAnimation('mineCart_right', generateFrameNames("Minecart_", 7, 7, "", 2), frameRate, false);
    entity.addAnimation('mineCart_left', generateFrameNames("Minecart_", 11, 11, "", 2), frameRate, false);

    entity.addAnimation('mineCart_up', generateFrameNames("Minecart_", 9, 9, "", 2), frameRate, false);
    entity.addAnimation('mineCart_turnleft_up', generateFrameNames("Minecart_", 10, 10, "", 2), frameRate, false);
    entity.addAnimation('mineCart_turnright_up', generateFrameNames("Minecart_", 8, 8, "", 2), frameRate, false);

    if (this.controller.levelModel.isUnderwater()) {
      let frameRate = 10;

      for (let [direction, offset] of [["down", 299], ["left", 306], ["up", 313], ["right", 320]]) {
        entity.addAnimation("walk_" + direction, generateFrameNames("Player_", offset + 1, offset + 4, "", 3), frameRate / 2, true);
      }

      for (let [direction, offset] of [["down", 327], ["left", 333], ["up", 345], ["right", 339]]) {
        const bumpKey = "bump_" + direction;
        entity.addAnimation(bumpKey, generateFrameNames("Player_", offset, offset + 5, "", 3), frameRate, false);
        entity.getAnimationTarget().on('animationstart', anim => {
          if (anim.key === bumpKey) {
            this.audioPlayer.play("bump");
          }
        });
      }

      for (let [direction, offset] of [["down", 351], ["left", 354], ["up", 360], ["right", 357]]) {
        const singlePunch = generateFrameNames("Player_", offset, offset + 2, "", 3);
        entity.addAnimation("punch_" + direction, singlePunch, frameRate, false, () => {
          this.audioPlayer.play("punch");
        });

        entity.addAnimation("punchDestroy_" + direction, singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      }
    }

    if (this.controller.levelModel.isInBoat()) {
      let frameRate = 10;
      for (let [direction, offset] of [["down", 9], ["left", 15], ["up", 21], ["right", 27]]) {
        entity.addAnimation("idle_" + direction, generateFrameNames("Boat_", offset, offset, "", 2), frameRate, true);
        entity.addAnimation("walk_" + direction, generateFrameNames("Boat_", offset, offset + 4, "", 2), frameRate, true);
        entity.addAnimation("celebrate_" + direction, ["Boat_49", "Boat_50", "Boat_49", "Boat_50", "Boat_49"], frameRate / 2, false);
      }

      for (let [direction, offset] of [["down", 51], ["left", 63], ["up", 69], ["right", 57]]) {
        const bumpKey = "bump_" + direction;
        entity.addAnimation(bumpKey, generateFrameNames("Boat_", offset, offset + 5, "", 2), frameRate, false);
        entity.getAnimationTarget().on('animationstart', anim => {
          if (anim.key === bumpKey) {
            this.audioPlayer.play("bump");
          }
        });
      }

      // Boat bobs up and down
      Boat.addBobTween(this, entity.animationRig);
    }
  }

  playerFrameName(n) {
    return generateFrameNames("Player_", n, n, "", 3);
  }

  /**
   * Create action animations for Alex, Steve and the Agent from the sprite
   * sheet and JSON map.
   * @param {FacingDirection} facing
   * @param {int} offset
   */
  generateAnimations(facing, offset, entity = this.player) {
    const direction = this.getDirectionName(facing);
    const idleFrameRate = 10;
    let frameRate = 20;

    let frameList = [];

    frameList.push(this.playerFrameName(offset + 1));
    frameList.push(this.playerFrameName(offset + 3));
    frameList.push(this.playerFrameName(offset + 1));
    frameList.push(this.playerFrameName(offset + 7));
    frameList.push(this.playerFrameName(offset + 9));
    frameList.push(this.playerFrameName(offset + 7));
    for (let i = 0; i < 5; ++i) {
      frameList.push(this.playerFrameName(offset + 1));
    }

    entity.addAnimation('idle' + direction, frameList, frameRate / 3, false, () => {
      this.playRandomPlayerIdle(facing, entity);
    });
    frameList = this.generateFramesWithEndDelay("Player_", offset + 6, offset + 5, this.playerFrameName(offset + 5), 3, 5);
    frameList.push(this.playerFrameName(offset + 6));
    entity.addAnimation('lookLeft' + direction, frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause" + direction);
    });
    frameList = this.generateFramesWithEndDelay("Player_", offset + 12, offset + 11, this.playerFrameName(offset + 11), 3, 5);
    frameList.push(this.playerFrameName(offset + 12));
    entity.addAnimation('lookRight' + direction, frameList, idleFrameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause" + direction);
    });
    frameList = [];
    for (let i = 0; i < 13; ++i) {
      frameList.push(this.playerFrameName(offset + 1));
    }
    entity.addAnimation('idlePause' + direction, frameList, frameRate / 3, false, () => {
      this.playRandomPlayerIdle(facing, entity);
    });

    entity.addAnimation('walk' + direction, generateFrameNames("Player_", offset + 13, offset + 20, "", 3), frameRate, true);
    let singlePunch = generateFrameNames("Player_", offset + 21, offset + 24, "", 3);
    entity.addAnimation('punch' + direction, singlePunch, frameRate, false, () => {
      this.audioPlayer.play("punch");
    });
    entity.addAnimation('punchDestroy' + direction, singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
    entity.addAnimation('hurt' + direction, generateFrameNames("Player_", offset + 25, offset + 28, "", 3), frameRate, false, () => {
      this.playScaledSpeed(entity.getAnimationTarget(), "idlePause" + direction);
    });
    entity.addAnimation('crouch' + direction, generateFrameNames("Player_", offset + 29, offset + 32, "", 3), frameRate, true);
    entity.addAnimation('jumpUp' + direction, generateFrameNames("Player_", offset + 33, offset + 36, "", 3), frameRate / 2, true);
    entity.addAnimation('fail' + direction, generateFrameNames("Player_", offset + 45, offset + 48, "", 3), frameRate, false);
    entity.addAnimation('celebrate' + direction, this.generatePlayerCelebrateFrames(), frameRate / 2, false);
    const bumpKey = 'bump' + direction;
    entity.addAnimation(bumpKey, generateFrameNames("Player_", offset + 49, offset + 54, "", 3), frameRate, false);
    entity.getAnimationTarget().on('animationstart', anim => {
      if (anim.key === bumpKey) {
        this.audioPlayer.play("bump");
      }
    });
    entity.addAnimation('jumpDown' + direction, generateFrameNames("Player_", offset + 55, offset + 60, "", 3), frameRate, true);
  }

  /**
   * Create a "miniblock" asset (representing a floating collectable) based on
   * the given block at the given coordinates
   *
   * @param {Number} x
   * @param {Number} y
   * @param {String} blockType
   * @param {Object} [overrides] optional overrides for various defaults
   * @param {Number} [overrides.collectibleDistance=2] distance at which the
   *        miniblock can be collected
   * @param {Number} [overrides.xOffsetRange=40]
   * @param {Number} [overrides.yOffsetRange=40]
   */
  createMiniBlock(x, y, blockType, overrides = {}) {
    function valueOr(value, defaultValue) {
      if (value === undefined) {
        return defaultValue;
      }
      return value;
    }

    let collectibleDistance = valueOr(overrides.collectibleDistance, 2);
    const xOffsetRange = valueOr(overrides.xOffsetRange, 40);
    const yOffsetRange = valueOr(overrides.yOffsetRange, 40);

    const frame = LevelBlock.getMiniblockFrame(blockType);
    if (!(frame && this.miniBlocks[frame])) {
      return null;
    }

    const atlas = "miniBlocks";
    const xOffset = 7 - (xOffsetRange / 2) + (Math.random() * xOffsetRange);
    const yOffset = 3 - (yOffsetRange / 2) + (Math.random() * yOffsetRange);
    const offset = new Position(xOffset, yOffset);

    const layer = overrides.isOnBlock ? -20 : 0;
    // Shadow + floating item travel together (CE parented them); a container
    // is the native equivalent so the acquire tween moves both.
    const sprite = this.scene.add.container(xOffset + 40 * x, yOffset + 40 * y + layer);
    const shadow = this.scene.make.sprite({x: 0, y: 0, key: atlas, frame: "shadow.png"}, false).setOrigin(0, 0);
    const item = this.scene.make.sprite({x: 0, y: 0, key: atlas, frame: this.miniBlocks[frame] + ".png"}, false).setOrigin(0, 0);
    sprite.add([shadow, item]);
    sprite.sortOrder = 0;
    this.actionGroup.add(sprite);

    const bounce = k => {
      if (k < 0.2) {
        return 1;
      } else if (k < 0.4) {
        return 2;
      } else if (k < 0.6) {
        return 1;
      } else if (k < 0.8) {
        return 0;
      } else if (k < 1) {
        return 1;
      } else {
        return 0;
      }
    };
    let onBounceComplete;
    if (overrides.onComplete) {
      // Player will auto-acquire the dropped miniblock before moving on.
      onBounceComplete = overrides.onComplete;
    } else {
      // If not auto-acquiring, add the miniblock to the list of collectible items.
      const distanceBetween = function (position, position2) {
        return Math.sqrt(Math.pow(position.x - position2.x, 2) + Math.pow(position.y - position2.y, 2));
      };

      const collectiblePosition = this.controller.levelModel.spritePositionToIndex(offset, new Position(sprite.x, sprite.y));

      this.collectibleItems.push([sprite, offset, blockType, collectibleDistance]);
      onBounceComplete = () => {
        if (this.controller.levelModel.usePlayer) {
          if (distanceBetween(this.player.position, collectiblePosition) < collectibleDistance) {
            this.player.collectItems(new Position(x, y));
          }
        }
      };
    }

    this.addResettableTween({
      targets: item,
      y: -8,
      duration: 350,
      ease: bounce,
      onComplete: onBounceComplete,
    });
    return sprite;
  }

  playAnimationWithRandomOffset(sprite, animationName) {
    this.playScaledSpeed(sprite, animationName);
    // Randomize the starting frame, so that not all bubbles/lavaPops are synchronized.
    sprite.anims.setProgress(Math.random());
  }

  psuedoRandomTint(group, sprite, x, y) {
    const psuedoRandom = Math.pow((x * 10) + y, 5) % 251;
    let darkness = psuedoRandom / 12;
    if (group === this.groundGroup) {
      darkness += 24;
    } else {
      darkness *= 0.75;
    }
    const brightness = Math.floor(0xff - darkness);
    sprite.setTint((brightness << 16) | (brightness << 8) | brightness);
  }

  createBlock(group, x, y, blockType) {
    const position = new Position(x, y);

    var i,
      sprite = null,
      frameList,
      atlas,
      frame,
      xOffset,
      yOffset;

    var buildTree = function (levelView, frame) {
      let type = blockType.substring(4);
      sprite = levelView.createBlock(group, x, y, "log" + type);
      sprite.fluff = levelView.createBlock(levelView.fluffGroup, x, y, "leaves" + type);
      sprite.onBlockDestroy = (logSprite) => {
        levelView.createAnim(logSprite.fluff, "despawn", generateFrameNames("Leaves_" + type, frame[0], frame[1], ".png", 0), 10, false, () => {
          levelView.toDestroy.push(logSprite.fluff);
          logSprite.fluff.setActive(false).setVisible(false);
        });

        levelView.playScaledSpeed(logSprite.fluff, "despawn");
      };
      levelView.trees.push({ sprite: sprite, type: blockType, position: position });
    };

    const buildDoor = (levelView, type) => {
      atlas = this.blocks[blockType][0];
      frame = this.blocks[blockType][1];
      xOffset = this.blocks[blockType][2];
      yOffset = this.blocks[blockType][3];
      sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);

      frameList = [];
      var animationFramesIron = generateFrameNames(type, 0, 3, "", 1);
      for (let j = 0; j < 5; ++j) {
        frameList.push(`${type}0`);
      }
      frameList = frameList.concat(animationFramesIron);
      this.createAnim(sprite, "open", frameList);

      frameList = [];
      animationFramesIron = generateFrameNames(type, 3, 0, "", 1);
      for (let j = 0; j < 5; ++j) {
        frameList.push(`${type}3`);
      }
      frameList = frameList.concat(animationFramesIron);
      this.createAnim(sprite, "close", frameList);

      return sprite;
    };

    switch (blockType) {
      case "treeAcacia": //0,7
        buildTree(this, [0, 7]);
        break;
      case "treeBirch":  //0,8
        buildTree(this, [0, 8]);
        break;
      case "treeJungle": //0,9
        buildTree(this, [0, 9]);
        break;
      case "treeOak":
        buildTree(this, [0, 6]);
        break;
      case "treeSpruce": //0,8
        buildTree(this, [0, 8]);
        break;
      case "treeSpruceSnowy": //1,9
        buildTree(this, [0, 8]);
        break;
      case "cropWheat":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Wheat", 0, 2, "", 0);
        this.createAnim(sprite, "idle", frameList, 0.4, false);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "torch":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Torch", 0, 23, "", 0);
        this.createAnim(sprite, "idle", frameList, 15, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "water":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Water_", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      //for placing wetland for crops in free play
      case "watering":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        sprite.setActive(false).setVisible(false);
        this.toDestroy.push(sprite);
        this.createBlock(this.groundGroup, x, y, "farmlandWet");
        this.refreshGroundGroup();
        break;

      case "lava":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Lava_", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "magmaBlock":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Magma_Block", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "magmaUnderwater":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Magma_Bubble_Boat", 0, 5, "", 0);

        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playAnimationWithRandomOffset(sprite, "idle");
        break;

      case "magmaDeep":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Magma_Bubble_Deep", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playAnimationWithRandomOffset(sprite, "idle");
        break;

      case "bubbleColumn":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Bubble_Column", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playAnimationWithRandomOffset(sprite, "idle");
        break;

      case "conduit":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);

        frameList = generateFrameNames("Conduit", 3, 10, "", 2);
        this.createAnim(sprite, "open", frameList, 5, true);

        frameList = generateFrameNames("Conduit", 0, 2, "", 2);
        this.createAnim(sprite, "activation", frameList, 5, false);
        this.createAnim(sprite, "deactivation", frameList.reverse(), 5, false);

        break;

      case "prismarine":
        this.initPrismarine();
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, 'prismarine');
        break;

      case "seaLantern":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Sea_Lantern", 0, 4, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "seaGrass":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Seagrass", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle", 0.5);
        break;

      case "kelp":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("KelpSingle_", 0, 5, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle", 0.5);
        break;

      case "Chest":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Chest", 0, 2, "", 0);
        this.createAnim(sprite, "open", frameList, 5, false);
        break;

      case "NetherPortal":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("NetherPortal", 1, 6, "", 0);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "lavaPop":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("LavaPop", 1, 7, "", 2);
        for (i = 0; i < 4; ++i) {
          frameList.push("LavaPop07");
        }
        frameList = frameList.concat(generateFrameNames("LavaPop", 8, 13, "", 2));
        for (i = 0; i < 3; ++i) {
          frameList.push("LavaPop13");
        }
        frameList = frameList.concat(generateFrameNames("LavaPop", 14, 30, "", 2));
        for (i = 0; i < 8; ++i) {
          frameList.push("LavaPop01");
        }
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playAnimationWithRandomOffset(sprite, "idle");
        break;

      case "fire":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Fire", 0, 14, "", 2);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "bubbles":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Bubbles", 0, 14, "", 2);
        this.createAnim(sprite, "idle", frameList, 5, true);
        this.playScaledSpeed(sprite, "idle");
        break;

      case "explosion":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("Explosion", 0, 16, "", 1);
        this.createAnim(sprite, "idle", frameList, 15, false, () => {
          this.toDestroy.push(sprite);
          sprite.setActive(false).setVisible(false);
        });
        this.playScaledSpeed(sprite, "idle");
        break;

      case "door":
        sprite = buildDoor(this, "Door");
        break;

      case "doorIron":
        sprite = buildDoor(this, "DoorIron");
        if (this.blockReceivesCornerShadow(x, y)) {
          this.addCornerShadow(sprite, -40, 55, y);
        }
        break;

      case "tnt":
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        frameList = generateFrameNames("TNTexplosion", 0, 8, "", 0);
        this.createAnim(sprite, "explode", frameList, 7, false, () => {
          this.playExplosionCloudAnimation(position);
          sprite.setActive(false).setVisible(false);
          this.toDestroy.push(sprite);
          this.actionPlaneBlocks[this.coordinatesToIndex(position)] = null;
        });
        break;

      default:
        if (!this.blocks[blockType]) {
          throw new Error(`Unknown block type: ${blockType}`);
        }
        atlas = this.blocks[blockType][0];
        frame = this.blocks[blockType][1];
        xOffset = this.blocks[blockType][2];
        yOffset = this.blocks[blockType][3];
        sprite = this.createSprite(group, xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
        if (group === this.actionGroup || group === this.groundGroup) {
          if (!LevelBlock.isWalkable(blockType)) {
            this.psuedoRandomTint(group, sprite, x, y);
          }
        }
        if (group === this.actionGroup && !LevelBlock.isWalkable(blockType) && this.blockReceivesCornerShadow(x, y)) {
          let xShadow = -39;
          let yShadow = 40;
          if (blockType.startsWith("pistonArm")) {
            xShadow = -26;
            yShadow = 53;
          }
          this.addCornerShadow(sprite, xShadow, yShadow, y);
        }
        if (blockType.startsWith('redstoneWire') && blockType.endsWith('On')) {
          this.addRedstoneSparkle(sprite, y);
        }
        break;
    }

    return sprite;
  }

  /**
   * Blocks never move, so their CE child sprites (corner shadows) become
   * absolutely-positioned siblings that render just above the block.
   */
  addCornerShadow(blockSprite, dx, dy, gridY) {
    const shadow = this.scene.make.sprite(
      {x: blockSprite.x + dx, y: blockSprite.y + dy, key: "blockShadows", frame: "Shadow_Parts_Fade_overlap.png"},
      false
    ).setOrigin(0, 0);
    shadow.sortOrder = this.yToIndex(gridY) + 0.5;
    this.actionGroup.add(shadow);
    blockSprite.once('destroy', () => {
      if (shadow.scene) {
        shadow.destroy();
      }
    });
    return shadow;
  }

  addRedstoneSparkle(blockSprite, gridY) {
    const blank = "redstone_sparkle99.png";
    const baseX = blockSprite.x;
    const baseY = blockSprite.y;
    const sprite = this.scene.make.sprite(
      {x: baseX + 20, y: baseY + 25, key: "redstoneSparkle", frame: blank},
      false
    ).setOrigin(0, 0);
    sprite.sortOrder = this.yToIndex(gridY) + 0.5;
    this.actionGroup.add(sprite);
    blockSprite.once('destroy', () => {
      if (sprite.scene) {
        sprite.destroy();
      }
    });

    // Establish the three different animations.
    for (let i = 0; i < 3; i++) {
      const n = i * 8;
      const frames = [blank].concat(generateFrameNames("redstone_sparkle", n, n + 7, ".png"), blank);
      this.createAnim(sprite, `fizz_${i}`, frames, 7);
    }

    const playRandomSparkle = () => {
      setTimeout(() => {
        if (!sprite.active || !sprite.scene) {
          return;
        }

        // Pick one of the animations to play.
        let whichAnim = Math.floor(Math.random() * 3);
        this.playScaledSpeed(sprite, `fizz_${whichAnim}`);
        this.onAnimationEnd(sprite, `fizz_${whichAnim}`, playRandomSparkle);

        // Randomize which corner of the index the animation manifests in.
        sprite.x = baseX + ((Math.random() > 0.5) ? 0 : 20);
        sprite.y = baseY + ((Math.random() > 0.5) ? 0 : 20);
      }, randomInt(500, 7000) / this.controller.tweenTimeScale);
    };

    playRandomSparkle();

    return sprite;
  }

  blockReceivesCornerShadow(x, y) {
    const southBlock = this.controller.levelModel.actionPlane.getBlockAt([x, y + 1]);
    if (!southBlock || (southBlock.blockType && !southBlock.isWalkable)) {
      return false;
    }

    const southWestBlock = this.controller.levelModel.actionPlane.getBlockAt([x - 1, y + 1]);
    return southWestBlock && southWestBlock.blockType && !southWestBlock.isWalkable;
  }

  isUnderTree(treeIndex, position) {
    // invalid index
    if (treeIndex >= this.trees.length || treeIndex < 0) {
      return false;
    }
    var fluffPositions = this.treeFluffTypes[this.trees[treeIndex].type];
    for (var i = 0; i < fluffPositions.length; i++) {
      if (this.trees[treeIndex].position[0] + fluffPositions[i][0] === position[0] && this.trees[treeIndex].position[1] + fluffPositions[i][1] === position[1]) {
        return true;
      }
    }
    return false;
  }

  changeTreeAlpha(treeIndex, alpha) {
    this.addResettableTween({
      targets: this.trees[treeIndex].sprite.fluff,
      alpha: alpha,
      duration: 300,
      ease: 'Linear',
    });
  }

  onAnimationEnd(sprite, key, completionHandler) {
    sprite.once('animationcomplete-' + key, completionHandler);
  }

  onAnimationStart(sprite, key, completionHandler) {
    const handler = anim => {
      if (anim.key === key) {
        sprite.off('animationstart', handler);
        completionHandler();
      }
    };
    sprite.on('animationstart', handler);
  }

  onAnimationLoopOnce(sprite, key, completionHandler) {
    const handler = anim => {
      if (anim.key === key) {
        sprite.off('animationrepeat', handler);
        completionHandler();
      }
    };
    sprite.on('animationrepeat', handler);
  }

  /**
   * Create a tween (or chain, when config.tweens is set) that reset() stops.
   * CE ran all logic on a clock dilated by slowMotion; timeScale bakes that in.
   */
  addResettableTween(config) {
    const tween = config.tweens
      ? this.scene.tweens.chain(config)
      : this.scene.tweens.add(config);
    tween.timeScale = this.controller.tweenTimeScale / this.controller.slowMotion;
    this.resettableTweens.push(tween);
    return tween;
  }

  /**
  * Animate Door and set the status
  */
  animateDoor(index, open) {
    let player = this.controller.levelModel.player;
    this.setSelectionIndicatorPosition(this.controller.levelModel.actionPlane.indexToCoordinates(index)[0], this.controller.levelModel.actionPlane.indexToCoordinates(index)[1]);
    this.controller.audioPlayer.play("doorOpen");
    // If it's not walable, then open otherwise, close.
    const position = this.controller.levelModel.actionPlane.indexToCoordinates(index);
    this.playDoorAnimation(position, open, () => {
      const block = this.controller.levelModel.actionPlane.getBlockAt(position);
      block.isWalkable = block.isOpen;
      if (block.blockType !== "doorIron") {
        // Iron doors don't need to set the player animation to Idle, because they're not opened with 'use'.
        this.playIdleAnimation(player.position, player.facing, player.isOnBlock, player);
      }
      this.setSelectionIndicatorPosition(player.position[0], player.position[1]);
    });
  }

};
