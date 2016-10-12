const i18n = require('./locale');

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

function keysToDropdownOptions(keysList) {
  return keysList.map(function (key) {
    var displayText = (blocksToDisplayText[key] || key);
    return [displayText, key];
  });
}

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
    'sheep'
  ]).concat(allBlocks);

  blockly.Blocks.craft_moveForward = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockMoveForward()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveForward = function () {
    return 'moveForward(\'block_id_' + this.id + '\');\n';
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

  blockly.Generator.get('JavaScript').craft_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCall = dir === "left" ? "turnLeft" : "turnRight";
    return methodCall + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_turnEntity = {
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

  blockly.Blocks.craft_turnEntity.DIRECTIONS =
      [['turn entity left' + ' \u21BA', 'left'],
        ['turn entity right' + ' \u21BB', 'right']];

  // TODO(bjordan): fix, not turning
  blockly.Generator.get('JavaScript').craft_turnEntity = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCall = dir === "left" ? "turnEntity" : "turnEntity";
    return methodCall + '(block, \''+dir+'\', \'block_id_' + this.id + '\');\n';
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

  blockly.Blocks.craft_forever = {
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle('forever')
      this.appendStatementInput('DO')
          .appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_forever = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'forever(\'block_id_' + this.id + '\',\n"' +
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

  function blockFor(displayName) {
    return {
      init: function () {
        this.appendDummyInput()
            .appendTitle(displayName);
        this.appendStatementInput("WHEN_USED")
            .appendTitle("When Used");
        this.appendStatementInput("WHEN_TOUCHED")
            .appendTitle("When Touched");
        this.appendStatementInput("WHEN_SPAWNED")
            .appendTitle("When Spawned");
        this.appendStatementInput("WHEN_ATTACKED")
            .appendTitle("When Attacked");
        this.setColour(120);
        this.setTooltip('');
      }
    };
  }

  function generatorFor(type) {
    return function () {
      const eventTypes = Object.freeze({
        WhenTouched: 0,
        WhenUsed: 1,
        WhenSpawned: 2,
        WhenAttacked: 3,
        WhenNight: 4,
        WhenDay: 5
      });
      const statementNameToEvent = {
        WHEN_USED: eventTypes.WhenUsed,
        WHEN_TOUCHED: eventTypes.WhenTouched,
        WHEN_SPAWNED: eventTypes.WhenSpawned,
        WHEN_ATTACKED: eventTypes.WhenAttacked,
        WHEN_NIGHT: eventTypes.WhenNight,
        WHEN_DAY: eventTypes.WhenDay,
      };

      var blockType = type;

      return Object.keys(statementNameToEvent).map((statementName) => {
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

  createEventBlockForEntity('cow', 'Cow');
  createEventBlockForEntity('sheep', 'Sheep');
  createEventBlockForEntity('zombie', 'Zombie');
  createEventBlockForEntity('ironGolem', 'Iron Golem');
  createEventBlockForEntity('creeper', 'Creeper');
  createEventBlockForEntity('chicken', 'Chicken');

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
      const thingToDrop = this.getTitleValue('TYPE');
      console.log(thingToDrop);
      return `${simpleFunctionName}('${thingToDrop}', event.targetIdentifier, 'block_id_${this.id}');\n`;
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

  const entityActionBlocks = [
    'moveEntityForward',
    'destroyEntity',
    'attack',
    'flashEntity',
    'explodeEntity'
  ];

  entityActionBlocks.forEach((name) => {
    simpleEntityActionBlock(name, name);
  });

  dropdownEntityBlock('drop', 'drop', miniBlocks);
  //simpleEntityBlock('destroyEntity', 'destroy it');
  //simpleEntityBlock('flashEntity', 'flash it');
  //simpleEntityBlock('moveEntityForward', 'move it forward');
  simpleEntityBlock('moveEntityTowardPlayer', 'move toward player');
  simpleEntityBlock('moveEntityAwayFromPlayer', 'move away from player');
  simpleEntityBlock('turnEntityRight', 'turn it right');
  simpleEntityBlock('turnEntityLeft', 'turn it left');
  simpleEntityBlock('turnEntityRandom', 'turn it random');
  simpleEntityBlock('turnEntityToPlayer', 'turn toward player');

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

  blockly.Blocks.craft_playSound = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = keysToDropdownOptions(allSounds);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
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

