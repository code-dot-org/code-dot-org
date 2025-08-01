import * as Phaser from 'phaser';

import type BaseEntity from '../BaseEntity';
import type Agent from '../entities/Agent';
import type Player from '../entities/Player';
import FacingDirection, {Direction} from '../FacingDirection';
import type {AudioPlayer, LevelRunnerScene} from '../GameController';
import Position from '../Position';
import waveShader from '../shaders/waveShader.glsl';
import {randomInt} from '../utils';

import LevelBlock from './LevelBlock';
import type LevelModel from './LevelModel';
import type {FowPlaneItem, ShadingPlaneItem} from './LevelModel';

export interface Uniform {
  type: 'lf' | '4fv' | 'sampler2D';
  value: null | number | number[];
}

export interface Uniforms {
  [key: string]: Uniform;
}

const MIDX: number = 20;
const MIDY: number = 20;

class UnderwaterEffectPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private targetTexture?: Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper;

  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'underwater',
      fragShader: waveShader,
    });
  }

  onPreRender() {
    this.set1f('iTime', this.game.loop.time);
    this.set4fv('tint', [67 / 255, 213 / 255, 238 / 255, 1]);
  }

  onBoot() {
    // Get the water overlay frames
    const texture = this.game.textures.get('underwaterOverlay');
    const source = texture.source[0];

    // Make sure the source image is pixelated when sampled
    source.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Retain the texture reference so we can set it during onDraw to texture '1'
    this.targetTexture = source.glTexture || undefined;

    // Ensure that our uniform points to texture '1'
    this.set1i('underwaterOverlay', 1);
  }

  onDraw(renderTarget: Phaser.Renderer.WebGL.RenderTarget) {
    // Bind our existing texture reference to texture '1'
    // (which our uniform sampler2D points to)
    if (this.targetTexture) {
      this.bindTexture(this.targetTexture, 1);
    }
    this.bindAndDraw(renderTarget);
  }
}

class LevelView {
  audioPlayer: AudioPlayer;
  scene: LevelRunnerScene;
  baseShading?: Phaser.GameObjects.Container;
  waveShader?: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;
  player?: Player;
  agent?: Agent;
  selectionIndicator?: Phaser.GameObjects.Rectangle;
  groundGroup!: Phaser.GameObjects.Container;
  shadingGroup!: Phaser.GameObjects.Container;
  hintGroup!: Phaser.GameObjects.Container;
  actionGroup!: Phaser.GameObjects.Container;
  fluffGroup!: Phaser.GameObjects.Container;
  fowGroup!: Phaser.GameObjects.Container;
  airGroup!: Phaser.GameObjects.Container;
  collectibleItems: [Phaser.GameObjects.Sprite, Position, string, number][] = [];
  //{sprite : sprite, type : blockType, position : [x,y]}
  trees: {
    sprite: Phaser.GameObjects.Sprite;
    type: string;
    position: Position;
  }[] = [];
  miniBlocks: {
    [key: string]: string;
  };
  blocks: {
    [key: string]: [string, string, number, number];
  };
  /** Maintains a mapping from block index to Sprite for the action plane */
  actionPlaneBlocks: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
  /** Maintains a mapping from block index to animation effect for a block */
  blockEffects: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
  resettableTweens: Phaser.Tweens.Tween[] = [];
  treeFluffTypes: {
    [key: string]: [number, number][];
  };
  worldContainer!: Phaser.GameObjects.Container;
  world!: Phaser.GameObjects.RenderTexture;

