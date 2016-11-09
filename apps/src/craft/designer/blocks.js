const i18n = require('./locale');
import { singleton as studioApp } from '../../StudioApp';
import { stripQuotes } from '../../utils';
import _ from 'lodash';
import eventTypes from './game/Event/EventType.js';

const ENTITY_INPUT_EXTRA_SPACING = 14;

const numbersToDisplayText = {
  '0.4': i18n.timeVeryShort(),
  '1.0': i18n.timeShort(),
  '2.0': i18n.timeMedium(),
  '4.0': i18n.timeLong(),
  '8.0': i18n.timeVeryLong(),
  'random': i18n.timeRandom(),
};

const blocksToDisplayText = {
  bedrock: i18n.blockTypeBedrock(),
  bricks: i18n.blockTypeBricks(),
  clay: i18n.blockTypeClay(),
  oreCoal: i18n.blockTypeOreCoal(),
  dirtCoarse: i18n.blockTypeDirtCoarse(),
  cobblestone: i18n.blockTypeCobblestone(),
  oreDiamond: i18n.blockTypeOreDiamond(),
  dirt: i18n.blockTypeDirt(),
  oreEmerald: i18n.blockTypeOreEmerald(),
  farmlandWet: i18n.blockTypeFarmlandWet(),
  glass: i18n.blockTypeGlass(),
  oreGold: i18n.blockTypeOreGold(),
  grass: i18n.blockTypeGrass(),
  gravel: i18n.blockTypeGravel(),
  clayHardened: i18n.blockTypeClayHardened(),
  oreIron: i18n.blockTypeOreIron(),
  oreLapis: i18n.blockTypeOreLapis(),
  lava: i18n.blockTypeLava(),
  logAcacia: i18n.blockTypeLogAcacia(),
  logBirch: i18n.blockTypeLogBirch(),
  logJungle: i18n.blockTypeLogJungle(),
  logOak: i18n.blockTypeLogOak(),
  logSpruce: i18n.blockTypeLogSpruce(),
  planksAcacia: i18n.blockTypePlanksAcacia(),
  planksBirch: i18n.blockTypePlanksBirch(),
  planksJungle: i18n.blockTypePlanksJungle(),
  planksOak: i18n.blockTypePlanksOak(),
  planksSpruce: i18n.blockTypePlanksSpruce(),
  oreRedstone: i18n.blockTypeOreRedstone(),
  rail: i18n.blockTypeRail(),
  sand: i18n.blockTypeSand(),
  sandstone: i18n.blockTypeSandstone(),
  stone: i18n.blockTypeStone(),
  tnt: i18n.blockTypeTnt(),
  tree: i18n.blockTypeTree(),
  water: i18n.blockTypeWater(),
  wool: i18n.blockTypeWool(),
  '': i18n.blockTypeEmpty()
};

const miniBlocksToDisplayText = {
  dirt: i18n.miniBlockDirt(),
  dirtCoarse: i18n.miniBlockDirtCoarse(),
  sand: i18n.miniBlockSand(),
  gravel: i18n.miniBlockGravel(),
  bricks: i18n.miniBlockBricks(),
  logAcacia: i18n.miniBlockLogAcacia(),
  logBirch: i18n.miniBlockLogBirch(),
  logJungle: i18n.miniBlockLogJungle(),
  logOak: i18n.miniBlockLogOak(),
  logSpruce: i18n.miniBlockLogSpruce(),
  planksAcacia: i18n.miniBlockPlanksAcacia(),
  planksBirch: i18n.miniBlockPlanksBirch(),
  planksJungle: i18n.miniBlockPlanksJungle(),
  planksOak: i18n.miniBlockPlanksOak(),
  planksSpruce: i18n.miniBlockPlanksSpruce(),
  cobblestone: i18n.miniBlockCobblestone(),
  sandstone: i18n.miniBlockSandstone(),
  wool: i18n.miniBlockWool(),
  redstoneDust: i18n.miniBlockRedstoneDust(),
  lapisLazuli: i18n.miniBlockLapisLazuli(),
  ingotIron: i18n.miniBlockIngotIron(),
  ingotGold: i18n.miniBlockIngotGold(),
  emerald: i18n.miniBlockEmerald(),
  diamond: i18n.miniBlockDiamond(),
  coal: i18n.miniBlockCoal(),
  bucketWater: i18n.miniBlockBucketWater(),
  bucketLava: i18n.miniBlockBucketLava(),
  gunPowder: i18n.miniBlockGunPowder(),
  wheat: i18n.miniBlockWheat(),
  potato: i18n.miniBlockPotato(),
  carrots: i18n.miniBlockCarrots(),
  milk: i18n.miniBlockMilk(),
  egg: i18n.miniBlockEgg(),
  poppy: i18n.miniBlockPoppy(),
  sheep: i18n.miniBlockSheep(),
};

