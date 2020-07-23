var i18n = require('../locale');
import items from './items';

// Helper functions for block string
function getName(blockString) {
  return blockString.split(',')[0];
}

function getData(blockString) {
  var data = blockString.split(',')[1];
  // Default data is 0
  if (data === undefined) {
    data = '0';
  }
  return data;
}

// Custom blockly return type that has name and data in string [{name},{string}]
const ITEM_TYPE = 'ITEM';

const sixDirections = [
  [i18n.directionForward(), 'forward'],
  [i18n.directionBack(), 'back'],
  [i18n.directionLeft(), 'left'],
  [i18n.directionRight(), 'right'],
  [i18n.directionUp(), 'up'],
  [i18n.directionDown(), 'down']
];

const fourDirections = [
  [i18n.directionForward(), 'forward'],
  [i18n.directionBack(), 'back'],
  [i18n.directionLeft(), 'left'],
  [i18n.directionRight(), 'right']
];

const rotateDirections = [
  [i18n.directionLeft() + ' \u21BA', 'left'],
  [i18n.directionRight() + ' \u21BB', 'right']
];

const positionTypes = [[i18n.relative(), '~'], [i18n.absolute(), '']];

const timeTypes = [[i18n.timeDay(), 'day'], [i18n.timeNight(), 'night']];

const weatherTypes = [
  [i18n.weatherTypeClear(), 'clear'],
  [i18n.weatherTypeRain(), 'rain'],
  [i18n.weatherTypeThunder(), 'thunder']
];

const oldBlockHandlings = [
  [i18n.oldBlockHandlingsReplace(), 'replace'],
  [i18n.oldBlockHandlingsDestroy(), 'destroy'],
  [i18n.oldBlockHandlingsKeep(), 'keep']
];

const testModes = [
  [i18n.testModeAll(), 'all'],
  [i18n.testModeMasked(), 'masked']
];

const maskModes = [
  [i18n.maskModeReplace(), 'replace'],
  [i18n.maskModeMasked(), 'masked']
];

const cloneModes = [
  [i18n.cloneModeNormal(), 'normal'],
  [i18n.cloneModeForce(), 'force'],
  [i18n.cloneModeMove(), 'move']
];

