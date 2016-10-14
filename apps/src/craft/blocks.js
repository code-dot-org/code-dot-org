const i18n = require('./locale');
import { singleton as studioApp } from '../StudioApp';
import { stripQuotes, valueOr } from '../utils';
import _ from 'lodash';

const eventTypes = Object.freeze({
  WhenTouched : 0,
  WhenUsed : 1,
  WhenSpawned : 2,
  WhenAttacked : 3,
  WhenNight : 4,
  WhenDay : 5,
  WhenNightGlobal : 6,
  WhenDayGlobal : 7
});

const numbersToDisplayText = {
  '0.4': 'very short',
  '1.0': 'short',
  '2.0': 'medium',
  '4.0': 'long',
  '8.0': 'very long'
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

const miniBlocks = [
  'dirt',
  'dirtCoarse',
  'sand',
  'gravel',
  'bricks',
  'logAcacia',
  'logBirch',
  'logJungle',
  'logOak',
  'logSpruce',
  'planksAcacia',
  'planksBirch',
  'planksJungle',
  'planksOak',
  'planksSpruce',
  'cobblestone',
  'sandstone',
  'wool',
  'redstoneDust',
  'lapisLazuli',
  'ingotIron',
  'ingotGold',
  'emerald',
  'diamond',
  'coal',
  'bucketWater',
  'bucketLava',
  'gunPowder',
  'wheat',
  'potato',
  'carrots',
  'milk',
  'egg',
  'poppy',
  'sheep'
];

const allBlocks = [
  'bedrock',
  'bricks',
  'clay',
  'oreCoal',
  'dirtCoarse',
  'cobblestone',
  'oreDiamond',
  'dirt',
  'oreEmerald',
  'farmlandWet',
  'glass',
  'oreGold',
  'grass',
  'gravel',
  'clayHardened',
  'oreIron',
  'oreLapis',
  'lava',
  'logAcacia',
  'logBirch',
  'logJungle',
  'logOak',
  'logSpruce',
  'planksAcacia',
  'planksBirch',
  'planksJungle',
  'planksOak',
  'planksSpruce',
  'oreRedstone',
  'sand',
  'sandstone',
  'stone',
  'tnt',
  'tree',
  'wool'];

const allSounds = [
  'dig_wood1',
  'stepGrass',
  'stepWood',
  'stepStone',
  'stepGravel',
  'stepFarmland',
  'failure',
  'success',
  'fall',
  'fuse',
  'explode',
  'placeBlock',
  'collectedBlock',
  'bump',
  'punch',
  'fizz',
  'doorOpen',
  'houseSuccess',
  'minecart',
  'sheepBaa'
];

const ENTITY_TYPES = [
  'Player', // TODO(bjordan): other entity types
  'sheep',
  'zombie',
  'ironGolem',
  'creeper',
  'cow',
  'chicken',
];

const SPAWNABLE_ENTITY_TYPES = [
  'sheep',
  'zombie',
  'ironGolem',
  'creeper',
  'cow',
  'chicken',
];

function keysToDropdownOptions(keysList) {
  return keysList.map(function (key) {
    var displayText = (blocksToDisplayText[key] || numbersToDisplayText[key] || key);
    return [displayText, key];
  });
}


const entityActionBlocks = {
  'destroyEntity': 'disappear',
  'attack': 'attack',
  'flashEntity': 'flash entity',
  'moveForward': 'move forward',
  'moveRandom': 'move random',
  'explodeEntity': 'explode'
};

const entityActionTargetDropdownBlocks = {
  'moveToward': 'move toward',
  'moveTo': 'move to',
  'moveAway': 'move away'
};

exports.entityActionBlocks = Object.keys(entityActionBlocks);
exports.entityActionTargetDropdownBlocks = Object.keys(entityActionTargetDropdownBlocks);

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var dropdownBlocks = (blockInstallOptions.level.availableBlocks || []).concat(
    JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || []);

  var dropdownBlockSet = {};

  dropdownBlocks.forEach(function (type) {
    dropdownBlockSet[type] = true;
  });

  var craftBlockOptions = {
    inventoryBlocks: Object.keys(dropdownBlockSet),
    ifBlockOptions: blockInstallOptions.level.ifBlockOptions,
    placeBlockOptions: blockInstallOptions.level.placeBlockOptions
  };

  var inventoryBlocksEmpty = !craftBlockOptions.inventoryBlocks ||
      craftBlockOptions.inventoryBlocks.length === 0;
  var allDropdownBlocks = inventoryBlocksEmpty ?
      allBlocks : craftBlockOptions.inventoryBlocks;

  var allOnTouchedBlocks = [].concat([
    'sheep',
  ]).concat(allBlocks);

  //blockly.Blocks.craft_moveForward = {
  //  helpUrl: '',
  //  init: function () {
  //    this.setHSV(184, 1.00, 0.74);
  //    this.appendDummyInput()
  //        .appendTitle(new blockly.FieldLabel(i18n.blockMoveForward()));
  //    this.setPreviousStatement(true);
  //    this.setNextStatement(true);
  //  }
  //};
  //
  //blockly.Generator.get('JavaScript').craft_moveForward = function () {
  //  return 'moveForward(\'block_id_' + this.id + '\');\n';
  //};


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
        ['turn random', 'random']
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

  blockly.Blocks.craft_destroyBlock = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockDestroyBlock()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_destroyBlock = function () {
    return 'destroyBlock(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_shear = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockShear()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_shear = function () {
    return 'shear(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_whileBlockAhead = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.ifBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(i18n.blockWhileXAheadWhile())
          .appendTitle(dropdown, 'TYPE')
          .appendTitle(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_whileBlockAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'whileBlockAhead(\'block_id_' + this.id + '\',\n"' +
            blockType + '", ' +
        '  function() { '+
            innerCode +
        '  }' +
        ');\n';
  };

  blockly.Blocks.craft_ifBlockAhead = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.ifBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(i18n.blockIf())
          .appendTitle(dropdown, 'TYPE')
          .appendTitle(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_ifBlockAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'ifBlockAhead("' + blockType + '", function() {\n' +
      innerCode +
    '}, \'block_id_' + this.id + '\');\n';
  };

  const statementNameToEvent = {
    WHEN_USED: eventTypes.WhenUsed,
    WHEN_TOUCHED: eventTypes.WhenTouched,
    WHEN_SPAWNED: eventTypes.WhenSpawned,
    WHEN_ATTACKED: eventTypes.WhenAttacked,
    WHEN_NIGHT: eventTypes.WhenNight,
    WHEN_DAY: eventTypes.WhenDay,
  };

  const statementNameToDisplayName = {
    WHEN_USED: "when clicked",
    WHEN_TOUCHED: "when touched",
    WHEN_SPAWNED: "when spawned",
    WHEN_ATTACKED: "when attacked",
    WHEN_NIGHT: "when night",
    WHEN_DAY: "when day",
  };

  function blockFor(displayName, statementNames = Object.keys(statementNameToDisplayName)) {
    return {
      init: function () {
        this.appendDummyInput()
            .appendTitle(displayName);
        statementNames.forEach((name) => {
          this.appendStatementInput(name)
              .appendTitle(statementNameToDisplayName[name]);
        });
        this.setColour(120);
        this.setTooltip('');
      }
    };
  }

  function generatorFor(blockType, statementNames = Object.keys(statementNameToEvent)) {
    return function () {
      return statementNames.map((statementName) => {
        return `
        onEventTriggered("${blockType}", ${statementNameToEvent[statementName]}, function(event) {
          ${blockly.Generator.get('JavaScript').statementToCode(this, statementName)}
        }, 'block_id_${this.id}');`;
      }).join("\n");
    }
  }

  function createEventBlockForEntity(entityID, displayName) {
    blockly.Blocks[`craft_${entityID}`] = blockFor(displayName);
    blockly.Generator.get('JavaScript')[`craft_${entityID}`] = generatorFor(entityID);
  }

  function createLimitedEventBlockForEntity(entityType, entityID, displayName, statementNames) {
    blockly.Blocks[`craft_${entityID}`] = blockFor(displayName, statementNames);
    blockly.Generator.get('JavaScript')[`craft_${entityID}`] = generatorFor(entityType, statementNames);
  }

  createEventBlockForEntity('cow', 'cow');
  createEventBlockForEntity('sheep', 'sheep');
  createEventBlockForEntity('zombie', 'zombie');
  createEventBlockForEntity('ironGolem', 'iron golem');
  createEventBlockForEntity('creeper', 'creeper');
  createEventBlockForEntity('chicken', 'chicken');
  createLimitedEventBlockForEntity('sheep', 'sheepClicked', 'sheep', ['WHEN_USED']);
  createLimitedEventBlockForEntity('chicken', 'chickenSpawnedClicked', 'chicken', ['WHEN_SPAWNED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('sheep', 'sheepSpawnedTouchedClicked', 'sheep', ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('cow', 'cowSpawnedTouchedClicked', 'cow', ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED']);
  createLimitedEventBlockForEntity('zombie', 'zombieSpawnedTouchedClickedDay', 'zombie', ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_DAY']);
  createLimitedEventBlockForEntity('creeper', 'creeperSpawnedTouchedClickedDay', 'creeper', ['WHEN_SPAWNED', 'WHEN_TOUCHED', 'WHEN_USED', 'WHEN_DAY']);


  function makeGlobalEventBlock(functionName, text, eventType) {
    blockly.Blocks[`craft_${functionName}`] = {
      helpUrl: '',
      init: function () {
        var dropdownOptions = keysToDropdownOptions(allOnTouchedBlocks);
        var dropdown = new blockly.FieldDropdown(dropdownOptions);
        dropdown.setValue(dropdownOptions[0][1]);
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

  makeGlobalEventBlock('whenDay', 'when day', eventTypes.WhenDayGlobal);
  makeGlobalEventBlock('whenNight', 'when night', eventTypes.WhenNightGlobal);

  blockly.Blocks.craft_onTouched = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(allOnTouchedBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle('on touched')
          .appendTitle(dropdown, 'TYPE');
      this.appendStatementInput('DO');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    }
  };

  blockly.Generator.get('JavaScript').craft_onTouched = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'onTouched("' + blockType + '", function(block) {\n' +
      innerCode +
    '}, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_onPlayerMoved = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(allOnTouchedBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle('on player moved')
          .appendTitle(dropdown, 'TYPE');
      this.appendStatementInput('DO');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    }
  };

  blockly.Generator.get('JavaScript').craft_onPlayerMoved = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'onPlayerMoved("' + blockType + '", function(block) {\n' +
      innerCode +
    '}, \'block_id_' + this.id + '\');\n';
  };

  function simpleEntityBlock(simpleFunctionName, blockText) {
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
      return `${simpleFunctionName}(block, 'block_id_${this.id}');\n`;
    };
  }

  function dropdownEntityBlock(simpleFunctionName, blockText, dropdownArray) {
    blockly.Blocks[`craft_${simpleFunctionName}`] = {
      helpUrl: '',
      init: function () {
        var dropdownOptions = keysToDropdownOptions(dropdownArray);
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

    blockly.Generator.get('JavaScript')[`craft_${simpleFunctionName}`] = function () {
      const dropdownValue = this.getTitleValue('TYPE');
      return `${simpleFunctionName}('${dropdownValue}', event.targetIdentifier, 'block_id_${this.id}');\n`;
    };
  }

  function numberEntryBlock(simpleFunctionName, blockText) {
    blockly.Blocks[`craft_${simpleFunctionName}`] = {
      helpUrl: '',
      init: function () {
        this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(new blockly.FieldLabel(blockText))
            .appendTitle(new blockly.FieldTextInput('2', blockly.FieldTextInput.nonnegativeIntegerValidator), 'VALUE');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    };

    blockly.Generator.get('JavaScript')[`craft_${simpleFunctionName}`] = function () {
      const value = this.getTitleValue('VALUE');
      return `${simpleFunctionName}('${value}', event.targetIdentifier, 'block_id_${this.id}');\n`;
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

  dropdownEntityBlock('wait', 'wait', Object.keys(numbersToDisplayText).sort());
  dropdownEntityBlock('drop', 'drop', miniBlocks);
  dropdownEntityBlock('moveDirection', 'move', ['up', 'down', 'left', 'right']);
  //simpleEntityBlock('moveEntityTowardPlayer', 'move toward player');
  //simpleEntityBlock('moveEntityAwayFromPlayer', 'move away from player');
  //simpleEntityBlock('turnEntityRight', 'turn it right');
  //simpleEntityBlock('turnEntityLeft', 'turn it left');
  //simpleEntityBlock('turnEntityRandom', 'turn it random');
  //simpleEntityBlock('turnEntityToPlayer', 'turn toward player');


  blockly.Blocks.craft_forever = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle('forever');
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_forever = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, -1, event.targetIdentifier);`
  };

  blockly.Blocks.craft_repeatTimes = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle('repeat')
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
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, ${times}, event.targetIdentifier);`
  };

  blockly.Blocks.craft_repeatRandom = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle('repeat random')
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_repeatRandom = function () {
    const times = this.getTitleValue('TIMES');
    const innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return `repeatRandom('block_id_${this.id}', function() { ${innerCode} }, event.targetIdentifier);`
  };

  blockly.Blocks.craft_repeatDropdown = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => [k.toString(), k.toString()]);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle('repeat')
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
    return `repeat('block_id_${this.id}', function() { ${innerCode} }, ${times}, event.targetIdentifier);`
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
          .appendTitle(new blockly.FieldLabel('spawn'))
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

  blockly.Blocks.craft_ifLavaAhead = {
    helpUrl: '',
    init: function () {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(i18n.blockIfLavaAhead());
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_ifLavaAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return 'ifLavaAhead(function() {\n' +
      innerCode +
    '}, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeBlock = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.placeBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockPlaceXPlace())
          .appendTitle(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeBlock = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlock("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };

  function onSoundSelected(soundValue) {
    var soundName = stripQuotes(soundValue).trim();
    studioApp.playAudio(soundName);
  }

  blockly.Blocks.craft_playSound = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(allSounds);
      var dropdown = new blockly.FieldDropdown(dropdownOptions, onSoundSelected);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle('play sound')
          .appendTitle(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_playSound = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'playSound("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeTorch = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockPlaceTorch());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeTorch = function () {
    return 'placeTorch(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_plantCrop = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockPlantCrop());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_plantCrop = function () {
    return 'plantCrop(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_tillSoil = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockTillSoil());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_tillSoil = function () {
    return 'tillSoil(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeBlockAhead = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.placeBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(i18n.blockPlaceXAheadPlace())
          .appendTitle(dropdown, 'TYPE')
          .appendTitle(i18n.blockPlaceXAheadAhead());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeBlockAhead = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlockAhead("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };

};

