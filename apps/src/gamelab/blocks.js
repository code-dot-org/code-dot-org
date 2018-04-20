import { SVG_NS } from '../constants';
import { appendCategory, createJsWrapperBlockCreator } from '../block_utils';
import { getStore } from '../redux';
import { getLocation } from './locationPickerModule';

const SPRITE_COLOR = [184, 1.00, 0.74];
const EVENT_COLOR = [140, 1.00, 0.74];
const EVENT_LOOP_COLOR = [322, 0.90, 0.95];
const VARIABLES_COLOR = [312, 0.32, 0.62];
const WORLD_COLOR = [240, 0.45, 0.65];
const WHEN_RUN_COLOR = [39, 1.00, 0.99];
const LOCATION_COLOR = [300, 0.46, 0.89];

const customInputTypes = {
  locationPicker: {
    addInput(block, input) {
      const label = block.appendDummyInput()
          .appendTitle(`${input.label}(0, 0)`, `${input.name}_LABEL`)
          .titleRow[0];
      const icon = document.createElementNS(SVG_NS, 'tspan');
      icon.style.fontFamily = 'FontAwesome';
      icon.textContent = '\uf276';
      const button = new Blockly.FieldButton(icon, updateValue => {
          getLocation(loc => {
            if (loc) {
              button.setValue(JSON.stringify(loc));
            }
          });
        },
        block.getHexColour(),
        value => {
          if (value) {
            const loc = JSON.parse(value);
            label.setText(`${input.label}(${loc.x}, ${loc.y})`);
          }
        }
      );
      block.appendDummyInput()
          .appendTitle(button, input.name);
    },
    generateCode(block, arg) {
      return block.getTitleValue(arg.name);
    },
  },
};

