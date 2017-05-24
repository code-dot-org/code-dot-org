var i18n = require('./locale');
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

const sixDirections = [[i18n.directionForward(),'forward'],[i18n.directionBack(), 'back'],[i18n.directionLeft(),'left'],[i18n.directionRight(),'right'],[i18n.directionUp(),'up'],[i18n.directionDown(),'down']];

const fourDirections = [[i18n.directionForward(),'forward'],[i18n.directionBack(), 'back'],[i18n.directionLeft(),'left'],[i18n.directionRight(),'right']];

const rotateDirections = [[i18n.directionLeft() + ' \u21BA', 'left'], [i18n.directionRight() + ' \u21BB', 'right']];

const positionTypes = [[i18n.relative() , '~'], [i18n.absolute(), '']];

const timeTypes = [[i18n.timeDay(), 'day'], [i18n.timeNight(), 'night']];

const weatherTypes = [[i18n.weatherTypeClear(), 'clear'], [i18n.weatherTypeRain(), 'rain'], [i18n.weatherTypeThunder(), 'thunder']];


function createBlockPos(x, y, z, prefix) {
    return encodeURIComponent(`${prefix}${x} ${prefix}${y} ${prefix}${z}`);
}

// Install extensions to Blockly's language and JavaScript generator.
export const install = (blockly, blockInstallOptions) => {
  // Agent related blocks
  blockly.Blocks.craft_move = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockMove()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_move = function () {
    var dir = this.getTitleValue('DIR');
    return `move('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_turn = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockTurn()))
          .appendTitle(new blockly.FieldDropdown(rotateDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_turn = function () {
    var dir = this.getTitleValue('DIR');
    return `turn('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_place = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockPlace()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SLOTNUM');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_place = function () {
    var dir = this.getTitleValue('DIR');
    var value = window.parseInt(this.getTitleValue('SLOTNUM'), 10);
    return `place('block_id_${this.id}','${value}','${dir}');`;
  };

  blockly.Blocks.craft_till = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockTill()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_till = function () {
    var dir = this.getTitleValue('DIR');
    return `till('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_attack = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionAttack()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_attack = function () {
    var dir = this.getTitleValue('DIR');
    return `attack('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_destroy = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockDestroyBlock()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_destroy = function () {
    var dir = this.getTitleValue('DIR');
    return `destroy('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_collectall = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionCollectAll()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_collectall = function () {
    return `collectall('block_id_${this.id}');`;
  };

  blockly.Blocks.craft_collect = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('ITEM')
          .setCheck(ITEM_TYPE)
          .appendTitle(new blockly.FieldLabel(i18n.blockActionCollect()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_collect = function () {
    var itemName = Blockly.JavaScript.valueToCode(this, 'ITEM', Blockly.JavaScript.ORDER_NONE);
    return `collect('block_id_${this.id}',${itemName});`;
  };

  blockly.Blocks.craft_drop = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionDrop()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SLOTNUM');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.quantity()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'QUANTITY');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_drop = function () {
    var dir = this.getTitleValue('DIR');
    var slotNumber = window.parseInt(this.getTitleValue('SLOTNUM'), 10);
    var quantity = window.parseInt(this.getTitleValue('QUANTITY'), 10);
    return `drop('block_id_${this.id}','${slotNumber}','${quantity}','${dir}');`;
  };

  blockly.Blocks.craft_dropall = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionDropAll()))
          .appendTitle(new blockly.FieldDropdown(fourDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_dropall = function () {
    var dir = this.getTitleValue('DIR');
    return `dropall('block_id_${this.id}','${dir}');`;
  };

  blockly.Blocks.craft_detect = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionDetect()))
          .appendTitle(new blockly.FieldDropdown(fourDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_detect = function () {
    var dir = this.getTitleValue('DIR');
    return [`detect('block_id_${this.id}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_inspect = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionInspect()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_inspect = function () {
    var dir = this.getTitleValue('DIR');
    return [`inspect('block_id_${this.id}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_inspectdata = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionInspectData()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_inspectdata = function () {
    var dir = this.getTitleValue('DIR');
    return [`inspectdata('block_id_${this.id}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_detectredstone = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionDetectRedstone()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    }
  };

  blockly.JavaScript.craft_detectredstone = function () {
    var dir = this.getTitleValue('DIR');
    return [`detectredstone('block_id_${this.id}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getitemdetail = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionGetItemDetail()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SLOTNUM');
      this.setOutput(true, Blockly.BlockValueType.STRING);
    }
  };

  blockly.JavaScript.craft_getitemdetail = function () {
    var dir = this.getTitleValue('DIR');
    var slotNumber = window.parseInt(this.getTitleValue('SLOTNUM'), 10);
    return [`getitemdetail('block_id_${this.id}','${slotNumber}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getitemspace = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionGetItemSpace()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SLOTNUM');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_getitemspace = function () {
    var dir = this.getTitleValue('DIR');
    var slotNumber = window.parseInt(this.getTitleValue('SLOTNUM'), 10);
    return [`getitemspace('block_id_${this.id}','${slotNumber}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getitemcount = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionGetItemCount()))
          .appendTitle(new blockly.FieldDropdown(sixDirections), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SLOTNUM');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
    }
  };

  blockly.JavaScript.craft_getitemcount = function () {
    var dir = this.getTitleValue('DIR');
    var slotNumber = window.parseInt(this.getTitleValue('SLOTNUM'), 10);
    return [`getitemcount('block_id_${this.id}','${slotNumber}','${dir}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_transfer = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionTransfer()));
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.inSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'SRCSLOTNUM');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.toSlotNumber()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'DSTSLOTNUM');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.quantity()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'QUANTITY');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_transfer = function () {
    var srcSlotNumber = window.parseInt(this.getTitleValue('SRCSLOTNUM'), 10);
    var dstSlotNumber = window.parseInt(this.getTitleValue('DSTSLOTNUM'), 10);
    var quantity = window.parseInt(this.getTitleValue('QUANTITY'), 10);
    return `transfer('block_id_${this.id}','${srcSlotNumber}','${quantity}','${dstSlotNumber}');`;
  };

  blockly.Blocks.craft_tptoplayer = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionTeleportToPlayer()));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptoplayer = function () {
    return `tptoplayer('block_id_${this.id}');`;
  };
  // Non-agent blocks
  blockly.Blocks.craft_wait = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionWait()))
          .appendTitle(new blockly.FieldTextInput('1000', blockly.FieldTextInput.numberValidator), 'MILLISECONDS')
          .appendTitle(new blockly.FieldLabel('ms'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_wait = function () {
    var milliseconds = window.parseInt(this.getTitleValue('MILLISECONDS'), 10);
    return `wait('block_id_${this.id}','${milliseconds}');`;
  };

  blockly.Blocks.craft_executeasother = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionExecute()))
          .appendTitle(new blockly.FieldTextInput(''), 'COMMAND');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.onBehalfOf()))
          .appendTitle(new blockly.FieldTextInput(''), 'TARGET');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.at()))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Z');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_executeasother = function () {
    var target = encodeURIComponent(this.getTitleValue('TARGET'));
    var positionType = this.getTitleValue('POSITIONTYPE');
    var x = this.getTitleValue('X');
    var y = this.getTitleValue('Y');
    var z = this.getTitleValue('Z');
    var command = this.getTitleValue('COMMAND');
    return `executeasother('block_id_${this.id}','${target}','${createBlockPos(x, y, z, positionType)}','${command}');`;
  };

  blockly.Blocks.craft_executedetect = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionExecute()))
          .appendTitle(new blockly.FieldTextInput(''), 'COMMAND');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('on behalf of'))
          .appendTitle(new blockly.FieldTextInput(''), 'TARGET');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('at'))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Z');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('if'))
          .appendTitle(new blockly.FieldImageDropdown(items.blocks, 32, 32),'BLOCK');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel('detected at'))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'BLOCKPOSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'BLOCK_X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'BLOCK_Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'BLOCK_Z');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_executedetect = function () {
    var target = encodeURIComponent(this.getTitleValue('TARGET'));
    var positionType = this.getTitleValue('POSITIONTYPE');
    var x = this.getTitleValue('X');
    var y = this.getTitleValue('Y');
    var z = this.getTitleValue('Z');
    var block = this.getTitleValue('BLOCK');
    var blockPositionType = this.getTitleValue('BLOCKPOSITIONTYPE');
    var blockX = this.getTitleValue('BLOCK_X');
    var blockY = this.getTitleValue('BLOCK_Y');
    var blockZ = this.getTitleValue('BLOCK_Z');
    var command = this.getTitleValue('COMMAND');
    return `executedetect('block_id_${this.id}','${target}','${createBlockPos(x, y, z, positionType)}',
    '${getName(block)}','${getData(block)}','${createBlockPos(blockX, blockY, blockZ, blockPositionType)}','${command}');`;
  };

  blockly.Blocks.craft_timesetbyname = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.timeSet()))
          .appendTitle(new blockly.FieldDropdown(timeTypes), 'TIME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_timesetbyname = function () {
    var time = this.getTitleValue('TIME');
    return `timesetbyname('block_id_${this.id}','${time}');`;
  };

  blockly.Blocks.craft_timesetbynumber = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.timeSet()))
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'TIME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_timesetbynumber = function () {
    var time = this.getTitleValue('TIME');
    return `timesetbynumber('block_id_${this.id}','${time}');`;
  };

  blockly.Blocks.craft_weather = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.weather()))
          .appendTitle(new blockly.FieldDropdown(weatherTypes), 'WEATHER');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_weather = function () {
    var weather = this.getTitleValue('WEATHER');
    return `weather('block_id_${this.id}','${weather}');`;
  };

  blockly.Blocks.craft_tptotarget = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionTeleport()))
          .appendTitle(new blockly.FieldLabel(i18n.target()))
          .appendTitle(new blockly.FieldTextInput(''), 'VICTIM');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.to()))
          .appendTitle(new blockly.FieldTextInput(''), 'DESTINATION');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptotarget = function () {
    var victim = encodeURIComponent(this.getTitleValue('VICTIM'));
    var destination = encodeURIComponent(this.getTitleValue('DESTINATION'));
    return `tptotarget('block_id_${this.id}','${victim}','${destination}');`;
  };

  blockly.Blocks.craft_tptopos = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionTeleport()))
          .appendTitle(new blockly.FieldLabel(i18n.target()))
          .appendTitle(new blockly.FieldTextInput(''), 'VICTIM');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.to()))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'POSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'Z');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_tptopos = function () {
    var victim = encodeURIComponent(this.getTitleValue('VICTIM'));
    var positionType = this.getTitleValue('POSITIONTYPE');
    var x = this.getTitleValue('X');
    var y = this.getTitleValue('Y');
    var z = this.getTitleValue('Z');
    return `tptopos('block_id_${this.id}','${victim}','${createBlockPos(x, y, z, positionType)}');`;
  };

  blockly.Blocks.craft_fill = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.blockActionFill()));
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.from()))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'FROMPOSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'FROM_X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'FROM_Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'FROM_Z');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.to()))
          .appendTitle(new blockly.FieldDropdown(positionTypes), 'TOPOSITIONTYPE')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'TO_X')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'TO_Y')
          .appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'TO_Z');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(items.blocks, 32, 32),'BLOCK');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_fill = function () {
    var fromPositionType = this.getTitleValue('FROMPOSITIONTYPE');
    var fromX = this.getTitleValue('FROM_X');
    var fromY = this.getTitleValue('FROM_Y');
    var fromZ = this.getTitleValue('FROM_Z');
    var toPositionType = this.getTitleValue('TOPOSITIONTYPE');
    var toX = this.getTitleValue('TO_X');
    var toY = this.getTitleValue('TO_Y');
    var toZ = this.getTitleValue('TO_Z');
    var block = this.getTitleValue('BLOCK');
    return `fill('block_id_${this.id}','${createBlockPos(fromX, fromY, fromZ, fromPositionType)}','${createBlockPos(toX, toY, toZ, toPositionType)}','${getName(block)}','${getData(block)}');`;
  };

  blockly.Blocks.craft_give = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('ITEM')
          .appendTitle(new blockly.FieldLabel(i18n.blockActionGive()))
          .setCheck(ITEM_TYPE);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.items()))
          .appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'AMOUNT');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.to()))
          .appendTitle(new blockly.FieldTextInput(''), 'PLAYER');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.craft_give = function () {
    var player = encodeURIComponent(this.getTitleValue('PLAYER'));
    var item = Blockly.JavaScript.valueToCode(this, 'ITEM', Blockly.JavaScript.ORDER_NONE);
    var amount = this.getTitleValue('AMOUNT');
    return `give('block_id_${this.id}','${player}', ${item},'${amount}');`;
  };

  blockly.Blocks.craft_createblock = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendValueInput('BLOCKTYPE')
          .setCheck(Blockly.JavaScript.STRING)
          .appendTitle(new blockly.FieldLabel(i18n.blockType()));
      this.appendValueInput('BLOCKDATA')
          .setCheck(Blockly.JavaScript.STRING)
          .appendTitle(new blockly.FieldLabel(i18n.blockData()));
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_createblock = function () {
    var blockType = Blockly.JavaScript.valueToCode(this, 'BLOCKTYPE', Blockly.JavaScript.ORDER_NONE);
    var blockData = Blockly.JavaScript.valueToCode(this, 'BLOCKDATA', Blockly.JavaScript.ORDER_NONE);
    return [`item('block_id_${this.id}',${blockType},${blockData})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_block = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.itemTypeBlock()))
          .appendTitle(new blockly.FieldImageDropdown(items.blocks, 32, 32),'BLOCK');
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_block = function () {
    var block = this.getTitleValue('BLOCK');
    return [`item('block_id_${this.id}','${getName(block)}','${getData(block)}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_miscellaneous = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.itemTypeMiscellaneous()))
          .appendTitle(new blockly.FieldImageDropdown(items.miscellaneous, 32, 32),'ITEM');
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_miscellaneous = function () {
    var item = this.getTitleValue('ITEM');
    return [`item('block_id_${this.id}','${getName(item)}','${getData(item)}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_decoration = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.itemTypeDecoration()))
          .appendTitle(new blockly.FieldImageDropdown(items.decorations, 32, 32),'ITEM');
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_decoration = function () {
    var item = this.getTitleValue('ITEM');
    return [`item('block_id_${this.id}','${getName(item)}','${getData(item)}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_tool = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldLabel(i18n.itemTypeTool()))
          .appendTitle(new blockly.FieldImageDropdown(items.tools, 32, 32),'ITEM');
      this.setOutput(true, ITEM_TYPE);
    }
  };

  blockly.JavaScript.craft_tool = function () {
    var item = this.getTitleValue('ITEM');
    return [`item('block_id_${this.id}','${getName(item)}','${getData(item)}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getnameof = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendValueInput('ITEM')
          .setCheck(ITEM_TYPE)
          .appendTitle(new blockly.FieldLabel(i18n.getnameof()));
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_getnameof = function () {
      var item = Blockly.JavaScript.valueToCode(this, 'ITEM', Blockly.JavaScript.ORDER_NONE);
      return [`'${getName(item)}'`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.craft_getdataof = {
    init: function () {
      this.setHSV(124, 1.00, 0.74);
      this.appendValueInput('ITEM')
          .setCheck(ITEM_TYPE)
          .appendTitle(new blockly.FieldLabel(i18n.getdataof()));
      this.setOutput(true, Blockly.JavaScript.STRING);
    }
  };

  blockly.JavaScript.craft_getdataof = function () {
      var item = Blockly.JavaScript.valueToCode(this, 'ITEM', Blockly.JavaScript.ORDER_NONE);
      return [`'${getData(item)}'`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

};