const miniBlocks = Object.keys(miniBlocksToDisplayText).sort();

const soundsToDisplayText = {
  dig_wood1: i18n.soundTypeDig_wood1(),
  stepGrass: i18n.soundTypeStepGrass(),
  stepWood: i18n.soundTypeStepWood(),
  stepStone: i18n.soundTypeStepStone(),
  stepGravel: i18n.soundTypeStepGravel(),
  stepFarmland: i18n.soundTypeStepFarmland(),
  failure: i18n.soundTypeFailure(),
  success: i18n.soundTypeSuccess(),
  fall: i18n.soundTypeFall(),
  fuse: i18n.soundTypeFuse(),
  explode: i18n.soundTypeExplode(),
  placeBlock: i18n.soundTypePlaceBlock(),
  collectedBlock: i18n.soundTypeCollectedBlock(),
  bump: i18n.soundTypeBump(),
  punch: i18n.soundTypePunch(),
  fizz: i18n.soundTypeFizz(),
  doorOpen: i18n.soundTypeDoorOpen(),
  minecart: i18n.soundTypeMinecart(),
  sheepBaa: i18n.soundTypeSheepBaa(),
  chickenHurt: i18n.soundTypeChickenHurt(),
  chickenBawk: i18n.soundTypeChickenBawk(),
  cowHuff: i18n.soundTypeCowHuff(),
  cowHurt: i18n.soundTypeCowHurt(),
  cowMoo: i18n.soundTypeCowMoo(),
  cowMooLong: i18n.soundTypeCowMooLong(),
  creeperHiss: i18n.soundTypeCreeperHiss(),
  ironGolemHit: i18n.soundTypeIronGolemHit(),
  metalWhack: i18n.soundTypeMetalWhack(),
  zombieBrains: i18n.soundTypeZombieBrains(),
  zombieGroan: i18n.soundTypeZombieGroan(),
  zombieHurt: i18n.soundTypeZombieHurt(),
};

const allSounds = Object.keys(soundsToDisplayText);

const entityTypesToDisplayText = {
  Player: i18n.entityTypePlayer(),
  sheep: i18n.entityTypeSheep(),
  zombie: i18n.entityTypeZombie(),
  ironGolem: i18n.entityTypeIronGolem(),
  creeper: i18n.entityTypeCreeper(),
  cow: i18n.entityTypeCow(),
  chicken: i18n.entityTypeChicken(),
};

const ENTITY_TYPES = Object.keys(entityTypesToDisplayText);

const SPAWNABLE_ENTITY_TYPES = [
  'sheep',
  'zombie',
  'ironGolem',
  'creeper',
  'cow',
  'chicken',
];

const directionsToDisplay = {
  up: i18n.directionUp(),
  middle: i18n.directionMiddle(),
  down: i18n.directionDown(),
  left: i18n.directionLeft(),
  right: i18n.directionRight(),
};

function keysToDropdownOptions(keysList) {
  return keysList.map(function (key) {
    var displayText = (blocksToDisplayText[key] ||
      numbersToDisplayText[key] ||
      directionsToDisplay[key] ||
      entityTypesToDisplayText[key] ||
      miniBlocksToDisplayText[key] ||
      key);
    return [displayText, key];
  });
}