export default {
  install(blockly, blockInstallOptions) {
    const SPRITE_TYPE = blockly.BlockValueType.SPRITE;
    const { ORDER_MEMBER, ORDER_ATOMIC } = Blockly.JavaScript;

    const sprites = () => {
      const animationList = getStore().getState().animationList;
      if (!animationList || animationList.orderedKeys.length === 0) {
        console.warn("No sprites available");
        return [['sprites missing', 'null']];
      }
      return animationList.orderedKeys.map(key => {
        const name = animationList.propsByKey[key].name;
        return [name, `"${name}"`];
      });
    };

    const createJsWrapperBlock = createJsWrapperBlockCreator(
      blockly,
      'gamelab',
      [SPRITE_TYPE],
      SPRITE_TYPE,
      customInputTypes,
    );

    createJsWrapperBlock({
      color: WHEN_RUN_COLOR,
      func: 'initialize',
      name: 'setup',
      blockText: 'setup',
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'makeNewSprite',
      blockText: 'make a new {ANIMATION} sprite at {X} {Y}',
      args: [
        { name: 'ANIMATION', options: sprites },
        { name: 'X', type: blockly.BlockValueType.NUMBER },
        { name: 'Y', type: blockly.BlockValueType.NUMBER },
      ],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'makeNewSpriteLocation',
      blockText: 'make a new {ANIMATION} sprite at {LOCATION}',
      args: [
        { name: 'ANIMATION', options: sprites },
        { name: 'LOCATION', type: blockly.BlockValueType.LOCATION },
      ],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'setAnimation',
      blockText: 'change {THIS} costume to {ANIMATION}',
      args: [
        { name: 'ANIMATION', options: sprites },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'setTint',
      blockText: 'change color of {THIS} to {COLOR}',
      args: [
        { name: 'COLOR', type: blockly.BlockValueType.COLOUR },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'removeTint',
      blockText: 'remove color from {THIS}',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'makeNewGroup',
      blockText: 'make a new group',
      args: [],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'add',
      blockText: 'add {SPRITE} to group {THIS}',
      args: [
        { name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveUp',
      blockText: '{THIS} move up',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveDown',
      blockText: '{THIS} move down',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveLeft',
      blockText: '{THIS} move left',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveRight',
      blockText: '{THIS} move right',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenUpArrow',
      blockText: 'when up arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenDownArrow',
      blockText: 'when down arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenLeftArrow',
      blockText: 'when left arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenRightArrow',
      blockText: 'when right arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileUpArrow',
      blockText: 'while up arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileDownArrow',
      blockText: 'while down arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileLeftArrow',
      blockText: 'while left arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileRightArrow',
      blockText: 'while right arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenTouching',
      blockText: 'when {SPRITE1} touches {SPRITE2}',
      args: [
        { name: 'SPRITE1', type: SPRITE_TYPE },
        { name: 'SPRITE2', type: SPRITE_TYPE },
      ],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileTouching',
      blockText: 'while {SPRITE1} is touching {SPRITE2}',
      args: [
        { name: 'SPRITE1', type: SPRITE_TYPE },
        { name: 'SPRITE2', type: SPRITE_TYPE },
      ],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'displace',
      blockText: '{THIS} blocks {SPRITE} from moving',
      args: [
        {name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'destroy',
      blockText: 'remove {THIS}',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: VARIABLES_COLOR,
      expression: 'arguments[0]',
      orderPrecedence: ORDER_MEMBER,
      name: 'firstTouched',
      blockText: 'first touched sprite',
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: VARIABLES_COLOR,
      expression: 'arguments[1]',
      orderPrecedence: ORDER_MEMBER,
      name: 'secondTouched',
      blockText: 'second touched sprite',
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      expression: 'length',
      orderPrecedence: ORDER_MEMBER,
      name: 'groupLength',
      blockText: 'number of sprites in {THIS}',
      methodCall: true,
      returnType: blockly.BlockValueType.NUMBER,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'setBackground',
      blockText: 'set background color {COLOR}',
      args: [
        { name: 'COLOR', type: blockly.BlockValueType.COLOUR },
      ],
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'clickedOn',
      blockText: 'when {SPRITE} clicked on',
      args: [
        { name: 'SPRITE', type: SPRITE_TYPE },
      ],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'setPosition',
      blockText: 'move {THIS} to the {POSITION} position',
      args: [
        {
          name: 'POSITION',
          options: [
            ['top left', '{x: 50, y: 50}'],
            ['top center', '{x: 200, y: 50}'],
            ['top right', '{x: 350, y: 50}'],
            ['center left', '{x: 50, y: 200}'],
            ['center', '{x: 200, y: 200}'],
            ['center right', '{x: 350, y: 200}'],
            ['bottom left', '{x: 50, y: 350}'],
            ['bottom center', '{x: 200, y: 350}'],
            ['bottom right', '{x: 350, y: 350}'],
            ['random', '"random"'],
          ],
        },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'showTitleScreen',
      blockText: 'show title screen',
      args: [
        { name: 'TITLE', label: 'title', type: blockly.BlockValueType.STRING },
        { name: 'SUBTITLE', label: 'text', type: blockly.BlockValueType.STRING }
      ],
      inline: false,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'hideTitleScreen',
      blockText: 'hide title screen',
      args: [],
    });

    createJsWrapperBlock({
      color: LOCATION_COLOR,
      simpleValue: true,
      name: 'location_picker',
      blockText: '{LOCATION}',
      args: [{
        name: 'LOCATION',
        customInput: 'locationPicker',
      }],
      returnType: Blockly.BlockValueType.LOCATION,
      orderPrecedence: ORDER_ATOMIC,
    });

    // Legacy style block definitions :(
    const generator = blockly.Generator.get('JavaScript');

    Blockly.Blocks.sprite_variables_get = {
      // Variable getter.
      init: function () {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHSV(131, 0.64, 0.62);
        this.appendDummyInput()
            .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
            .appendTitle(Blockly.disableVariableEditing ? fieldLabel
                : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      getVars: function () {
        return [this.getTitleValue('VAR')];
      },
      renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
    };
    generator.sprite_variables_get = generator.variables_get;

    Blockly.Blocks.sprite_variables_set = {
      // Variable setter.
      init: function () {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_SET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
        this.setHSV(131, 0.64, 0.62);
        this.appendValueInput('VALUE')
            .setStrictCheck(Blockly.BlockValueType.SPRITE)
            .appendTitle(Blockly.Msg.VARIABLES_SET_TITLE)
            .appendTitle(Blockly.disableVariableEditing ? fieldLabel
              : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM), 'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_SET_TAIL);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
      },
      getVars: function () {
        return [this.getTitleValue('VAR')];
      },
      renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
    };
    generator.sprite_variables_set = generator.variables_set;
  },

  installCustomBlocks(blockly, blockInstallOptions, customBlocks, level, hideCustomBlocks) {
    const SPRITE_TYPE = blockly.BlockValueType.SPRITE;
    const blockNames = customBlocks.map(createJsWrapperBlockCreator(
      blockly,
      'gamelab',
      [SPRITE_TYPE],
      SPRITE_TYPE,
      customInputTypes,
    ));

    if (!hideCustomBlocks) {
      level.toolbox = appendCategory(level.toolbox, blockNames, 'Custom');
    }
  },
};