  constructor(scene: LevelRunnerScene) {
    this.scene = scene;
    this.audioPlayer = scene.audioPlayer;

    this.miniBlocks = {
      bed: 'bed',
      boat: 'boat',
      bookEnchanted: 'book_enchanted',
      bricks: 'bricks',
      bucketEmpty: 'bucket_empty',
      bucketLava: 'bucket_lava',
      milk: 'bucket_milk',
      bucketWater: 'bucket_water',
      cactus: 'cactus',
      carrots: 'carrot',
      chest: 'chest',
      clay: 'clay_ball',
      coal: 'coal',
      dirtCoarse: 'coarse_dirt',
      cobblestone: 'cobblestone',
      compass: 'compass',
      blackConcrete: 'concrete_black',
      blueConcrete: 'concrete_blue',
      brownConcrete: 'concrete_brown',
      blackConcretePowder: 'concrete_powder_black',
      blueConcretePowder: 'concrete_powder_blue',
      brownConcretePowder: 'concrete_powder_brown',
      deadbush: 'deadbush',
      diamond: 'diamond',
      axeDiamond: 'diamond_axe',
      pickaxeDiamond: 'diamond_pickaxe',
      shovelDiamond: 'diamond_shovel',
      dirt: 'dirt',
      door: 'door',
      doorIron: 'door_iron',
      egg: 'egg',
      emerald: 'emerald',
      flint: 'flint',
      flintAndSteel: 'flint_and_steel',
      daisy: 'flower_daisy',
      dandelion: 'flower_dandelion',
      poppy: 'flower_rose',
      glowstoneDust: 'glowstone_dust',
      ingotGold: 'gold_ingot',
      gravel: 'gravel',
      gunPowder: 'gunpowder',
      hardenedClay: 'hardend_clay',
      hardenedClayBlack: 'hardened_clay_stained_black',
      hardenedClayBlue: 'hardened_clay_stained_blue',
      hardenedClayBrown: 'hardened_clay_stained_brown',
      hardenedClayCyan: 'hardened_clay_stained_cyan',
      hardenedClayGray: 'hardened_clay_stained_gray',
      hardenedClayGreen: 'hardened_clay_stained_green',
      hardenedClayLightBlue: 'hardened_clay_stained_light_blue',
      hardenedClayLime: 'hardened_clay_stained_lime',
      hardenedClayMagenta: 'hardened_clay_stained_magenta',
      hardenedClayOrange: 'hardened_clay_stained_orange',
      hardenedClayPink: 'hardened_clay_stained_pink',
      hardenedClayPurple: 'hardened_clay_stained_purple',
      hardenedClayRed: 'hardened_clay_stained_red',
      hardenedClaySilver: 'hardened_clay_stained_silver',
      hardenedClayWhite: 'hardened_clay_stained_white',
      hardenedClayYellow: 'hardened_clay_stained_yellow',
      heartofthesea: 'heartofthesea_closed',
      ingotIron: 'iron_ingot',
      lapisLazuli: 'lapis_lazuli',
      logAcacia: 'log_acacia',
      logBirch: 'log_birch',
      logJungle: 'log_jungle',
      logOak: 'log_oak',
      logSpruce: 'log_spruce',
      mapEmpty: 'map_empty',
      minecart: 'minecart_normal',
      nautilus: 'nautilus',
      netherbrick: 'netherbrick',
      netherrack: 'netherrack',
      obsidian: 'obsidian',
      piston: 'piston',
      planksAcacia: 'planks_acacia',
      planksBirch: 'planks_birch',
      planksJungle: 'planks_jungle',
      planksOak: 'planks_oak',
      planksSpruce: 'planks_spruce',
      potato: 'potato',
      potion: 'potion_bottle_drinkable',
      pressurePlateOak: 'pressure_plate_oak',
      prismarine: 'prismarine',
      quartzOre: 'quartz',
      railGolden: 'rail_golden',
      railNormal: 'rail_normal',
      redstoneDust: 'redstone_dust',
      redstoneTorch: 'redstone_torch',
      reeds: 'reeds',
      sand: 'sand',
      sandstone: 'sandstone',
      seaPickles: 'sea_pickle',
      seedsWheat: 'seeds_wheat',
      snow: 'snow',
      snowBall: 'snowball',
      tnt: 'tnt',
      torch: 'torch',
      turtle: 'turtle',
      cropWheat: 'wheat',
      wool_black: 'wool_colored_black',
      wool_blue: 'wool_colored_blue',
      wool_brown: 'wool_colored_brown',
      wool_cyan: 'wool_colored_cyan',
      wool_gray: 'wool_colored_gray',
      wool_green: 'wool_colored_green',
      wool_light_blue: 'wool_colored_light_blue',
      wool_lime: 'wool_colored_lime',
      wool_magenta: 'wool_colored_magenta',
      wool_orange: 'wool_colored_orange',
      wool_pink: 'wool_colored_pink',
      wool_purple: 'wool_colored_purple',
      wool_red: 'wool_colored_red',
      wool_silver: 'wool_colored_silver',
      wool: 'wool_colored_white',
      wool_yellow: 'wool_colored_yellow',
    };

    this.blocks = {
      bedrock: ['blocks', 'Bedrock', 0, 13],
      bricks: ['blocks', 'Bricks', 0, 13],
      oreCoal: ['blocks', 'Coal_Ore', 0, 13],
      dirtCoarse: ['blocks', 'Coarse_Dirt', 0, 13],
      cobblestone: ['blocks', 'Cobblestone', 0, 13],
      oreDiamond: ['blocks', 'Diamond_Ore', 0, 13],
      dirt: ['blocks', 'Dirt', 0, 13],
      oreEmerald: ['blocks', 'Emerald_Ore', 0, 13],
      farmlandWet: ['blocks', 'Farmland_Wet', 0, 13],
      flowerDandelion: ['blocks', 'Flower_Dandelion', 0, 13],
      flowerOxeeye: ['blocks', 'Flower_Oxeeye', 0, 13],
      flowerRose: ['blocks', 'Flower_Rose', 0, 13],
      glass: ['blocks', 'Glass', 0, 13],
      oreGold: ['blocks', 'Gold_Ore', 0, 13],
      grass: ['blocks', 'Grass', 0, 13],
      gravel: ['blocks', 'Gravel', 0, 13],
      oreIron: ['blocks', 'Iron_Ore', 0, 13],
      oreLapis: ['blocks', 'Lapis_Ore', 0, 13],
      lava: ['blocks', 'Lava_0', 0, 13],
      logAcacia: ['blocks', 'Log_Acacia', 0, 13],
      logBirch: ['blocks', 'Log_Birch', 0, 13],
      logJungle: ['blocks', 'Log_Jungle', 0, 13],
      logOak: ['blocks', 'Log_Oak', 0, 13],
      logSpruce: ['blocks', 'Log_Spruce', 0, 13],
      logSpruceSnowy: ['blocks', 'Log_Spruce', 0, 13],
      obsidian: ['blocks', 'Obsidian', 0, 13],
      planksAcacia: ['blocks', 'Planks_Acacia', 0, 13],
      planksBirch: ['blocks', 'Planks_Birch', 0, 13],
      planksJungle: ['blocks', 'Planks_Jungle', 0, 13],
      planksOak: ['blocks', 'Planks_Oak', 0, 13],
      planksSpruce: ['blocks', 'Planks_Spruce', 0, 13],
      oreRedstone: ['blocks', 'Redstone_Ore', 0, 13],
      sand: ['blocks', 'Sand', 0, 13],
      sandstone: ['blocks', 'Sandstone', 0, 13],
      stone: ['blocks', 'Stone', 0, 13],
      tnt: ['tnt', 'TNTexplosion0', -80, -58],
      water: ['blocks', 'Water_0', 0, 13],
      wool: ['blocks', 'Wool_White', 0, 13],
      wool_orange: ['blocks', 'Wool_Orange', 0, 13],
      wool_black: ['blocks', 'Wool_Black', 0, 13],
      wool_blue: ['blocks', 'Wool_Blue', 0, 13],
      wool_brown: ['blocks', 'Wool_Brown', 0, 13],
      wool_cyan: ['blocks', 'Wool_Cyan', 0, 13],
      wool_gray: ['blocks', 'Wool_Gray', 0, 13],
      wool_green: ['blocks', 'Wool_Green', 0, 13],
      wool_light_blue: ['blocks', 'Wool_LightBlue', 0, 13],
      wool_lime: ['blocks', 'Wool_Lime', 0, 13],
      wool_magenta: ['blocks', 'Wool_Magenta', 0, 13],
      wool_pink: ['blocks', 'Wool_Pink', 0, 13],
      wool_purple: ['blocks', 'Wool_Purple', 0, 13],
      wool_red: ['blocks', 'Wool_Red', 0, 13],
      wool_silver: ['blocks', 'Wool_Silver', 0, 13],
      wool_yellow: ['blocks', 'Wool_Yellow', 0, 13],

      leavesAcacia: ['leavesAcacia', 'Leaves_Acacia0.png', 1, 14],
      leavesBirch: ['leavesBirch', 'Leaves_Birch0.png', 1, 14],
      leavesJungle: ['leavesJungle', 'Leaves_Jungle0.png', 1, 14],
      leavesOak: ['leavesOak', 'Leaves_Oak0.png', 1, 14],
      leavesSpruce: ['leavesSpruce', 'Leaves_Spruce0.png', 1, 14],
      leavesSpruceSnowy: [
        'leavesSpruceSnowy',
        'Leaves_SpruceSnowy0.png',
        1,
        36,
      ],

      watering: ['blocks', 'Water_0', 0, 13],
      cropWheat: ['blocks', 'Wheat0', 0, 13],
      torch: ['torch', 'Torch0', 0, 13],

      tallGrass: ['blocks', 'TallGrass', 0, 13],

      lavaPop: ['lavaPop', 'LavaPop01', 0, 13],
      redstoneSparkle: ['redstoneSparkle', 'redstone_sparkle1.png', 7, 23],
      fire: ['fire', '', -11, 135],
      bubbles: ['bubbles', '', -11, 135],
      explosion: ['explosion', '', -70, 60],

      door: ['door', '', -12, -15],
      doorIron: ['doorIron', '', -12, -15],

      rails: ['blocks', 'Rails_Vertical', 0, 13],
      railsNorthEast: ['blocks', 'Rails_BottomLeft', 0, 13],
      railsNorthWest: ['blocks', 'Rails_BottomRight', 0, 13],
      railsEast: ['blocks', 'Rails_Horizontal', 0, 13],
      railsWest: ['blocks', 'Rails_Horizontal', 0, 13],
      railsEastWest: ['blocks', 'Rails_Horizontal', 0, 13],
      railsSouthEast: ['blocks', 'Rails_TopLeft', 0, 13],
      railsSouthWest: ['blocks', 'Rails_TopRight', 0, 13],
      railsNorth: ['blocks', 'Rails_Vertical', 0, 13],
      railsSouth: ['blocks', 'Rails_Vertical', 0, 13],
      railsNorthSouth: ['blocks', 'Rails_Vertical', 0, 13],

      railsUnpowered: ['blocks', 'Rails_UnpoweredVertical', 0, 13],
      railsUnpoweredNorth: ['blocks', 'Rails_UnpoweredVertical', 0, 13],
      railsUnpoweredSouth: ['blocks', 'Rails_UnpoweredVertical', 0, 13],
      railsUnpoweredNorthSouth: ['blocks', 'Rails_UnpoweredVertical', 0, 13],
      railsUnpoweredEast: ['blocks', 'Rails_UnpoweredHorizontal', 0, 13],
      railsUnpoweredWest: ['blocks', 'Rails_UnpoweredHorizontal', 0, 13],
      railsUnpoweredEastWest: ['blocks', 'Rails_UnpoweredHorizontal', 0, 13],

      railsPowered: ['blocks', 'Rails_PoweredVertical', 0, 13],
      railsPoweredNorth: ['blocks', 'Rails_PoweredVertical', 0, 13],
      railsPoweredSouth: ['blocks', 'Rails_PoweredVertical', 0, 13],
      railsPoweredNorthSouth: ['blocks', 'Rails_PoweredVertical', 0, 13],
      railsPoweredEast: ['blocks', 'Rails_PoweredHorizontal', 0, 13],
      railsPoweredWest: ['blocks', 'Rails_PoweredHorizontal', 0, 13],
      railsPoweredEastWest: ['blocks', 'Rails_PoweredHorizontal', 0, 13],

      railsRedstoneTorch: ['blocks', 'Rails_RedstoneTorch', 0, 22],

      redstoneWire: ['blocks', 'redstone_dust_dot_off', 0, 13],
      redstoneWireHorizontal: ['blocks', 'redstone_dust_line_h_off', 0, 13],
      redstoneWireVertical: ['blocks', 'redstone_dust_line_v_off', 0, 13],
      redstoneWireUpRight: [
        'blocks',
        'redstone_dust_corner_BottomLeft_off',
        0,
        13,
      ],
      redstoneWireUpLeft: [
        'blocks',
        'redstone_dust_corner_BottomRight_off',
        0,
        13,
      ],
      redstoneWireDownRight: [
        'blocks',
        'redstone_dust_corner_TopLeft_off',
        0,
        13,
      ],
      redstoneWireDownLeft: [
        'blocks',
        'redstone_dust_corner_TopRight_off',
        0,
        13,
      ],
      redstoneWireTUp: ['blocks', 'redstone_dust_cross_up_off', 0, 13],
      redstoneWireTDown: ['blocks', 'redstone_dust_cross_down_off', 0, 13],
      redstoneWireTLeft: ['blocks', 'redstone_dust_cross_left_off', 0, 13],
      redstoneWireTRight: ['blocks', 'redstone_dust_cross_right_off', 0, 13],
      redstoneWireCross: ['blocks', 'redstone_dust_cross_off', 0, 13],

      redstoneWireOn: ['blocks', 'redstone_dust_dot', 0, 13],
      redstoneWireHorizontalOn: ['blocks', 'redstone_dust_line_h', 0, 13],
      redstoneWireVerticalOn: ['blocks', 'redstone_dust_line_v', 0, 13],
      redstoneWireUpRightOn: [
        'blocks',
        'redstone_dust_corner_BottomLeft',
        0,
        13,
      ],
      redstoneWireUpLeftOn: [
        'blocks',
        'redstone_dust_corner_BottomRight',
        0,
        13,
      ],
      redstoneWireDownRightOn: [
        'blocks',
        'redstone_dust_corner_TopLeft',
        0,
        13,
      ],
      redstoneWireDownLeftOn: [
        'blocks',
        'redstone_dust_corner_TopRight',
        0,
        13,
      ],
      redstoneWireTUpOn: ['blocks', 'redstone_dust_cross_up', 0, 13],
      redstoneWireTDownOn: ['blocks', 'redstone_dust_cross_down', 0, 13],
      redstoneWireTLeftOn: ['blocks', 'redstone_dust_cross_left', 0, 13],
      redstoneWireTRightOn: ['blocks', 'redstone_dust_cross_right', 0, 13],
      redstoneWireCrossOn: ['blocks', 'redstone_dust_cross', 0, 13],

      pressurePlateUp: ['blocks', 'PressurePlate_Up', 0, 13],
      pressurePlateDown: ['blocks', 'PressurePlate_Down', 0, 13],

      pistonUp: ['blocks', 'piston_up', 0, 13],
      pistonDown: ['blocks', 'piston_down', 0, 13],
      pistonLeft: ['blocks', 'piston_left', 0, 13],
      pistonRight: ['blocks', 'piston_right', 0, 13],
      pistonUpOn: ['blocks', 'piston_base_up', 0, 13],
      pistonDownOn: ['blocks', 'piston_base_down', 0, 13],
      pistonLeftOn: ['blocks', 'piston_base_left', 0, 13],
      pistonRightOn: ['blocks', 'piston_base_right', 0, 13],

      pistonArmLeft: ['blocks', 'piston_arm_left', 0, 13],
      pistonArmRight: ['blocks', 'piston_arm_right', 0, 13],
      pistonArmUp: ['blocks', 'piston_arm_up', 0, 13],
      pistonArmDown: ['blocks', 'piston_arm_down', 0, 13],

      pistonUpSticky: ['blocks', 'piston_up', 0, 13],
      pistonDownSticky: ['blocks', 'piston_down_sticky', 0, 13],
      pistonLeftSticky: ['blocks', 'piston_left', 0, 13],
      pistonRightSticky: ['blocks', 'piston_right', 0, 13],
      pistonUpOnSticky: ['blocks', 'piston_base_up', 0, 13],
      pistonDownOnSticky: ['blocks', 'piston_base_down_sticky', 0, 13],
      pistonLeftOnSticky: ['blocks', 'piston_base_left', 0, 13],
      pistonRightOnSticky: ['blocks', 'piston_base_right', 0, 13],

      pistonArmLeftSticky: ['blocks', 'piston_arm_left', 0, 13],
      pistonArmRightSticky: ['blocks', 'piston_arm_right', 0, 13],
      pistonArmUpSticky: ['blocks', 'piston_arm_up', 0, 13],
      pistonArmDownSticky: ['blocks', 'piston_arm_down_sticky', 0, 13],

      cactus: ['blocks', 'cactus', 0, 13],
      deadBush: ['blocks', 'dead_bush', 0, 13],
      glowstone: ['blocks', 'glowstone', 0, 13],
      grassPath: ['blocks', 'grass_path', 0, 13],
      ice: ['blocks', 'ice', 0, 13],
      netherrack: ['blocks', 'netherrack', 0, 13],
      netherBrick: ['blocks', 'nether_brick', 0, 13],
      quartzOre: ['blocks', 'quartz_ore', 0, 13],
      snow: ['blocks', 'snow', 0, 13],
      snowyGrass: ['blocks', 'snowy_grass', 0, 13],
      topSnow: ['blocks', 'top_snow', 0, 13],

      sandDeep: ['blocks', 'Sand_Deep', 0, 13],
      gravelDeep: ['blocks', 'Gravel_Deep', 0, 13],
      reeds: ['blocks', 'Reeds', -13, -18],
      Nether_Portal: ['blocks', 'NetherPortal1', 62, -10],

      //hooking up all old blocks that we had assets for but never used in previous years
      bedFoot: ['blocks', 'Bed_Foot', 0, 13],
      bedHead: ['blocks', 'Bed_Head', -13, 10],
      clay: ['blocks', 'Clay', 0, 13],
      glassBlack: ['blocks', 'Glass_Black', 0, 13],
      glassBlue: ['blocks', 'Glass_Blue', 0, 13],
      glassBrown: ['blocks', 'Glass_Brown', 0, 13],
      glassCyan: ['blocks', 'Glass_Cyan', 0, 13],
      glassGray: ['blocks', 'Glass_Gray', 0, 13],
      glassGreen: ['blocks', 'Glass_Green', 0, 13],
      glassLightBlue: ['blocks', 'Glass_LightBlue', 0, 13],
      glassLime: ['blocks', 'Glass_Lime', 0, 13],
      glassMagenta: ['blocks', 'Glass_Magenta', 0, 13],
      glassOrange: ['blocks', 'Glass_Orange', 0, 13],
      glassPink: ['blocks', 'Glass_Pink', 0, 13],
      glassPurple: ['blocks', 'Glass_Purple', 0, 13],
      glassRed: ['blocks', 'Glass_Red', 0, 13],
      glassSilver: ['blocks', 'Glass_Silver', 0, 13],
      glassWhite: ['blocks', 'Glass_White', 0, 13],
      glassYellow: ['blocks', 'Glass_Yellow', 0, 13],
      terracotta: ['blocks', 'Terracotta', 0, 13],
      terracottaBlack: ['blocks', 'Terracotta_Black', 0, 13],
      terracottaBlue: ['blocks', 'Terracotta_Blue', 0, 13],
      terracottaBrown: ['blocks', 'Terracotta_Brown', 0, 13],
      terracottaCyan: ['blocks', 'Terracotta_Cyan', 0, 13],
      terracottaGray: ['blocks', 'Terracotta_Gray', 0, 13],
      terracottaGreen: ['blocks', 'Terracotta_Green', 0, 13],
      terracottaLightBlue: ['blocks', 'Terracotta_LightBlue', 0, 13],
      terracottaLime: ['blocks', 'Terracotta_Lime', 0, 13],
      terracottaMagenta: ['blocks', 'Terracotta_Magenta', 0, 13],
      terracottaOrange: ['blocks', 'Terracotta_Orange', 0, 13],
      terracottaPink: ['blocks', 'Terracotta_Pink', 0, 13],
      terracottaPurple: ['blocks', 'Terracotta_Purple', 0, 13],
      terracottaRed: ['blocks', 'Terracotta_Red', 0, 13],
      terracottaSilver: ['blocks', 'Terracotta_Silver', 0, 13],
      terracottaWhite: ['blocks', 'Terracotta_White', 0, 13],
      terracottaYellow: ['blocks', 'Terracotta_Yellow', 0, 13],

      // 2018 blocks.
      strippedOak: ['blocks', 'Stripped_Oak', 1, 13],
      strippedDarkOak: ['blocks', 'Stripped_Dark_Oak', 1, 13],
      stoneBricks: ['blocks', 'Stone_Bricks', 1, 13],
      chiseledStoneBricks: ['blocks', 'Stone_Bricks_Chisled', 1, 13],
      mossyStoneBricks: ['blocks', 'Stone_Bricks_Mossy', 1, 13],
      crackedStoneBricks: ['blocks', 'Stone_Bricks_Cracked', 1, 13],
      magmaBlock: ['blocks', 'Magma_Block0', 1, 13],
      blueCoralBlock: ['blocks', 'Coral_Block_Blue', 1, 13],
      pinkCoralBlock: ['blocks', 'Coral_Block_Pink', 1, 13],
      magentaCoralBlock: ['blocks', 'Coral_Block_Magenta', 1, 13],
      redCoralBlock: ['blocks', 'Coral_Block_Red', 1, 13],
      yellowCoralBlock: ['blocks', 'Coral_Block_Yellow', 1, 13],
      deadCoralBlock: ['blocks', 'Coral_Block_Dead_Blue', 1, 13],
      blueDeadCoralBlock: ['blocks', 'Coral_Block_Dead_Blue', 1, 13],
      pinkDeadCoralBlock: ['blocks', 'Coral_Block_Dead_Pink', 1, 13],
      magentaDeadCoralBlock: ['blocks', 'Coral_Block_Dead_Magenta', 1, 13],
      readDeadCoralBlock: ['blocks', 'Coral_Block_Dead_Red', 1, 13],
      yellowDeadCoralBlock: ['blocks', 'Coral_Block_Dead_Yellow', 1, 13],
      prismarine: ['blocks', 'Prismarine0', 1, 13],
      prismarineBricks: ['blocks', 'Prismarine_Bricks', 1, 13],
      darkPrismarine: ['blocks', 'Prismarine_Dark', 1, 13],
      seaLantern: ['blocks', 'Sea_Lantern0', 1, 13],
      packedIce: ['blocks', 'Ice_Packed', 1, 13],
      blueIce: ['blocks', 'Ice_Blue', 1, 13],
      blackConcrete: ['blocks', 'Concrete_Black', 1, 13],
      seaGrass: ['blocks', 'Seagrass0', 1, 13],
      kelp: ['blocks', 'KelpSingle_0', 1, 13],
      polishedGranite: ['blocks', 'Granite_Polished', 1, 13],
      coralFanBlueBottom: ['blocks', 'Coral_Fan_Blue_Bottom', 1, 13],
      coralFanPinkBottom: ['blocks', 'Coral_Fan_Pink_Bottom', 1, 13],
      coralFanMagentaBottom: ['blocks', 'Coral_Fan_Magenta_Bottom', 1, 13],
      coralFanRedBottom: ['blocks', 'Coral_Fan_Red_Bottom', 1, 13],
      coralFanYellowFanBottom: ['blocks', 'Coral_Fan_Yellow_Bottom', 1, 13],
      coralFanBlueTop: ['blocks', 'Coral_Fan_Blue_Top', 1, 13],
      coralFanPinkTop: ['blocks', 'Coral_Fan_Pink_Top', 1, 13],
      coralFanMagentaTop: ['blocks', 'Coral_Fan_Magenta_Top', 1, 13],
      coralFanRedTop: ['blocks', 'Coral_Fan_Red_Top', 1, 13],
      coralFanYellowFanTop: ['blocks', 'Coral_Fan_Yellow_Top', 1, 13],
      coralFanBlueLeft: ['blocks', 'Coral_Fan_Blue_Left', 1, 13],
      coralFanPinkLeft: ['blocks', 'Coral_Fan_Pink_Left', 1, 13],
      coralFanMagentaLeft: ['blocks', 'Coral_Fan_Magenta_Left', 1, 13],
      coralFanRedLeft: ['blocks', 'Coral_Fan_Red_Left', 1, 13],
      coralFanYellowFanLeft: ['blocks', 'Coral_Fan_Yellow_Left', 1, 13],
      coralFanBlueRight: ['blocks', 'Coral_Fan_Blue_Right', 1, 13],
      coralFanPinkRight: ['blocks', 'Coral_Fan_Pink_Right', 1, 13],
      coralFanMagentaRight: ['blocks', 'Coral_Fan_Magenta_Right', 1, 13],
      coralFanRedRight: ['blocks', 'Coral_Fan_Red_Right', 1, 13],
      coralFanYellowFanRight: ['blocks', 'Coral_Fan_Yellow_Right', 1, 13],
      coralPlantBlue: ['blocks', 'Coral_Plant_Blue', 1, 13],
      coralPlantBlueDeep: ['blocks', 'Coral_Plant_Blue_Sand', 1, 13],
      coralPlantPink: ['blocks', 'Coral_Plant_Pink', 1, 13],
      coralPlantPinkDeep: ['blocks', 'Coral_Plant_Pink_Sand', 1, 13],
      coralPlantMagenta: ['blocks', 'Coral_Plant_Magenta', 1, 13],
      coralPlantMagentaDeep: ['blocks', 'Coral_Plant_Magenta_Sand', 1, 13],
      coralPlantRed: ['blocks', 'Coral_Plant_Red', 1, 13],
      coralPlantRedDeep: ['blocks', 'Coral_Plant_Red_Sand', 1, 13],
      coralPlantYellow: ['blocks', 'Coral_Plant_Yellow', 1, 13],
      coralPlantYellowDeep: ['blocks', 'Coral_Plant_Yellow_Sand', 1, 13],
      magmaUnderwater: ['blocks', 'Magma_Bubble_Boat0', -1, 17],
      magmaDeep: ['blocks', 'Magma_Bubble_Deep0', 1, 13],
      bubbleColumn: ['blocks', 'Bubble_Column0', 1, 13],
      conduit: ['blocks', 'Conduit00', 0, 3],
      seaPickles: ['blocks', 'SeaPickle', 3, -6],
      Chest: ['blocks', 'Chest0', 1, 3],
      chest: ['blocks', 'Chest0', 1, 3], // compat
      invisible: ['blocks', 'Invisible', 0, 0],
    };

    this.treeFluffTypes = {
      treeAcacia: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [1, -2],
      ],
      treeBirch: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [1, -2],
        [0, -3],
      ],
      treeJungle: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [1, -2],
        [0, -3],
        [1, -3],
      ],
      treeOak: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [0, -3],
      ],
      treeSpruce: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [1, -2],
        [0, -3],
      ],
      treeSpruceSnowy: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, -2],
        [0, -2],
        [1, -2],
        [0, -3],
      ],
    };
  }

  pseudoRandomTint(
    group: Phaser.GameObjects.Container,
    sprite: Phaser.GameObjects.Sprite,
    x: number,
    y: number,
  ) {
    const pseudoRandom = Math.pow(x * 10 + y, 5) % 251;
    let darkness = pseudoRandom / 12;

    if (group === this.groundGroup) {
      darkness += 24;
    } else {
      darkness *= 0.75;
    }

    const brightness = Math.floor(Math.max(0xff - darkness, 0));
    sprite.tint = brightness | (brightness << 8) | (brightness << 16);
  }

  blockReceivesCornerShadow(x: number, y: number): boolean {
    const southBlock = this.scene.levelModel.actionPlane.getBlockAt(new Position(x, y + 1));
    if (!southBlock || (southBlock.blockType && !southBlock.isWalkable)) {
      return false;
    }

    const southWestBlock = this.scene.levelModel.actionPlane.getBlockAt(new Position(
      x - 1,
      y + 1,
    ));

    return (
      !!southWestBlock && !!southWestBlock.blockType && !southWestBlock.isWalkable
    );
  }

  createBlock(
    group: Phaser.GameObjects.Container,
    x: number,
    y: number,
    blockType: string,
  ): Phaser.GameObjects.Sprite | undefined {
    const position = new Position(x, y);
    const index = this.coordinatesToIndex(position);

    const buildTree = (frame: number[]) => {
      const type = blockType.substring(4);
      const sprite = this.createBlock(group, x, y, 'log' + type);
      const fluff = this.createBlock(this.fluffGroup, x, y, 'leaves' + type);

      if (sprite) {
        sprite.setData('fluff', fluff);
        sprite.setData('onBlockDestroy', (_logSprite: Phaser.GameObjects.Sprite) => {
          // Create an animation from the fluff's texture
          const animationKey = 'Leaves_' + type;
          if (fluff) {
            fluff.anims.create({
              key: 'despawn',
              frames: this.scene.anims.generateFrameNames(animationKey, {
                start: frame[0],
                end: frame[1],
                zeroPad: 0,
                prefix: '',
                suffix: '.png',
              }),
              frameRate: this.scene.originalFpsToScaled(10),
              repeat: 0,
            });

            // Play the animation and handle the complete event
            fluff.anims.play('despawn');

            // Handle completion of animation using an event listener
            fluff.on('animationcomplete-despawn', () => {
              fluff?.destroy();
            });
          }
        });

        // Add the tree to the trees array
        this.trees.push({sprite: sprite, type: blockType, position: position});
      }
    };

    const buildDoor = (type: string): Phaser.GameObjects.Sprite => {
      // Get the atlas and frame information (assuming blocks is defined somewhere)
      const atlas = this.blocks[blockType][0];
      const frame = this.blocks[blockType][1];
      const xOffset = this.blocks[blockType][2];
      const yOffset = this.blocks[blockType][3];

      // Create the sprite in the group
      const sprite = this.scene.add.sprite(
        xOffset + MIDX + 40 * x,
        yOffset + MIDY + group.getData('yOffset') + 40 * y,
        atlas,
        frame,
      );
      if (sprite) {
        group.add(sprite);
      }

      // Create the frame list for the 'open' animation
      let frameList: Phaser.Types.Animations.AnimationFrame[] = [];
      let animationFramesIron = this.scene.anims.generateFrameNames(atlas, {
        start: 0,
        end: 3,
        zeroPad: 1,
        prefix: type,
        suffix: '',
      });

      // Add static frames to the list
      for (let j = 0; j < 5; j++) {
        frameList.push({
          key: atlas,
          frame: `${type}0`,
        });
      }

      // Concatenate the dynamic frames
      frameList = frameList.concat(animationFramesIron);

      // Create the 'open' animation
      const animOpenKey = `door-${blockType}-open`;
      if (!this.scene.anims.exists(animOpenKey)) {
        this.scene.anims.create({
          key: animOpenKey,
          frames: this.scene.anims.generateFrameNames(atlas, {
            start: 0,
            end: 3,
            zeroPad: 1,
            prefix: type,
            suffix: '',
          }),
          frameRate: this.scene.originalFpsToScaled(10),
          repeat: -1,
        });
      }

      // Create the frame list for the 'close' animation
      frameList = [];
      animationFramesIron = this.scene.anims.generateFrameNames(atlas, {
        start: 3,
        end: 0,
        zeroPad: 1,
        prefix: type,
        suffix: '',
      });

      // Add static frames for the 'close' animation
      for (let j = 0; j < 5; j++) {
        frameList.push({
          key: atlas,
          frame: `${type}3`,
        });
      }

      // Concatenate the dynamic frames for 'close'
      frameList = frameList.concat(animationFramesIron);

      // Create the 'close' animation
      const animCloseKey = `door-${blockType}-close`;
      if (!this.scene.anims.exists(animCloseKey)) {
        this.scene.anims.create({
          key: animCloseKey,
          frames: this.scene.anims.generateFrameNames(atlas, {
            start: 3,
            end: 0,
            zeroPad: 1,
            prefix: type,
            suffix: '',
          }),
          frameRate: this.scene.originalFpsToScaled(10),
          repeat: -1,
        });
      }

      // Return the created sprite
      return sprite;
    };

    let sprite: Phaser.GameObjects.Sprite | undefined;

    switch (blockType) {
      case 'treeAcacia': //0,7
        buildTree([0, 7]);
        break;
      case 'treeBirch': //0,8
        buildTree([0, 8]);
        break;
      case 'treeJungle': //0,9
        buildTree([0, 9]);
        break;
      case 'treeOak':
        buildTree([0, 6]);
        break;
      case 'treeSpruce': //0,8
        buildTree([0, 8]);
        break;
      case 'treeSpruceSnowy': //1,9
        buildTree([0, 8]);
        break;
      case 'cropWheat':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 2,
              zeroPad: 0,
              prefix: 'Wheat',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'wheat-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(10),
              repeat: -1,
            });
            sprite.anims.play('wheat-idle');
          }
        }
        break;

      case 'torch':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 23,
              zeroPad: 1,
              prefix: 'Torch',
              suffix: '',
            });
            if (!this.scene.anims.exists('torch-idle')) {
              this.scene.anims.create({
                key: 'torch-idle',
                frames: frameList,
                frameRate: this.scene.originalFpsToScaled(15),
                repeat: -1,
              });
            }
            sprite.anims.play('torch-idle');
          }
        }
        break;

      case 'water':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 0,
              prefix: 'Water_',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'water-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('water-idle');
            console.log('water??', sprite, sprite.anims);
          }
        }
        break;

      //for placing wetland for crops in free play
      case 'watering':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            sprite.destroy();
            this.createBlock(this.groundGroup, x + 20, y + 20, 'farmlandWet');
            this.refreshGroundGroup();
          }
        }
        break;

      case 'lava':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Lava_',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'lava-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('lava-idle');
          }
        }
        break;

      case 'magmaBlock':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Magma_Block',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'magma-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('magma-idle');
          }
        }
        break;

      case 'magmaUnderwater':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 0,
              prefix: 'Magma_Bubble_Boat',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'magma-bubble-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('magma-bubble-idle');
          }
        }
        break;

      case 'magmaDeep':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Magma_Bubble_Deep',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'magma-bubble-deep-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('magma-bubble-deep-idle');
          }
        }
        break;

      case 'bubbleColumn':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Bubble_Column',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'bubble-column-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('bubble-column-idle');
          }
        }
        break;

      case 'conduit':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);

            let frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 3,
              end: 10,
              zeroPad: 2,
              prefix: 'Conduit',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'conduit-open',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });

            frameList = this.scene.anims.generateFrameNames('Conduit', {
              start: 0,
              end: 2,
              zeroPad: 2,
              prefix: '',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'conduit-activation',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: 0,
            });
            this.scene.anims.create({
              key: 'conduit-deactivation',
              frames: frameList.reverse(),
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: 0,
            });

            sprite.anims.play('conduit-open');
          }
        }
        break;

      case 'prismarine':
        {
          //this.initPrismarine();
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Prismarine',
              suffix: '',
            });
            if (!this.scene.anims.exists('prismarine-idle')) {
              this.scene.anims.create({
                key: 'prismarine-idle',
                frames: frameList,
                frameRate: this.scene.originalFpsToScaled(5),
                repeat: -1,
              });
            }
            sprite.anims.play('prismarine-idle');
          }
        }
        break;

      case 'seaLantern':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 4,
              zeroPad: 1,
              prefix: 'Sea_Lantern',
              suffix: '',
            });
            if (!this.scene.anims.exists('sea-lantern-idle')) {
              this.scene.anims.create({
                key: 'sea-lantern-idle',
                frames: frameList,
                frameRate: this.scene.originalFpsToScaled(5),
                repeat: -1,
              });
            }
            sprite.anims.play('sea-lantern-idle');
          }
        }
        break;

      case 'seaGrass':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'Seagrass',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'seagrass-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5) * 0.5,
              repeat: -1,
            });
            sprite.anims.play('seagrass-idle');
          }
        }
        break;

      case 'kelp':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 0,
              end: 5,
              zeroPad: 1,
              prefix: 'KelpSingle_',
              suffix: '',
            });
            if (!this.scene.anims.exists('kelp-single-idle')) {
              this.scene.anims.create({
                key: 'kelp-single-idle',
                frames: frameList,
                frameRate: this.scene.originalFpsToScaled(5) * 0.5,
                repeat: -1,
              });
            }
            sprite.anims.play('kelp-single-idle');
          }
        }
        break;

      case 'Chest':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames('Chest', {
              start: 0,
              end: 2,
              zeroPad: 0,
              prefix: '',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'chest-open',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: 0,
            });
          }
        }
        break;

      case 'NetherPortal':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(
              'NetherPortal',
              {start: 1, end: 6, zeroPad: 1, prefix: '', suffix: ''},
            );
            this.scene.anims.create({
              key: 'nether-portal-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('nether-portal-idle');
          }
        }
        break;

      case 'lavaPop':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            let frameList = this.scene.anims.generateFrameNames(atlas, {
              start: 1,
              end: 7,
              zeroPad: 2,
              prefix: 'LavaPop',
              suffix: '',
            });
            for (let i = 0; i < 4; i++) {
              frameList.push({
                key: atlas,
                frame: 'LavaPop07',
              });
            }
            frameList = frameList.concat(
              this.scene.anims.generateFrameNames(atlas, {
                start: 8,
                end: 13,
                zeroPad: 2,
                prefix: 'LavaPop',
                suffix: '',
              }),
            );
            for (let i = 0; i < 3; i++) {
              frameList.push({
                key: atlas,
                frame: 'LavaPop13',
              });
            }
            frameList = frameList.concat(
              this.scene.anims.generateFrameNames(atlas, {
                start: 14,
                end: 30,
                zeroPad: 2,
                prefix: 'LavaPop',
                suffix: '',
              }),
            );
            for (let i = 0; i < 8; i++) {
              frameList.push({
                key: atlas,
                frame: 'LavaPop01',
              });
            }
            this.scene.anims.create({
              key: 'lava-pop-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('lava-pop-idle');
          }
        }
        break;

      case 'fire':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames('Fire', {
              start: 0,
              end: 14,
              zeroPad: 2,
              prefix: '',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'fire-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('fire-idle');
          }
        }
        break;

      case 'bubbles':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames('Bubbles', {
              start: 0,
              end: 14,
              zeroPad: 2,
              prefix: '',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'bubbles-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(5),
              repeat: -1,
            });
            sprite.anims.play('bubbles-idle');
          }
        }
        break;

      case 'explosion':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames('Explosion', {
              start: 0,
              end: 16,
              zeroPad: 1,
              prefix: '',
              suffix: '',
            });
            this.scene.anims.create({
              key: 'explosion-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(15),
              repeat: 0,
            });
            sprite.on('animationcomplete-explosion-idle', () => {
              sprite?.destroy();
            });
            sprite.anims.play('explosion-idle');
          }
        }
        break;

      case 'door':
        {
          sprite = buildDoor('Door');
        }
        break;

      case 'doorIron':
        {
          sprite = buildDoor('DoorIron');
          if (this.blockReceivesCornerShadow(x, y)) {
            // TODO: handle shadows
            /*
            const shadowSprite = this.scene.add.sprite(
              0,
              15,
              'blockShadows',
              'Shadow_Parts_Fade_overlap',
            );
            //sprite.setOrigin(0, 0);
            //shadowSprite.setOrigin(0, 0);
            sprite.add(shadowSprite);
            */
          }
        }
        break;

      case 'tnt':
        {
          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            const frameList = this.scene.anims.generateFrameNames(
              'TNTexplosion',
              {start: 0, end: 8, zeroPad: 0, prefix: '', suffix: ''},
            );
            this.scene.anims.create({
              key: 'tnt-explosion-idle',
              frames: frameList,
              frameRate: this.scene.originalFpsToScaled(7),
              repeat: 0,
            });
            sprite.on('animationcomplete-tnt-explosion-idle', () => {
              this.playExplosionCloudAnimation(position);
              sprite?.destroy();
              const index = this.coordinatesToIndex(position);
              this.actionPlaneBlocks.delete(index);
            });
          }
        }
        break;

      default:
        {
          if (!this.blocks[blockType]) {
            throw new Error(`Unknown block type: ${blockType}`);
          }

          const atlas = this.blocks[blockType][0];
          const frame = this.blocks[blockType][1];
          const xOffset = this.blocks[blockType][2];
          const yOffset = this.blocks[blockType][3];
          sprite = this.scene.add.sprite(
            xOffset + MIDX + 40 * x,
            yOffset + MIDY + group.getData('yOffset') + 40 * y,
            atlas,
            frame,
          );
          if (sprite) {
            group.add(sprite);
            //sprite.setOrigin(0, 0);
          }

          if (group === this.actionGroup || group === this.groundGroup) {
            if (sprite && !LevelBlock.isWalkable(blockType)) {
              this.pseudoRandomTint(group, sprite, x, y);
            }
          }

          if (
            group === this.actionGroup &&
            !LevelBlock.isWalkable(blockType) &&
            this.blockReceivesCornerShadow(x, y)
          ) {
            // TODO sprite shadow on shadow plane
            /*
            let xShadow = 0;
            let yShadow = 0;

            if (blockType.startsWith('pistonArm')) {
              xShadow = -26;
              yShadow = 53;
            }

            const shadowSprite = this.scene.add.sprite(
              xShadow,
              yShadow,
              'blockShadows',
              'Shadow_Parts_Fade_overlap',
            );
            sprite.add(shadowSprite);
            */
          }

          if (
            blockType.startsWith('redstoneWire') &&
            blockType.endsWith('On')
          ) {
            if (sprite && !this.blockEffects.has(index)) {
              const effect = this.addRedstoneSparkle(sprite);
              group.add(effect);
              this.blockEffects.set(index, effect);
            }
          }
        }
        break;
    }

    // Allow tiles to overlap a little bit so they look alright when scaling
    // or zooming the camera.
    return sprite;
  }

  addRedstoneSparkle(
    redstoneSprite: Phaser.GameObjects.Sprite,
  ): Phaser.GameObjects.Sprite {
    const blank = 'redstone_sparkle99';
    const sprite = this.scene.add.sprite(
      redstoneSprite.x,
      redstoneSprite.y,
      'redstoneSparkle',
      blank,
    );
    sprite.setDepth(1000);

    const playRandomSparkle = () => {
      if (!sprite.active) {
        return;
      }

      // Pick one of the animations to play.
      const i = Math.floor(Math.random() * 3);

      // Randomize which corner of the index the animation manifests in.
      sprite.x = Math.random() > 0.5 ? redstoneSprite.x : redstoneSprite.x + 20;
      sprite.y = Math.random() > 0.5 ? redstoneSprite.y : redstoneSprite.y + 20;

      // Stop any animation on this block effect
      sprite.anims?.stop();

      // Go, forcibly, to the initial transparent frame
      sprite.setFrame(blank);

      setTimeout(
        () => {
          const animationName = `fizz${i}`;
          sprite.anims?.play(animationName);
        },
        randomInt(500, 7000),
      );
    };

    // Establish the three different animations.
    for (let i = 0; i < 3; i++) {
      const animationName = `fizz${i}`;

      if (!this.scene.anims.exists(animationName)) {
        const n = i * 8;
        const frames = [
          {
            key: 'redstoneSparkle',
            frame: blank,
          },
          ...this.scene.anims.generateFrameNames('redstoneSparkle', {
            start: n,
            end: n + 7,
            prefix: 'redstone_sparkle',
            zeroPad: 2,
          }),
        ];

        this.scene.anims.create({
          key: animationName,
          frames,
          frameRate: 10,
        });
      }

      sprite.on(
        `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
        () => {
          playRandomSparkle();
        },
      );
    }

    playRandomSparkle();
    return sprite;
  }

  yToIndex(y: number): number {
    return this.scene.levelModel.yToIndex(y);
  }

  coordinatesToIndex(coordinates: Position): number {
    return this.yToIndex(coordinates.x) + coordinates.y;
  }

  correctForShadowOverlay(
    blockType: string,
    sprite: Phaser.GameObjects.Sprite,
  ) {
    if (blockType.startsWith('piston')) {
      sprite.setDepth(sprite.depth - 0.1);
    }
  }

  /**
   * Create a "miniblock" asset (representing a floating collectable) based on
   * the given block at the given coordinates
   */
  createMiniBlock(
    x: number,
    y: number,
    blockType: string,
    overrides: {
      /** Distance at which the miniblock can be collected. Default: 2 */
      collectibleDistance?: number;
      /** The object will be randomly placed within the random horizontal range given. Default: 40 */
      xOffsetRange?: number;
      /** The object will be randomly placed within the random vertical range given. Default: 40 */
      yOffsetRange?: number;
      onComplete?: () => void;
      isOnBlock?: boolean;
    } = {},
  ): Phaser.GameObjects.Sprite | undefined {
    const collectibleDistance =
      overrides.collectibleDistance === undefined
        ? 2
        : overrides.collectibleDistance;
    const xOffsetRange =
      overrides.xOffsetRange === undefined ? 40 : overrides.xOffsetRange;
    const yOffsetRange =
      overrides.yOffsetRange === undefined ? 40 : overrides.yOffsetRange;

    const frame = LevelBlock.getMiniblockFrame(blockType);
    if (!(frame && this.miniBlocks[frame])) {
      return undefined;
    }

    const atlas = 'miniBlocks';
    const xOffset = 7 - xOffsetRange / 2 + Math.random() * xOffsetRange;
    const yOffset = 3 - yOffsetRange / 2 + Math.random() * yOffsetRange;
    const offset = new Position(xOffset, yOffset);

    const layer = overrides.isOnBlock ? -20 : 0;
    const sprite = this.scene.add.sprite(
      xOffset + MIDX + 20 - 10 + 40 * x,
      yOffset + MIDY + 10 + 40 * y + layer,
      atlas,
      'shadow',
    );
    const item = this.scene.add.sprite(
      xOffset + MIDX - 10 + 40 * x,
      yOffset + MIDY - 7 + 40 * y + layer,
      atlas,
      this.miniBlocks[frame],
    );
    this.actionGroup.add(item);
    this.actionGroup.add(sprite);

    const bounce = (k: number) => {
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

    if (!overrides.onComplete) {
      this.collectibleItems.push([
        sprite,
        offset,
        blockType,
        collectibleDistance,
      ]);
    }

    const tween = this.scene.tweens.add({
      targets: item,
      y: item.y - 8,
      duration: 350,
      ease: bounce,
      onComplete: () => {
        if (overrides.onComplete) {
          // Player will auto-acquire the dropped miniblock before moving on.
          overrides.onComplete();
        } else if (this.scene.levelModel.usePlayer) {
          // If not auto-acquiring, add the miniblock to the list of collectible items.

          const collectiblePosition =
            this.scene.levelModel.spritePositionToIndex(
              offset,
              new Position(sprite.x, sprite.y),
            );

          if (
            this.player &&
            Math.sqrt(
              Position.absoluteDistanceSquare(this.player.position, collectiblePosition)
            ) < collectibleDistance
          ) {
            this.player?.collectItems(new Position(x, y));
          }
        }
      },
    });

    // Start the item bounce animation
    tween.play();

    return sprite;
  }

  createActionPlaneBlock(position: Position, blockType: string) {
    const block = new LevelBlock(blockType);
    const index = this.coordinatesToIndex(position);

    // Remove the old sprite at this position, if there is one.
    if (this.actionPlaneBlocks.has(index)) {
      const sprite = this.actionPlaneBlocks.get(index);
      if (sprite) {
        this.actionGroup?.remove(sprite);
        this.groundGroup?.remove(sprite);
        this.actionPlaneBlocks.delete(index);
        sprite.destroy(true);
      }
    }

    if (block.isEmpty) {
      this.actionPlaneBlocks.delete(index);
      console.log('returning because block is empty');
      return;
    }

    // Create a new sprite.
    let sprite: Phaser.GameObjects.Sprite | undefined;
    if (block.getIsMiniblock()) {
      // miniblocks defined on the action plane like this should have a
      // closer collectible range and a narrower drop offset than normal
      sprite = this.createMiniBlock(position.x, position.y, blockType, {
        collectibleDistance: 1,
        xOffsetRange: 10,
        yOffsetRange: 10,
      });
    } else {
      const group = block.shouldRenderOnGroundPlane()
        ? this.groundGroup
        : this.actionGroup;
      const offset = block.shouldRenderOnGroundPlane() ? -0.5 : 0;
      if (block.getIsChestblock()) {
        // if this is a treasure chest, render a normal chest and blockType will be used later to determine treasure type
        sprite = this.createBlock(
          group,
          position.x,
          position.y + offset,
          'Chest',
        );
      } else {
        sprite = this.createBlock(
          group,
          position.x,
          position.y + offset,
          blockType,
        );
        if (blockType === 'torch') {
          console.log(
            'CREATE TORCH!!!!',
            blockType,
            this.actionPlaneBlocks.get(index),
            sprite,
          );
        }
      }
    }

    if (sprite) {
      sprite.setDepth(position.y);
      this.correctForShadowOverlay(blockType, sprite);

      if (this.actionPlaneBlocks.has(index)) {
        console.log('it is already there');
      }

      this.actionPlaneBlocks.set(index, sprite);
      this.actionGroup?.add(sprite);
    }
  }

  addEntity(entity: BaseEntity) {
    if (entity.sprite) {
      this.actionGroup.add(entity.sprite);
    }
  }

  refreshGroundGroup() {
    this.groundGroup.removeAll();

    for (let y = 0; y < this.scene.levelModel.planeHeight; y++) {
      for (let x = 0; x < this.scene.levelModel.planeWidth; x++) {
        const position = new Position(x, y);
        const groundBlock =
          this.scene.levelModel.groundPlane.getBlockAt(position);

        if (groundBlock) {
          const sprite = this.createBlock(
            this.groundGroup,
            x,
            y,
            groundBlock.blockType,
          );
          if (sprite) {
            sprite.setDepth(y);
          }

          const actionBlock =
            this.scene.levelModel.actionPlane.getBlockAt(position);
          if (actionBlock && actionBlock.shouldRenderOnGroundPlane()) {
            this.createActionPlaneBlock(position, actionBlock.blockType);
          }
        }
      }
    }
  }

  refreshActionGroup(positions: Position[]) {
    // We need to add indices to refresh if there are other blocks in the action plane that might
    // conflict with the drawing of refreshed blocks.
    for (let i = 0; i < positions.length; i++) {
      const positionBelow = Position.south(positions[i]);
      const indexIsValid =
        this.scene.levelModel.actionPlane.inBounds(positionBelow);
      if (indexIsValid) {
        const blockToCheck =
          this.scene.levelModel.actionPlane.getBlockAt(positionBelow);
        const indexIsEmpty = blockToCheck?.blockType === '';
        if (!indexIsEmpty) {
          positions.push(positionBelow);
        }
      }
    }

    // Once all blocks that need to be refreshed are accounted for, go in and actually refresh.
    positions.forEach(position => {
      if (position) {
        const newBlock = this.scene.levelModel.actionPlane.getBlockAt(position);

        // we don't want to refresh doors or conduits. They're not destroyable / placeable, and
        // refreshing will lead to bad animation states
        if (
          (newBlock && newBlock.getIsDoor()) ||
          (newBlock && newBlock.getIsConduit() && newBlock.isActivatedConduit)
        ) {
          return;
        }

        if (
          (newBlock && newBlock.getIsMiniblock()) ||
          (newBlock && newBlock.getIsTree())
        ) {
          return;
        }

        if (newBlock && newBlock.blockType) {
          this.createActionPlaneBlock(position, newBlock.blockType);
        } else if (newBlock) {
          // Remove the old sprite at this position, if there is one.
          const index = this.coordinatesToIndex(position);
          if (this.actionPlaneBlocks.has(index)) {
            const sprite = this.actionPlaneBlocks.get(index);
            if (sprite) {
              console.log('removing the block!!!', sprite.x, sprite.y);
              this.actionGroup?.remove(sprite);
              this.groundGroup?.remove(sprite);
              sprite.destroy(true);
            }
          }
        }
      }
    });
  }

  resetGroups(levelData: LevelModel) {
    this.groundGroup?.removeAll(true);
    this.actionGroup?.removeAll(true);
    this.hintGroup?.removeAll(true);
    this.fluffGroup?.removeAll(true);
    this.shadingGroup?.removeAll(true);
    this.fowGroup?.removeAll(true);
    this.airGroup?.removeAll(true);

    this.baseShading = this.scene.add.container();
    if (this.baseShading) {
      this.worldContainer?.add(this.baseShading);
    }

    // Keeping track of generated action plane blocks
    this.actionPlaneBlocks = new Map<number, Phaser.GameObjects.Sprite>();
    // Keeping track of associated block effects and animations
    this.blockEffects = new Map<number, Phaser.GameObjects.Sprite>();

    this.refreshGroundGroup();

    for (let y = 0; y < this.scene.levelModel.planeHeight; y++) {
      for (let x = 0; x < this.scene.levelModel.planeWidth; x++) {
        const position = new Position(x, y);

        const groundBlock =
          levelData.groundDecorationPlane.getBlockAt(position);
        if (groundBlock && !groundBlock.isEmpty) {
          const sprite = this.createBlock(
            this.actionGroup,
            x,
            y,
            groundBlock.blockType,
          );
          if (sprite) {
            sprite.setDepth(y);
          }
        }

        const actionBlock = levelData.actionPlane.getBlockAt(position);
        if (actionBlock && !actionBlock.shouldRenderOnGroundPlane()) {
          this.createActionPlaneBlock(position, actionBlock.blockType);
        }
      }
    }

    for (let y = 0; y < this.scene.levelModel.planeHeight; y++) {
      for (let x = 0; x < this.scene.levelModel.planeWidth; x++) {
        const position = new Position(x, y);
        const block = levelData.fluffPlane.getBlockAt(position);
        if (block && !block.isEmpty) {
          const sprite = this.createBlock(
            this.fluffGroup,
            x,
            y,
            block.blockType || 'grass',
          );
          if (sprite) {
            sprite.setDepth(y);
          }
        }
      }
    }

    // We might have some default states that should be updated now that the actionPlane is set
    this.scene.levelModel.actionPlane.refreshRedstone();
    this.scene.levelModel.actionPlane.resolveConduitState();
    this.refreshActionGroup(
      this.scene.levelModel.actionPlane.getAllPositions(),
    );
  }

  resetEntity(entity: BaseEntity) {
    if (this.scene.followingPlayer() && entity === this.player && this.player?.sprite) {
      this.scene.cameras.main.startFollow(this.player.sprite);
    }

    if (entity.shouldUpdateSelectionIndicator()) {
      this.selectionIndicator = this.scene.add.rectangle(
        24,
        44,
        40,
        40,
        0xffffff,
      );

      if (this.selectionIndicator) {
        this.selectionIndicator.isFilled = false;
        this.selectionIndicator.isStroked = true;
        this.selectionIndicator.name = 'selectionIndicator';
        this.shadingGroup.add(this.selectionIndicator);
      }
    }

    entity.stop();
    this.setPlayerPosition(entity.position, entity.isOnBlock, entity);
    if (entity.shouldUpdateSelectionIndicator()) {
      if (this.selectionIndicator) {
        this.setSelectionIndicatorPosition(entity.position);
        this.selectionIndicator.visible = true;
      }
    }

    entity.play('idle');
  }

  setPlayerPosition(
    position: Position,
    isOnBlock: boolean,
    entity?: BaseEntity,
  ) {
    entity ||= this.player;

    if (!entity) {
      return;
    }

    const screen = this.positionToScreen(position, isOnBlock, entity);
    console.log('spawn setting position of player', position, screen);
    if (entity.sprite) {
      entity.sprite.x = screen.x;
      entity.sprite.y = screen.y;
      entity.sprite.setDepth(screen.y + entity.getSortOrderOffset());
    }
  }

  setSelectionIndicatorPosition(position: Position) {
    if (this.selectionIndicator) {
      this.selectionIndicator.x = MIDX + 40 * position.x;
      this.selectionIndicator.y = MIDY + 40 * position.y;
    }
  }

  /**
   * Convert a grid coordinate position to a screen X/Y location.
   */
  positionToScreen(
    position: Position,
    isOnBlock: boolean = false,
    entity?: BaseEntity,
  ): Position {
    entity ||= this.player;

    if (!entity) {
      return new Position(0, 0);
    }

    const xOffset = entity.offset[0];
    const yOffset = entity.offset[1];
    return new Position(
      xOffset + 40 * position.x,
      yOffset + (isOnBlock ? -23 : 0) + 40 * position.y,
    );
  }

  updateShadingGroup(shadingData: ShadingPlaneItem[]) {
    this.shadingGroup.removeAll();

    if (this.selectionIndicator) {
      this.shadingGroup.add(this.selectionIndicator);
    }

    for (const shadowItem of shadingData) {
      const atlas = shadowItem.atlas;
      const sx = 40 * shadowItem.x;
      const sy = 40 * shadowItem.y;

      const sprite = this.scene.add.sprite(sx, sy, atlas, shadowItem.type);
      if (sprite) {
        this.shadingGroup.add(sprite);
        sprite.setOrigin(0, 0);
        if (atlas === 'WaterAO') {
          sprite.tint = 0x555555;
        }
      }
    }
  }

  updateFowGroup(fowData: FowPlaneItem[]) {
    let index, fx, fy, atlas;

    this.fowGroup.removeAll();

    for (index = 0; index < fowData.length; index++) {
      const fowItem = fowData[index];

      if (fowItem !== '') {
        atlas = 'undergroundFow';
        fx = MIDX + 40 * fowItem.x;
        fy = MIDY + 40 * fowItem.y;

        const sprite = this.scene.add.sprite(fx, fy, atlas, fowItem.type);
        this.fowGroup.add(sprite);
        sprite.alpha = 0.8;
      }
    }
  }

  reset(levelModel: LevelModel) {
    this.player = levelModel.player;
    this.agent = levelModel.agent;

    this.resettableTweens.forEach((tween: Phaser.Tweens.Tween) => {
      tween.stop();
    });
    this.resettableTweens = [];
    this.collectibleItems = [];
    this.trees = [];

    this.resetGroups(levelModel);

    if (levelModel.usePlayer && this.player) {
      this.player.prepareSprite();
      this.resetEntity(this.player);

      if (levelModel.usingAgent && this.agent) {
        this.agent.prepareSprite();
        this.resetEntity(this.agent);
      }
    }

    if (levelModel.isUnderwater()) {
      if (levelModel.getOceanType() === 'cold') {
        //this.uniforms.tint.value = [57 / 255, 56 / 255, 201 / 255, 1];
      }
      //this.game.world.filters = [this.waveShader];
    }

    this.updateShadingGroup(levelModel.shadingPlane);
    this.updateFowGroup(levelModel.fowPlane);

    if (this.scene.followingPlayer()) {
      // Set the bounds of the world based on the size of the level
      console.log('setting bounds');
      this.scene.cameras.main.setBounds(
        0,
        0,
        levelModel.planeWidth * 40,
        levelModel.planeHeight * 40,
      );

      // Follow the player
      if (this.player?.sprite) {
        this.scene.cameras.main.startFollow(this.player.sprite);
      }

      // Reset the scale to 1 / 1
      this.scene.cameras.main.setZoom(1);
    } else {
      // Set a default smaller world bound if not following the player
      this.scene.cameras.main.setBounds(0, 0, 400, 400);
    }

    // Sort containers by sprite depth
    this.groundGroup.sort('depth');
    this.fluffGroup.sort('depth');
    this.fowGroup.sort('depth');
    this.airGroup.sort('depth');
    this.actionGroup.reverse();
    this.actionGroup.sort('depth');
    this.shadingGroup.sort('depth');
    this.hintGroup.sort('depth');

    this.worldContainer.sort('depth');
  }

  createGroups() {
    this.world = this.scene.add.renderTexture(
      this.scene.levelModel.planeWidth * 20,
      this.scene.levelModel.planeHeight * 20,
      this.scene.levelModel.planeWidth * 40,
      this.scene.levelModel.planeHeight * 40,
    );

    if (this.scene.levelModel.isUnderwater()) {
      if (!this.waveShader) {
        //this.waveShader = new Phaser.Display.BaseShader('BufferShader', waveShader);
        //this.scene.add.shader(this.waveShader, 400, 300, 800, 600);
      }

      //this.scene.add.shader('underwater');
      //this.world.setPostPipeline('underwater');
    }

    this.worldContainer = this.scene.add.container();
    if (this.worldContainer) {
      this.worldContainer.setVisible(false);
    }

    this.groundGroup = this.scene.add.container();
    if (this.groundGroup) {
      this.groundGroup.setData('yOffset', -4);
      this.worldContainer?.add(this.groundGroup);
    }
    this.shadingGroup = this.scene.add.container();
    if (this.shadingGroup) {
      this.shadingGroup.setData('yOffset', -4);
      this.worldContainer?.add(this.shadingGroup);
    }
    this.hintGroup = this.scene.add.container();
    if (this.hintGroup) {
      this.hintGroup.setData('yOffset', 0);
      this.worldContainer?.add(this.hintGroup);
    }
    this.actionGroup = this.scene.add.container();
    if (this.actionGroup) {
      this.actionGroup.setData('yOffset', -23);
      this.actionGroup.x = -1;
      this.worldContainer?.add(this.actionGroup);
    }
    this.fluffGroup = this.scene.add.container();
    if (this.fluffGroup) {
      this.fluffGroup.setData('yOffset', -73);
      this.worldContainer?.add(this.fluffGroup);
    }
    this.fowGroup = this.scene.add.container();
    if (this.fowGroup) {
      this.fowGroup.setData('yOffset', 0);
      this.worldContainer?.add(this.fowGroup);
    }
    this.airGroup = this.scene.add.container();
    if (this.airGroup) {
      this.airGroup.setData('yOffset', -23);
      this.airGroup.x = -1;
      this.worldContainer?.add(this.airGroup);
    }

    this.groundGroup?.setDepth(200);
    this.shadingGroup?.setDepth(300);
    this.hintGroup?.setDepth(400);
    this.actionGroup?.setDepth(500);
    this.fluffGroup?.setDepth(600);
    this.fowGroup?.setDepth(700);
    this.airGroup?.setDepth(800);
  }

  create(levelModel: LevelModel) {
    this.createGroups();
    this.reset(levelModel);

    // Add the custom shader pipeline
    if (levelModel.isUnderwater()) {
      const renderer: Phaser.Renderer.WebGL.WebGLRenderer = this.scene.sys.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

      renderer.pipelines.addPostPipeline(
        'underwater',
        UnderwaterEffectPipeline,
      );

      this.waveShader = renderer.pipelines.getPostPipeline('underwater');
      console.log('this.waveShader', this.waveShader);

      // Apply the pipeline to the whole scene (affects the entire screen)
      this.scene.cameras.main.setPostPipeline('underwater');
    }

    /*
     * TODO: handle this shader
    if (levelModel.isUnderwater()) {
      const underwaterOverlay = this.game.add.sprite(0, 0, 'underwaterOverlay');
      underwaterOverlay.visible = false;
      underwaterOverlay.smoothed = false;
      this.uniforms.surface.value = underwaterOverlay.texture;
    }
   */
  }

  getDirectionName(facing: Direction): 'up' | 'down' | 'left' | 'right' {
    return FacingDirection.directionToRelative(facing).toLowerCase() as 'up' | 'down' | 'left' | 'right';
  }

  isUnderTree(treeIndex: number, position: Position): boolean {
    // invalid index
    if (treeIndex >= this.trees.length || treeIndex < 0) {
      return false;
    }

    const fluffPositions = this.treeFluffTypes[this.trees[treeIndex].type];
    for (let i = 0; i < fluffPositions.length; i++) {
      if (
        this.trees[treeIndex].position.x + fluffPositions[i][0] ===
          position.x &&
        this.trees[treeIndex].position.y + fluffPositions[i][1] === position.y
      ) {
        return true;
      }
    }

    return false;
  }

  initPrismarine() {
    // This should create a shader that will fade across two or more different textures
  }

  scaleShowWholeWorld(completionHandler: () => void) {
    const [scaleX, scaleY] = this.scene.scaleFromOriginal();

    this.scene.cameras.main.stopFollow();
    const scaleTween = this.scene.tweens.add({
      targets: this.scene.cameras.main,
      x: 0,
      y: 0,
      zoomX: 1 / scaleX,
      zoomY: 1 / scaleY,
      duraion: 1000,
      ease: 'Expo.Out',
      onComplete: completionHandler,
    });

    scaleTween.play();
  }

  changeTreeAlpha(treeIndex: number, alpha: number) {
    const tree = this.trees[treeIndex];
    if (tree) {
      const fluff = tree.sprite?.getData('fluff');
      if (fluff) {
        const tween = this.scene.tweens.add({
          targets: fluff,
          alpha,
          duration: 300,
          ease: 'Linear',
        });
        this.addResettableTween(tween);
        tween.play();
      }
    }
  }

  playOpenConduitAnimation(position: Position) {
    const index = this.coordinatesToIndex(position);
    if (this.actionPlaneBlocks.has(index)) {
      const sprite = this.actionPlaneBlocks.get(index);
      const animationName = 'conduit-activation';
      sprite?.on(
        `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
        () => {
          const block = this.scene.levelModel.actionPlane.getBlockAt(position);
          if (block) {
            block.isEmissive = true;
          }
          this.scene.levelModel.computeShadingPlane();
          this.updateShadingGroup(this.scene.levelModel.shadingPlane);
          this.scene.levelModel.computeFowPlane();
          this.updateFowGroup(this.scene.levelModel.fowPlane);
          sprite.anims.play('conduit-open');
        },
      );

      sprite?.anims.play(animationName);
    }
  }

  playCloseConduitAnimation(position: Position) {
    const index = this.coordinatesToIndex(position);
    if (this.actionPlaneBlocks.has(index)) {
      const sprite = this.actionPlaneBlocks.get(index);
      const animationName = 'conduit-deactivation';
      sprite?.on(
        `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
        () => {
          const block = this.scene.levelModel.actionPlane.getBlockAt(position);
          if (block) {
            block.isEmissive = false;
          }
          this.scene.levelModel.computeShadingPlane();
          this.updateShadingGroup(this.scene.levelModel.shadingPlane);
          this.scene.levelModel.computeFowPlane();
          this.updateFowGroup(this.scene.levelModel.fowPlane);
        },
      );

      sprite?.anims.play(animationName);
    }
  }

  playExplosionCloudAnimation(position: Position) {
    this.createBlock(this.fluffGroup, position.x, position.y, 'explosion');
  }

  playExplosionAnimation(position: Position, facing: Direction, destroyPosition: Position, blockType: string, completionHandler?: () => void, placeBlock?: boolean, entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    // TODO: port this over
  }

  animateDoor(_index: number, _open: boolean) {
    // TODO: port this over
  }

  addResettableTween(tween: Phaser.Tweens.Tween) {
    this.resettableTweens.push(tween);
  }

  playItemAcquireAnimation(completionHandler: () => void, blockType: string, sprite: Phaser.GameObjects.Sprite, entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    const target = this.positionToScreen(entity.position);
    const tween = this.scene.tweens.add({
      targets: sprite,
      x: target.x + 20,
      y: target.y + 20,
      duration: 200,
      easing: 'Linear',
      onComplete: () => {
        const caughtUpToPlayer = Position.equals(this.player?.position || entity.position, entity.position);

        if (sprite.active && caughtUpToPlayer) {
          this.audioPlayer.play('collectedBlock');
          if (this.player) {
            this.player.inventory[blockType] =
              (this.player.inventory[blockType] || 0) + 1;
          }
          sprite.destroy();
          // TODO - events
          /*
          const event = createEvent('craftCollectibleCollected');
          event.blockType = blockType;
          window.dispatchEvent(event);
          */
          completionHandler?.();
        } else {
          this.playItemAcquireAnimation(completionHandler, blockType, sprite);
        }
      },
    });
    this.addResettableTween(tween);
    tween.play();
  }

  playFailureAnimation(completionHandler: () => void, entity?: BaseEntity) {
    entity ||= this.player;

    this.scene.delayBy(500, () => {
      this.audioPlayer.play('failure');
      entity?.play('fail', () => {
        this.scene.delayBy(800, completionHandler);
      });
    });
  }

  getTreasureTypeFromChest(block?: LevelBlock): string | undefined {
    if (!block) {
      return;
    }

    return block.blockType.substring(0, block.blockType.length - 5);
  }

  playBlockSound(groundType: string) {
    if (groundType === 'water' || groundType === 'lava' || this.scene.levelModel.isUnderwater()) {
      return;
    }

    const oreString = groundType.substring(0, 3);
    if (groundType === 'stone' || groundType === 'cobblestone' || groundType === 'bedrock' ||
      oreString === 'ore' || groundType === 'bricks') {
      this.audioPlayer.play('stepStone');
    } else if (groundType === 'grass' || groundType === 'dirt' || groundType === 'dirtCoarse' ||
      groundType === 'wool_orange' || groundType === 'wool') {
      this.audioPlayer.play('stepGrass');
    } else if (groundType === 'gravel') {
      this.audioPlayer.play('stepGravel');
    } else if (groundType === 'farmlandWet') {
      this.audioPlayer.play('stepFarmland');
    } else {
      this.audioPlayer.play('stepWood');
    }
  }

  playOpenChestAnimation(position: Position) {
    const index = this.coordinatesToIndex(position);
    if (this.actionPlaneBlocks.has(index)) {
      const sprite = this.actionPlaneBlocks.get(index);
      const animationName = 'chest-open';
      sprite?.on(
        `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animationName}`,
        () => {
          const treasure = this.getTreasureTypeFromChest(this.scene.levelModel.actionPlane.getBlockAt(position));
          if (treasure) {
            this.createMiniBlock(position.x, position.y, treasure, {
              collectibleDistance: -1,
              xOffsetRange: 0,
              yOffsetRange: 0,
              isOnBlock: true,
            });
          }
        },
      );
      sprite?.anims.play(animationName);
    }
  }

  playBurnInLavaAnimation(completionHandler: () => void, entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    entity.play('jumpUp');
    this.createBlock(this.fluffGroup, entity.position.x, entity.position.y, 'fire');

    const sprite = this.scene.add.sprite(0, 0, 'finishOverlay');
    this.fluffGroup.add(sprite);

    const [scaleX, scaleY] = this.scene.scaleFromOriginal();
    sprite.scaleX = scaleX;
    sprite.scaleY = scaleY;
    sprite.alpha = 0;
    sprite.tint = 0xd1580d;

    const tween = this.scene.tweens.add({
      targets: sprite,
      alpha: 0.5,
      duration: 200,
      easing: 'Linear',
      onComplete: completionHandler,
    });
    this.addResettableTween(tween);
    tween.play();
  }

  playDrownFailureAnimation(completionHandler: () => void, entity?: BaseEntity) {
    entity ||= this.player;
    if (!entity) {
      return;
    }

    entity.play('fail');
    this.createBlock(this.fluffGroup, entity.position.x, entity.position.y, 'bubbles');

    const sprite = this.scene.add.sprite(0, 0, 'finishOverlay');
    this.fluffGroup.add(sprite);

    const [scaleX, scaleY] = this.scene.scaleFromOriginal();
    sprite.scaleX = scaleX;
    sprite.scaleY = scaleY;
    sprite.alpha = 0;
    sprite.tint = 0x324bff;

    const tween = this.scene.tweens.add({
      targets: sprite,
      alpha: 0.5,
      duration: 200,
      ease: 'Linear',
      onComplete: completionHandler,
    });
    this.addResettableTween(tween);
    tween.play();
  }

  /**
   * Animate the player jumping down from on top of a block to ground level.
   */
  playPlayerJumpDownVerticalAnimation(entity: BaseEntity, position: Position, oldPosition?: Position) {
    oldPosition ||= position;

    if (!this.scene.levelModel.isUnderwater()) {
      entity.play('jumpDown');
    }

    if (!entity.sprite) {
      return;
    }

    const start = this.positionToScreen(oldPosition);
    const end = this.positionToScreen(position);
    const tween = this.scene.tweens.add({
      targets: entity.sprite,
      x: [start.x, end.x, end.x],
      y: [start.y, end.y - 50, end.y],
      duration: 300,
      ease: 'Linear',
      interpolation: 'bezier',
      onComplete: () => this.audioPlayer.play('fall'),
    });
    return tween;
  }

  playWalkAnimation(entity: BaseEntity, oldPosition: Position, shouldJumpDown: boolean, groundType: string, targetYIndex: number, completionHandler: () => void) {
    const position = entity.position;

    // Stepping on stone sfx, etc
    this.playBlockSound(groundType);

    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(position);
    }

    const screenPosition = this.positionToScreen(position, entity.isOnBlock, entity);
    if (!shouldJumpDown) {
      entity.play('walk');
    }

    const tween = shouldJumpDown
      ? this.playPlayerJumpDownVerticalAnimation(entity, position, oldPosition)
      : this.scene.tweens.add({
        targets: entity.sprite,
        x: screenPosition.x,
        y: screenPosition.y,
        duration: 180,
        easing: 'Linear',
        onComplete: completionHandler,
        onUpdate: (tween, _target, key, _current, _previous) => {
          // Update the sort order 3/4 of the way through the animation
          if (key === 'x' && tween.progress > 0.75) {
            entity.sprite?.setDepth(this.yToIndex(targetYIndex) + entity.getSortOrderOffset());
          }
        },
      });

    tween?.play();
  }

  /**
   * Play the MoveForward animation for the given entity. Note that both
   * MoveForward and MoveBackward are implemented using the same walk
   * animations, and the only difference between the two is the logic they use
   * for moving north after placing a block
   *
   * @see LevelView.playWalkAnimation
   */
  playMoveForwardAnimation(entity: BaseEntity, oldPosition: Position, shouldJumpDown: boolean, groundType: string, completionHandler: () => void) {
    // make sure to render high for when moving north after placing a block
    const targetYIndex = entity.position.y + (entity.facing === Direction.North ? 1 : 0);
    this.playWalkAnimation(entity, oldPosition, shouldJumpDown, groundType, targetYIndex, completionHandler);
  }

  /**
   * @see LevelView.playMoveForwardAnimation
   */
  playMoveBackwardAnimation(entity: BaseEntity, oldPosition: Position, shouldJumpDown: boolean, groundType: string, completionHandler: () => void) {
    // Make sure to render high for when moving north after placing a block
    const targetYIndex = entity.position.y + (entity.facing === Direction.South ? 1 : 0);
    this.playWalkAnimation(entity, oldPosition, shouldJumpDown, groundType, targetYIndex, completionHandler);
  }

  playPlaceBlockAnimation(entity: BaseEntity, position: Position, blockType: string, blockTypeAtPosition: string, completionHandler: () => void) {
    const blockIndex = this.yToIndex(position.y) + position.x;

    if (entity.shouldUpdateSelectionIndicator()) {
      this.setSelectionIndicatorPosition(position);
    }

    if (entity === this.agent || LevelBlock.isWalkable(blockType)) {
      entity.play('punch', () => {
        completionHandler();
      });
    } else {
      this.audioPlayer.play("placeBlock");

      if (blockTypeAtPosition !== "") {
        this.playExplosionAnimation(position, entity.facing, position, blockTypeAtPosition);
      }

      if (!this.scene.levelModel.isUnderwater()) {
        entity.play('jumpUp');
      }

      const placementTween = this.scene.tweens.add({
        targets: entity.sprite,
        y: -55 + 40 * position.y,
        duration: 125,
        ease: 'Cubic.EaseOut',
        onComplete: () => {
          if (blockTypeAtPosition !== "") {
            this.actionPlaneBlocks.get(blockIndex)?.destroy();
          }
          completionHandler();
        },
      });
      this.addResettableTween(placementTween);
      placementTween.play();
    }
  }
}

export default LevelView;