const entityActionBlocks = {
  destroyEntity: i18n.blockActionDestroyEntity(),
  attack: i18n.blockActionAttack(),
  flashEntity: i18n.blockActionFlashEntity(),
  moveForward: i18n.blockActionMoveForward(),
  moveRandom: i18n.blockActionMoveRandom(),
  explodeEntity: i18n.blockActionExplodeEntity()
};

const entityActionTargetDropdownBlocks = {
  'moveToward': i18n.blockActionMoveToward(),
  'moveTo': i18n.blockActionMoveTo(),
  'moveAway': i18n.blockActionMoveAway(),
};

exports.entityActionBlocks = Object.keys(entityActionBlocks);
exports.entityActionTargetDropdownBlocks = Object.keys(entityActionTargetDropdownBlocks);

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var craftBlockOptions = {
    playSoundOptions: blockInstallOptions.level.playSoundOptions,
    dropDropdownOptions: blockInstallOptions.level.dropDropdownOptions,
  };

  blockly.Blocks.craft_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.craft_turn.DIRECTIONS =
      [[i18n.blockTurnLeft() + ' \u21BA', 'left'],
       [i18n.blockTurnRight() + ' \u21BB', 'right']];

  blockly.Generator.get('JavaScript').craft_entityTurn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCalls = {
      left: 'turnLeft',
      right: 'turnRight',
      random: 'turnRandom'
    };
    return `${methodCalls[dir]}(event.targetIdentifier, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.craft_entityTurn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(blockly.Blocks.craft_entityTurn.ENTITY_DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.craft_entityTurn.ENTITY_DIRECTIONS =
      [[i18n.blockTurnLeft() + ' \u21BA', 'left'],
        [i18n.blockTurnRight() + ' \u21BB', 'right'],
        [i18n.turnRandom(), 'random']
      ];

  blockly.Generator.get('JavaScript').craft_entityTurnLR = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCalls = {
      left: 'turnLeft',
      right: 'turnRight',
      random: 'turnRandom'
    };
    return `${methodCalls[dir]}(event.targetIdentifier, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.craft_entityTurnLR = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(blockly.Blocks.craft_entityTurnLR.ENTITY_DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.craft_entityTurnLR.ENTITY_DIRECTIONS =
    [[i18n.blockTurnLeft() + ' \u21BA', 'left'],
      [i18n.blockTurnRight() + ' \u21BB', 'right']
  ];

  blockly.Blocks.craft_turn.DIRECTIONS =
      [[i18n.blockTurnLeft() + ' \u21BA', 'left'],
       [i18n.blockTurnRight() + ' \u21BB', 'right']];

  blockly.Generator.get('JavaScript').craft_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCall = dir === "left" ? "turnLeft" : "turnRight";
    return methodCall + '(\'block_id_' + this.id + '\');\n';
  };

  const statementNameToEvent = {
    WHEN_USED: eventTypes.WhenUsed,
    WHEN_TOUCHED: eventTypes.WhenTouched,
    WHEN_SPAWNED: eventTypes.WhenSpawned,
    WHEN_ATTACKED: eventTypes.WhenAttacked,
    WHEN_NIGHT: eventTypes.WhenNight,
    WHEN_DAY: eventTypes.WhenDay,
  };

  const defaultEventOrder = [
    'WHEN_SPAWNED',
    'WHEN_TOUCHED',
    'WHEN_USED',
    'WHEN_ATTACKED',
    'WHEN_DAY',
    'WHEN_NIGHT',
  ];

  const statementNameToDisplayName = {
    WHEN_USED: i18n.eventTypeWhenUsed(),
    WHEN_TOUCHED: i18n.eventTypeWhenTouched(),
    WHEN_SPAWNED: i18n.eventTypeWhenSpawned(),
    WHEN_ATTACKED: i18n.eventTypeWhenAttacked(),
    WHEN_NIGHT: i18n.eventTypeWhenNight(),
    WHEN_DAY: i18n.eventTypeWhenDay(),
  };

  function blockFor(displayName, statementNames = defaultEventOrder) {
    return {
      init: function () {
        this.appendDummyInput()
            .appendTitle(displayName);
        statementNames.forEach((name) => {
          this.appendStatementInput(name, ENTITY_INPUT_EXTRA_SPACING)
              .appendTitle(statementNameToDisplayName[name]);
        });
        this.setColour(120);
        this.setTooltip('');
      }
    };
  }

  function generatorFor(blockType, statementNames = defaultEventOrder) {
    return function () {
      return statementNames.map((statementName) => {
        return `
        onEventTriggered("${blockType}", ${statementNameToEvent[statementName]}, function(event) {
          ${blockly.Generator.get('JavaScript').statementToCode(this, statementName)}
        }, 'block_id_${this.id}');`;
      }).join("\n");
    };
  }

  function createEventBlockForEntity(entityID, displayName) {
    blockly.Blocks[`craft_${entityID}`] = blockFor(displayName);
    blockly.Generator.get('JavaScript')[`craft_${entityID}`] = generatorFor(entityID);
  }

  function createLimitedEventBlockForEntity(entityType, entityID, displayName, statementNames) {
    blockly.Blocks[`craft_${entityID}`] = blockFor(displayName, statementNames);
    blockly.Generator.get('JavaScript')[`craft_${entityID}`] = generatorFor(entityType, statementNames);
  }

  createEventBlockForEntity('cow', i18n.entityTypeCow());
  createEventBlockForEntity('sheep', i18n.entityTypeSheep());
  createEventBlockForEntity('zombie', i18n.entityTypeZombie());
  createEventBlockForEntity('ironGolem', i18n.entityTypeIronGolem());
  createEventBlockForEntity('creeper', i18n.entityTypeCreeper());
  createEventBlockForEntity('chicken', i18n.entityTypeChicken());
  createLimitedEventBlockForEntity('sheep', 'sheepClicked', i18n.entityTypeSheep(), ['WHEN_USED']);
  createLimitedEventBlockForEntity('chicken', 'chickenSpawnedClicked', i18n.entityTypeChicken(), ['WHEN_SPAWNED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('sheep', 'sheepSpawnedTouchedClicked', i18n.entityTypeSheep(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('cow', 'cowSpawnedTouchedClicked', i18n.entityTypeCow(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('zombie', 'zombieSpawnedTouchedClickedDay', i18n.entityTypeZombie(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_DAY']);
  createLimitedEventBlockForEntity('creeper', 'creeperSpawnedTouchedClickedDay', i18n.entityTypeCreeper(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_DAY']);
  createLimitedEventBlockForEntity('chicken', 'chickenSpawned', i18n.entityTypeChicken(), ['WHEN_SPAWNED']);
  createLimitedEventBlockForEntity('sheep', 'sheepSpawnedClicked', i18n.entityTypeSheep(), ['WHEN_SPAWNED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('creeper', 'creeperSpawnedTouchedClicked', i18n.entityTypeCreeper(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('zombie', 'zombieNoDayNight', i18n.entityTypeZombie(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_ATTACKED']);
  createLimitedEventBlockForEntity('ironGolem', 'ironGolemNoDayNight', i18n.entityTypeIronGolem(), ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_ATTACKED']);

  function makeGlobalEventBlock(functionName, text, eventType) {
    blockly.Blocks[`craft_${functionName}`] = {
      helpUrl: '',
      init: function () {
        this.setHSV(140, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(text);
        this.appendStatementInput('DO');
        this.setPreviousStatement(false);
        this.setNextStatement(false);
      }
    };

    blockly.Generator.get('JavaScript')[`craft_${functionName}`] = function () {
      return `
        onGlobalEventTriggered(${eventType}, function(event) {
          ${blockly.Generator.get('JavaScript').statementToCode(this, 'DO')}
        }, 'block_id_${this.id}');`;
    };
  }

  makeGlobalEventBlock('whenDay', i18n.eventTypeWhenDay(), eventTypes.WhenDayGlobal);
  makeGlobalEventBlock('whenNight', i18n.eventTypeWhenNight(), eventTypes.WhenNightGlobal);
  makeGlobalEventBlock('whenRun', i18n.eventTypeWhenRun(), eventTypes.WhenRun);

  function dropdownEntityBlock(simpleFunctionName, blockText, dropdownArray, doSort) {
    blockly.Blocks[`craft_${simpleFunctionName}`] = {
      helpUrl: '',
      init: function () {
        var dropdownOptions = keysToDropdownOptions(dropdownArray);
        var dropdown = new blockly.FieldDropdown(dropdownOptions);
        dropdown.setValue(dropdownOptions[0][1]);
        if (doSort) {
          dropdownOptions = _.sortBy(dropdownOptions, 0);
        }

        this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(new blockly.FieldLabel(blockText))
            .appendTitle(dropdown, 'TYPE');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    };

    blockly.Generator.get('JavaScript')[`craft_${simpleFunctionName}`] = function () {
      const dropdownValue = this.getTitleValue('TYPE');
      return `${simpleFunctionName}('${dropdownValue}', event.targetIdentifier, 'block_id_${this.id}');\n`;
    };
  }

  function simpleEntityActionBlock(simpleFunctionName, blockText) {
    blockly.Blocks[`craft_${simpleFunctionName}`] = {
      helpUrl: '',
      init: function () {
        this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(new blockly.FieldLabel(blockText));
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    };

    blockly.Generator.get('JavaScript')[`craft_${simpleFunctionName}`] = function () {
      return `${simpleFunctionName}(event.targetIdentifier, 'block_id_${this.id}');\n`;
    };
  }

  function entityTargetActionBlock(simpleFunctionName, blockText, types = ENTITY_TYPES, blockName = simpleFunctionName) {
    blockly.Blocks[`craft_${blockName}`] = {
      helpUrl: '',
      init: function () {
        var dropdownOptions = keysToDropdownOptions(types);
        var dropdown = new blockly.FieldDropdown(dropdownOptions);
        dropdown.setValue(dropdownOptions[0][1]);

        this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(new blockly.FieldLabel(blockText))
            .appendTitle(dropdown, 'TYPE');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    };

    blockly.Generator.get('JavaScript')[`craft_${blockName}`] = function () {
      const thingToTarget = this.getTitleValue('TYPE');
      return `${simpleFunctionName}(event.targetIdentifier, '${thingToTarget}', 'block_id_${this.id}');\n`;
    };
  }

  Object.keys(entityActionBlocks).forEach((name) => {
    simpleEntityActionBlock(name, entityActionBlocks[name]);
  });

  Object.keys(entityActionTargetDropdownBlocks).forEach((name) => {
    entityTargetActionBlock(name, entityActionTargetDropdownBlocks[name]);
  });

  entityTargetActionBlock('moveToward',
      entityActionTargetDropdownBlocks['moveToward'],
      ['Player', 'sheep', 'chicken'],
      'moveTowardSheepPlayerChicken');

  dropdownEntityBlock('wait', i18n.blockActionWait(), Object.keys(numbersToDisplayText).sort());
  dropdownEntityBlock('drop', i18n.blockActionDrop(), craftBlockOptions.dropDropdownOptions || miniBlocks, true);
  dropdownEntityBlock('moveDirection', i18n.blockActionMove(), ['up', 'down', 'left', 'right']);

  blockly.Blocks.craft_forever = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(i18n.forever());
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_forever = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, -1, event.targetIdentifier);`;
  };

  blockly.Blocks.craft_repeatTimes = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(i18n.blockActionRepeat())
          .appendTitle(new blockly.FieldTextInput('5', blockly.FieldTextInput.nonnegativeIntegerValidator), 'TIMES');
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_repeatTimes = function () {
    const times = this.getTitleValue('TIMES');
    const innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, ${times}, event.targetIdentifier);`;
  };

  blockly.Blocks.craft_repeatRandom = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(i18n.blockActionRepeatRandom());
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_repeatRandom = function () {
    const innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeatRandom('block_id_${this.id}', function() { ${innerCode} }, event.targetIdentifier);`;
  };

  blockly.Blocks.craft_repeatDropdown = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => [k.toString(), k.toString()]);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(i18n.blockActionRepeat())
          .appendTitle(dropdown, 'TIMES');
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_repeatDropdown = function () {
    const times = this.getTitleValue('TIMES');
    const innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, ${times}, event.targetIdentifier);`;
  };

  blockly.Blocks[`craft_spawnEntity`] = {
    helpUrl: '',
    init: function () {
      var locationOptions = keysToDropdownOptions([
        'up',
        'middle',
        'down',
        'left',
        'right',
      ]);
      const entityTypeDropdownOptions = keysToDropdownOptions(SPAWNABLE_ENTITY_TYPES);
      var entityTypeDropdown = new blockly.FieldDropdown(entityTypeDropdownOptions);
      entityTypeDropdown.setValue(entityTypeDropdownOptions[0][1]);
      var locationDropdown = new blockly.FieldDropdown(locationOptions);
      locationDropdown.setValue(locationOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionSpawn()))
          .appendTitle(entityTypeDropdown, 'TYPE')
          .appendTitle(new blockly.FieldLabel(' '))
          .appendTitle(locationDropdown, 'DIRECTION');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript')[`craft_spawnEntity`] = function () {
    const type = this.getTitleValue('TYPE');
    const direction = this.getTitleValue('DIRECTION');
    return `spawnEntity('${type}', '${direction}', 'block_id_${this.id}');\n`;
  };

  blockly.Blocks[`craft_spawnEntityRandom`] = {
    helpUrl: '',
    init: function () {
      const entityTypeDropdownOptions = keysToDropdownOptions(SPAWNABLE_ENTITY_TYPES);
      var entityTypeDropdown = new blockly.FieldDropdown(entityTypeDropdownOptions);
      entityTypeDropdown.setValue(entityTypeDropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('spawn'))
          .appendTitle(entityTypeDropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript')[`craft_spawnEntityRandom`] = function () {
    const type = this.getTitleValue('TYPE');
    return `spawnEntityRandom('${type}', 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.craft_moveEntityNorth = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('move north'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveEntityNorth = function () {
    return 'moveEntityNorth(block, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_moveEntitySouth = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('move south'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveEntitySouth = function () {
    return 'moveEntitySouth(block, \'block_id_' + this.id + '\');\n';
  };


  blockly.Blocks.craft_moveEntityEast = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('move east'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveEntityEast = function () {
    return 'moveEntityEast(block, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_moveEntityWest = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('move west'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveEntityWest = function () {
    return 'moveEntityWest(block, \'block_id_' + this.id + '\');\n';
  };

  function onSoundSelected(soundValue) {
    var soundName = stripQuotes(soundValue).trim();
    studioApp.playAudio(soundName);
  }

  blockly.Blocks.craft_playSound = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = (craftBlockOptions.playSoundOptions || allSounds).map((key) => {
        return [soundsToDisplayText[key] || key, key];
      });
      dropdownOptions = _.sortBy(dropdownOptions, 0);
      var dropdown = new blockly.FieldDropdown(dropdownOptions, onSoundSelected);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockActionPlaySound())
          .appendTitle(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_playSound = function () {
    var blockType = this.getTitleValue('TYPE');
    return `playSound("${blockType}", event.targetIdentifier, "block_id_${this.id}");\n`;
  };

  blockly.Blocks.craft_addScore = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(_.range(1, 11).map(x => `${x}`));
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockActionAdd())
          .appendTitle(dropdown, 'SCORE')
          .appendTitle(i18n.blockActionToScore());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_addScore = function () {
    var score = this.getTitleValue('SCORE');
    return 'addScore("' + score + '", \'block_id_' + this.id + '\');\n';
  };
};