// Install extensions to Blockly's language and JavaScript generator.
export const install = (blockly, blockInstallOptions) => {
  const agentBlockColor = {h: 90, s: 0.57, v: 0.7};
  const itemBlockColor = {h: 358, s: 0.54, v: 0.7};
  const nonAgentBlockColor = {h: 42, s: 0.69, v: 0.76};
  const customControlColor = {h: 359, s: 0.8, v: 0.8};
  const mathBlockColor = {h: 300, s: 0.3, v: 0.7};

  //Vec3 helper block
  blockly.Blocks.craft_vecThree = {
    helpUrl: '',
    init: function() {
      this.setInputsInline(true);
      this.setHSV(mathBlockColor.h, mathBlockColor.s, mathBlockColor.v);
      this.appendValueInput('X')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel('X:'));
      this.appendValueInput('Y')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel('Y:'));
      this.appendValueInput('Z')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel('Z:'));
      this.setOutput(true, 'Number');
    }
  };

  blockly.JavaScript.craft_vecThree = function() {
    var x = Blockly.JavaScript.valueToCode(
      this,
      'X',
      Blockly.JavaScript.ORDER_NONE
    );
    var y = Blockly.JavaScript.valueToCode(
      this,
      'Y',
      Blockly.JavaScript.ORDER_NONE
    );
    var z = Blockly.JavaScript.valueToCode(
      this,
      'Z',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `getVec3(${x}, ${y}, ${z})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  // Agent related blocks
  blockly.Blocks.craft_move = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockMove()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_move = function() {
    var dir = this.getTitleValue('DIR');
    return `move('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_turn = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockTurn()))
        .appendTitle(new blockly.FieldDropdown(rotateDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_turn = function() {
    var dir = this.getTitleValue('DIR');
    return `turn('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_place = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockPlace()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendValueInput('SLOTNUM')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_place = function() {
    var dir = this.getTitleValue('DIR');
    var value = Blockly.JavaScript.valueToCode(
      this,
      'SLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    return `place('block_id_${this.id}',${value},'${dir}');`;
  };

  blockly.Blocks.craft_till = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockTill()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_till = function() {
    var dir = this.getTitleValue('DIR');
    return `till('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_attack = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionAttack()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_attack = function() {
    var dir = this.getTitleValue('DIR');
    return `attack('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_destroy = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockDestroyBlock()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_destroy = function() {
    var dir = this.getTitleValue('DIR');
    return `destroy('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_collectall = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionCollectAll())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_collectall = function() {
    return `collectall('block_id_${this.id}');`;
  };

  blockly.Blocks.craft_collect = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .appendTitle(new blockly.FieldLabel(i18n.blockActionCollect()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_collect = function() {
    var itemName = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return `collect('block_id_${this.id}',${itemName});`;
  };

  blockly.Blocks.craft_drop = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionDrop()))
        .appendTitle(new blockly.FieldDropdown(fourDirections), 'DIR');
      this.appendValueInput('SLOTNUM')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()));
      this.appendValueInput('QUANTITY')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.quantity()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_drop = function() {
    var dir = this.getTitleValue('DIR');
    var slotNumber = Blockly.JavaScript.valueToCode(
      this,
      'SLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    var quantity = Blockly.JavaScript.valueToCode(
      this,
      'QUANTITY',
      Blockly.JavaScript.ORDER_NONE
    );
    return `drop('block_id_${this.id}',${slotNumber},${quantity},'${dir}');`;
  };

  blockly.Blocks.craft_dropall = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionDropAll()))
        .appendTitle(new blockly.FieldDropdown(fourDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_dropall = function() {
    var dir = this.getTitleValue('DIR');
    return `dropall('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_detect = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionDetect()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_detect = function() {
    var dir = this.getTitleValue('DIR');
    return [
      `detect('block_id_${this.id}','${dir}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_inspect = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionInspect()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_inspect = function() {
    var dir = this.getTitleValue('DIR');
    return [
      `inspect('block_id_${this.id}','${dir}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_inspectdata = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionInspectData()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_inspectdata = function() {
    var dir = this.getTitleValue('DIR');
    return [
      `inspectdata('block_id_${this.id}','${dir}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_detectredstone = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionDetectRedstone()))
        .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_detectredstone = function() {
    var dir = this.getTitleValue('DIR');
    return [
      `detectredstone('block_id_${this.id}','${dir}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_getitemdetail = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendValueInput('SLOTNUM')
        .setCheck('Number')
        .appendTitle(
          new blockly.FieldLabel(i18n.blockActionGetItemDetailInSlotNumber())
        );
      this.setOutput(true, Blockly.BlockValueType.STRING);
    }
  };

  blockly.JavaScript.craft_getitemdetail = function() {
    var slotNumber = Blockly.JavaScript.valueToCode(
      this,
      'SLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `getitemdetail('block_id_${this.id}',${slotNumber})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_getitemspace = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendValueInput('SLOTNUM')
        .setCheck('Number')
        .appendTitle(
          new blockly.FieldLabel(i18n.blockActionGetItemSpaceInSlotNumber())
        );
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_getitemspace = function() {
    var slotNumber = Blockly.JavaScript.valueToCode(
      this,
      'SLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `getitemspace('block_id_${this.id}',${slotNumber})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_getitemcount = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendValueInput('SLOTNUM')
        .setCheck('Number')
        .appendTitle(
          new blockly.FieldLabel(i18n.blockActionGetItemCountInSlotNumber())
        );
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_getitemcount = function() {
    var slotNumber = Blockly.JavaScript.valueToCode(
      this,
      'SLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `getitemcount('block_id_${this.id}',${slotNumber})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_transfer = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionTransfer())
      );
      this.appendValueInput('SRCSLOTNUM')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()));
      this.appendValueInput('DSTSLOTNUM')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.toSlotNumber()));
      this.appendValueInput('QUANTITY')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.quantity()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_transfer = function() {
    var srcSlotNumber = Blockly.JavaScript.valueToCode(
      this,
      'SRCSLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    var dstSlotNumber = Blockly.JavaScript.valueToCode(
      this,
      'DSTSLOTNUM',
      Blockly.JavaScript.ORDER_NONE
    );
    var quantity = Blockly.JavaScript.valueToCode(
      this,
      'QUANTITY',
      Blockly.JavaScript.ORDER_NONE
    );
    return `transfer('block_id_${
      this.id
    }',${srcSlotNumber},${quantity},${dstSlotNumber});`;
  };

  blockly.Blocks.craft_tptoplayer = {
    helpUrl: '',
    init: function() {
      this.setHSV(agentBlockColor.h, agentBlockColor.s, agentBlockColor.v);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionTeleportToPlayer())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptoplayer = function() {
    return `tptoplayer('block_id_${this.id}');`;
  };
  // Non-agent blocks
  blockly.Blocks.craft_wait = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        customControlColor.h,
        customControlColor.s,
        customControlColor.v
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionWait()))
        .appendTitle(
          new blockly.FieldTextInput(
            '1000',
            blockly.FieldTextInput.numberValidator
          ),
          'MILLISECONDS'
        )
        .appendTitle(new blockly.FieldLabel('ms'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_wait = function() {
    var milliseconds = window.parseInt(this.getTitleValue('MILLISECONDS'), 10);
    return `wait('block_id_${this.id}','${milliseconds}');`;
  };

  blockly.Blocks.craft_executeasother = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionExecute()))
        .appendTitle(new blockly.FieldTextInput(''), 'COMMAND');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.onBehalfOf()))
        .appendTitle(new blockly.FieldTextInput(''), 'TARGET');
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.at()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_executeasother = function() {
    var target = encodeURIComponent(this.getTitleValue('TARGET'));
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var command = this.getTitleValue('COMMAND');
    return `executeasother('block_id_${
      this.id
    }','${target}',createBlockPosFromVec3(${vec3}, "${positionType}"),'${command}');`;
  };

  blockly.Blocks.craft_timesetbyname = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.timeSet()))
        .appendTitle(new blockly.FieldDropdown(timeTypes), 'TIME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_timesetbyname = function() {
    var time = this.getTitleValue('TIME');
    return `timesetbyname('block_id_${this.id}','${time}');`;
  };

  blockly.Blocks.craft_timesetbynumber = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.setInputsInline(true);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.timeSet())
      );
      this.appendValueInput('TIME').setCheck('Number');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_timesetbynumber = function() {
    var time =
      Blockly.JavaScript.valueToCode(
        this,
        'TIME',
        Blockly.JavaScript.ORDER_NONE
      ) || '0';
    return `timesetbynumber('block_id_${this.id}',${time});`;
  };

  blockly.Blocks.craft_weather = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.weather()))
        .appendTitle(new blockly.FieldDropdown(weatherTypes), 'WEATHER');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_weather = function() {
    var weather = this.getTitleValue('WEATHER');
    return `weather('block_id_${this.id}','${weather}');`;
  };

  blockly.Blocks.craft_tptotarget = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.setInputsInline(true);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionTeleport()))
        .appendTitle(new blockly.FieldTextInput(''), 'VICTIM');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(new blockly.FieldTextInput(''), 'DESTINATION');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptotarget = function() {
    var victim = encodeURIComponent(this.getTitleValue('VICTIM'));
    var destination = encodeURIComponent(this.getTitleValue('DESTINATION'));
    return `tptotarget('block_id_${this.id}','${victim}','${destination}');`;
  };

  blockly.Blocks.craft_tptopos = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionTeleport()))
        .appendTitle(new blockly.FieldTextInput(''), 'VICTIM');
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptopos = function() {
    var victim = encodeURIComponent(this.getTitleValue('VICTIM'));
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    return `tptopos('block_id_${
      this.id
    }','${victim}',createBlockPosFromVec3(${vec3}, "${positionType}"));`;
  };

  blockly.Blocks.craft_fill = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionFill())
      );
      this.appendValueInput('FROM_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'FROMPOSITIONTYPE'
        );
      this.appendValueInput('TO_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'TOPOSITIONTYPE'
        );
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.blockActionWith()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_fill = function() {
    var fromPositionType = this.getTitleValue('FROMPOSITIONTYPE');
    var fromVec3 = Blockly.JavaScript.valueToCode(
      this,
      'FROM_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var toPositionType = this.getTitleValue('TOPOSITIONTYPE');
    var toVec3 = Blockly.JavaScript.valueToCode(
      this,
      'TO_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return `fill('block_id_${
      this.id
    }',createBlockPosFromVec3(${fromVec3}, "${fromPositionType}"),createBlockPosFromVec3(${toVec3}, "${toPositionType}"),${item}['name'],${item}['data']);`;
  };

  blockly.Blocks.craft_give = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendValueInput('AMOUNT')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.blockActionGive()));
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.itemsOfBlockType()));
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(new blockly.FieldTextInput(''), 'PLAYER');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_give = function() {
    var player = encodeURIComponent(this.getTitleValue('PLAYER'));
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    var amount =
      Blockly.JavaScript.valueToCode(
        this,
        'AMOUNT',
        Blockly.JavaScript.ORDER_NONE
      ) || '0';
    return `give('block_id_${this.id}','${player}',${item},${amount});`;
  };

  blockly.Blocks.craft_kill = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.setInputsInline(true);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.blockActionKill()))
        .appendTitle(new blockly.FieldTextInput(''), 'TARGET');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_kill = function() {
    var target = encodeURIComponent(this.getTitleValue('TARGET'));
    return `kill('block_id_${this.id}','${target}');`;
  };

  blockly.Blocks.craft_setblock = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionSetBlock())
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldDropdown(oldBlockHandlings),
          'OLDBLOCKHANDLING'
        )
        .appendTitle(new blockly.FieldLabel(i18n.oldBlockHandling()));
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.blockActionWith()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_setblock = function() {
    var positionType = this.getTitleValue('POSITIONTYPE');
    var oldBlockHandling = this.getTitleValue('OLDBLOCKHANDLING');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return `setblock('block_id_${
      this.id
    }',createBlockPosFromVec3(${vec3}, "${positionType}"), ${item}, '${oldBlockHandling}');`;
  };

  blockly.Blocks.craft_summon = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionSummon())
      );
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.entityType()))
        .appendTitle(new blockly.FieldTextInput(''), 'ENTITYTYPE');
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .appendTitle(new blockly.FieldLabel(i18n.at()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_summon = function() {
    var entityType = this.getTitleValue('ENTITYTYPE');
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    return `summon('block_id_${
      this.id
    }','${entityType}',createBlockPosFromVec3(${vec3}, "${positionType}"));`;
  };

  blockly.Blocks.craft_testforblock = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionTestForBlock())
      );
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.at()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.blockIs()));
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_testforblock = function() {
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `testforblock('block_id_${
        this.id
      }',createBlockPosFromVec3(${vec3}, "${positionType}"),${item})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  //pelican
  blockly.Blocks.craft_testforblocks = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionTestForBlocks())
      );
      this.appendValueInput('FROM_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.from()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'FROMPOSITIONTYPE'
        );
      this.appendValueInput('TO_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'TOPOSITIONTYPE'
        );
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.destination()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldDropdown(testModes), 'TESTMODE');
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_testforblocks = function() {
    var fromPositionType = this.getTitleValue('FROMPOSITIONTYPE');
    var fromVec3 = Blockly.JavaScript.valueToCode(
      this,
      'FROM_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var toPositionType = this.getTitleValue('TOPOSITIONTYPE');
    var toVec3 = Blockly.JavaScript.valueToCode(
      this,
      'TO_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var testMode = this.getTitleValue('TESTMODE');
    return [
      `testforblocks('block_id_${
        this.id
      }',createBlockPosFromVec3(${fromVec3}, "${fromPositionType}"),createBlockPosFromVec3(${toVec3}, "${toPositionType}"),createBlockPosFromVec3(${vec3}, "${positionType}"),'${testMode}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_clone = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockActionClone())
      );
      this.appendValueInput('FROM_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.from()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'FROMPOSITIONTYPE'
        );
      this.appendValueInput('TO_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'TOPOSITIONTYPE'
        );
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.destination()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.maskMode()))
        .appendTitle(new blockly.FieldDropdown(maskModes), 'MASKMODE');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.cloneMode()))
        .appendTitle(new blockly.FieldDropdown(cloneModes), 'CLONEMODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_clone = function() {
    var fromPositionType = this.getTitleValue('FROMPOSITIONTYPE');
    var fromVec3 = Blockly.JavaScript.valueToCode(
      this,
      'FROM_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var toPositionType = this.getTitleValue('TOPOSITIONTYPE');
    var toVec3 = Blockly.JavaScript.valueToCode(
      this,
      'TO_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var maskMode = this.getTitleValue('MASKMODE');
    var cloneMode = this.getTitleValue('CLONEMODE');
    return `clone('block_id_${
      this.id
    }',createBlockPosFromVec3(${fromVec3}, "${fromPositionType}"),createBlockPosFromVec3(${toVec3}, "${toPositionType}"),createBlockPosFromVec3(${vec3}, "${positionType}"),'${maskMode}','${cloneMode}');`;
  };

  blockly.Blocks.craft_clonefiltered = {
    helpUrl: '',
    init: function() {
      this.setHSV(
        nonAgentBlockColor.h,
        nonAgentBlockColor.s,
        nonAgentBlockColor.v
      );
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.blockActionCloneFiltered()));
      this.appendValueInput('FROM_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.from()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'FROMPOSITIONTYPE'
        );
      this.appendValueInput('TO_VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.to()))
        .appendTitle(
          new blockly.FieldDropdown(positionTypes),
          'TOPOSITIONTYPE'
        );
      this.appendValueInput('VEC3')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(new blockly.FieldLabel(i18n.destination()))
        .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.cloneMode()))
        .appendTitle(new blockly.FieldDropdown(cloneModes), 'CLONEMODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_clonefiltered = function() {
    var fromPositionType = this.getTitleValue('FROMPOSITIONTYPE');
    var fromVec3 = Blockly.JavaScript.valueToCode(
      this,
      'FROM_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var toPositionType = this.getTitleValue('TOPOSITIONTYPE');
    var toVec3 = Blockly.JavaScript.valueToCode(
      this,
      'TO_VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var positionType = this.getTitleValue('POSITIONTYPE');
    var vec3 = Blockly.JavaScript.valueToCode(
      this,
      'VEC3',
      Blockly.JavaScript.ORDER_NONE
    );
    var cloneMode = this.getTitleValue('CLONEMODE');
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return `clonefiltered('block_id_${
      this.id
    }',createBlockPosFromVec3(${fromVec3}, "${fromPositionType}"),createBlockPosFromVec3(${toVec3}, "${toPositionType}"),createBlockPosFromVec3(${vec3}, "${positionType}")}','${cloneMode}',${item});`;
  };

  // Item blocks

  blockly.Blocks.craft_createblock = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendValueInput('BLOCKTYPE')
        .setCheck(Blockly.JavaScript.STRING)
        .appendTitle(new blockly.FieldLabel(i18n.blockType()));
      this.appendValueInput('BLOCKDATA')
        .setCheck(Blockly.JavaScript.STRING)
        .appendTitle(new blockly.FieldLabel(i18n.blockData()));
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_createblock = function() {
    var blockType = Blockly.JavaScript.valueToCode(
      this,
      'BLOCKTYPE',
      Blockly.JavaScript.ORDER_NONE
    );
    var blockData = Blockly.JavaScript.valueToCode(
      this,
      'BLOCKDATA',
      Blockly.JavaScript.ORDER_NONE
    );
    return [
      `item('block_id_${this.id}',${blockType},${blockData})`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_block = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.itemTypeBlock()))
        .appendTitle(
          new blockly.FieldImageDropdown(items.blocks, 32, 32),
          'BLOCK'
        );
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_block = function() {
    var block = this.getTitleValue('BLOCK');
    return [
      `item('block_id_${this.id}','${getName(block)}','${getData(block)}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_miscellaneous = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.itemTypeMiscellaneous()))
        .appendTitle(
          new blockly.FieldImageDropdown(items.miscellaneous, 32, 32),
          'ITEM'
        );
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_miscellaneous = function() {
    var item = this.getTitleValue('ITEM');
    return [
      `item('block_id_${this.id}','${getName(item)}','${getData(item)}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_decoration = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.itemTypeDecoration()))
        .appendTitle(
          new blockly.FieldImageDropdown(items.decorations, 32, 32),
          'ITEM'
        );
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_decoration = function() {
    var item = this.getTitleValue('ITEM');
    return [
      `item('block_id_${this.id}','${getName(item)}','${getData(item)}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_tool = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldLabel(i18n.itemTypeTool()))
        .appendTitle(
          new blockly.FieldImageDropdown(items.tools, 32, 32),
          'ITEM'
        );
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_tool = function() {
    var item = this.getTitleValue('ITEM');
    return [
      `item('block_id_${this.id}','${getName(item)}','${getData(item)}')`,
      Blockly.JavaScript.ORDER_FUNCTION_CALL
    ];
  };

  blockly.Blocks.craft_getnameof = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .appendTitle(new blockly.FieldLabel(i18n.getnameof()));
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_getnameof = function() {
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [`${item}['name']`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getdataof = {
    init: function() {
      this.setHSV(itemBlockColor.h, itemBlockColor.s, itemBlockColor.v);
      this.appendValueInput('ITEM')
        .setCheck(ITEM_TYPE)
        .appendTitle(new blockly.FieldLabel(i18n.getdataof()));
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_getdataof = function() {
    var item = Blockly.JavaScript.valueToCode(
      this,
      'ITEM',
      Blockly.JavaScript.ORDER_NONE
    );
    return [`${item}['data']`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };
};
