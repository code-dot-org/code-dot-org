import { SVG_NS } from '../constants';
import {
  appendBlocksByCategory,
  createJsWrapperBlockCreator
} from '../block_utils';
import { getStore } from '../redux';
import { getLocation } from './locationPickerModule';
import { GAME_HEIGHT } from './constants';

const SPRITE_COLOR = [184, 1.00, 0.74];
const EVENT_COLOR = [140, 1.00, 0.74];
const EVENT_LOOP_COLOR = [322, 0.90, 0.95];
const VARIABLES_COLOR = [312, 0.32, 0.62];
const WORLD_COLOR = [240, 0.45, 0.65];
const WHEN_RUN_COLOR = [39, 1.00, 0.99];
const LOCATION_COLOR = [300, 0.46, 0.89];

let sprites = () => {
  const animationList = getStore().getState().animationList;
  if (!animationList || animationList.orderedKeys.length === 0) {
    console.warn("No sprites available");
    return [['sprites missing', 'null']];
  }
  return animationList.orderedKeys.map(key => {
    const animation = animationList.propsByKey[key];
    return [animation.sourceUrl, `"${animation.name}"`];
  });
};

const customInputTypes = {
  locationPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      currentInputRow.appendTitle(
        `${inputConfig.label}(0, 0)`, `${inputConfig.name}_LABEL`);
      const label =
        currentInputRow.titleRow[currentInputRow.titleRow.length - 1];
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
            try {
              const loc = JSON.parse(value);
              label.setText(`${inputConfig.label}(${loc.x}, ${GAME_HEIGHT - loc.y})`);
            } catch (e) {
              // Just ignore bad values
            }
          }
        }
      );
      currentInputRow.appendTitle(button, inputConfig.name);
    },
    generateCode(block, arg) {
      return block.getTitleValue(arg.name);
    },
  },
  costumePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      currentInputRow
        .appendTitle(inputConfig.label)
        .appendTitle(new Blockly.FieldImageDropdown(sprites(), 32, 32), inputConfig.name);
    },
    generateCode(block, arg) {
      return block.getTitleValue(arg.name);
    },
  },
  spritePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      block.getVars = function () {
        return {
          [Blockly.BlockValueType.SPRITE]: [block.getTitleValue(inputConfig.name)],
        };
      };
      block.renameVar = function (oldName, newName) {
        if (Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))) {
          block.setTitleValue(newName, inputConfig.name);
        }
      };
      block.removeVar = function (oldName) {
        if (Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))) {
          block.dispose(true, true);
        }
      };

      currentInputRow
        .appendTitle(inputConfig.label)
        .appendTitle(new Blockly.FieldVariable(null, null, null, Blockly.BlockValueType.SPRITE), inputConfig.name);
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

    const createJsWrapperBlock = createJsWrapperBlockCreator(
      blockly,
      'gamelab',
      [
        // Strict Types
        blockly.BlockValueType.SPRITE,
        blockly.BlockValueType.BEHAVIOR,
        blockly.BlockValueType.LOCATION,
      ],
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
        { name: 'ANIMATION', customInput: 'costumePicker' },
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
        { name: 'ANIMATION', customInput: 'costumePicker' },
        { name: 'LOCATION', type: blockly.BlockValueType.LOCATION },
      ],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'setAnimation',
      blockText: 'change {THIS} costume to {ANIMATION}',
      args: [
        { name: 'ANIMATION', customInput: 'costumePicker' },
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
      blockText: 'when up arrow pressed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenDownArrow',
      blockText: 'when down arrow pressed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenLeftArrow',
      blockText: 'when left arrow pressed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenRightArrow',
      blockText: 'when right arrow pressed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileUpArrow',
      blockText: 'while up arrow pressed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileDownArrow',
      blockText: 'while down arrow pressed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileLeftArrow',
      blockText: 'while left arrow pressed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileRightArrow',
      blockText: 'while right arrow pressed',
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
      blockText: 'show title screen {BREAK} title {TITLE} text {SUBTITLE}',
      args: [
        { name: 'BREAK', empty: true },
        { name: 'TITLE', type: blockly.BlockValueType.STRING },
        { name: 'SUBTITLE', type: blockly.BlockValueType.STRING }
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

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenPressedAndReleased',
      eventLoopBlock: true,
      inline: false,
      blockText: "when {DIR} pressed {STATEMENT1}when released {STATEMENT2}",
      args: [
        {
          name: "DIR",
          options: [
            ["up", "'up'"],
            ["down", "'down'"],
            ["left", "'left'"],
            ["right", "'right'"]
          ]
        },
        {
          name: "STATEMENT1",
          statement: true
        },
        {
          name: "STATEMENT2",
          statement: true
        }
      ],
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenStartAndStopTouching',
      eventLoopBlock: true,
      inline: false,
      blockText: "when {SPRITE1} starts touching {SPRITE2} {STATEMENT1}when they stop touching {STATEMENT2}",
      args: [
        {
          name: "SPRITE1",
          type: "Sprite"
        },
        {
          name: "SPRITE2",
          type: "Sprite"
        },
        {
          name: "STATEMENT1",
          statement: true
        },
        {
          name: "STATEMENT2",
          statement: true
        }
      ],
    });

    // Legacy style block definitions :(
    const generator = blockly.Generator.get('JavaScript');

    const behaviorEditor = new Blockly.FunctionEditor(
      {
        FUNCTION_HEADER: 'Behavior',
        FUNCTION_NAME_LABEL: 'Name your behavior:',
        FUNCTION_DESCRIPTION_LABEL: 'What is your behavior supposed to do?',
      },
      'behavior_definition',
      {
        [Blockly.BlockValueType.SPRITE]: 'sprite_parameter_get',
      },
      true /* disableParamEditing */,
    );

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
                : new Blockly.FieldVariable(
                    Blockly.Msg.VARIABLES_SET_ITEM,
                    null,
                    null,
                    Blockly.BlockValueType.SPRITE,
                  ),
                'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      getVars: function () {
        return Blockly.Variables.getVars.bind(this)(Blockly.BlockValueType.SPRITE);
      },
      renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar,
    };
    generator.sprite_variables_get = generator.variables_get;
    Blockly.Variables.registerGetter(Blockly.BlockValueType.SPRITE,
      'sprite_variables_get');

    Blockly.Blocks.sprite_parameter_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHSV(7, 0.80, 0.95);
        this.appendDummyInput()
            .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
            .appendTitle(fieldLabel , 'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      renameVar(oldName, newName) {
        if (behaviorEditor.isOpen()) {
          behaviorEditor.renameParameter(oldName, newName);
          behaviorEditor.refreshParamsEverywhere();
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar,
    };
    generator.sprite_parameter_get = generator.variables_get;

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
              : new Blockly.FieldVariable(
                  Blockly.Msg.VARIABLES_SET_ITEM,
                  null,
                  null,
                  Blockly.BlockValueType.SPRITE,
                ),
              'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_SET_TAIL);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
      },
      getVars: Blockly.Blocks.sprite_variables_get.getVars,
      renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
    };
    generator.sprite_variables_set = generator.variables_set;
    Blockly.Variables.registerSetter(Blockly.BlockValueType.SPRITE,
      'sprite_variables_set');

    Blockly.Blocks.gamelab_behavior_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setHSV(136, 0.84, 0.80);
        const mainTitle = this.appendDummyInput()
            .appendTitle(fieldLabel, 'VAR')
            .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);

        if (Blockly.useModalFunctionEditor) {
          var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
          Blockly.bindEvent_(editLabel.fieldGroup_, 'mousedown', this, this.openEditor);
          mainTitle.appendTitle(editLabel);
        }

        this.setStrictOutput(true, Blockly.BlockValueType.BEHAVIOR);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },

      openEditor(e) {
        e.stopPropagation();
        behaviorEditor.openEditorForFunction(this, this.getTitleValue('VAR'));
      },

      getVars() {
        return Blockly.Variables.getVars.bind(this)(Blockly.BlockValueType.BEHAVIOR);
      },

      renameVar(oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },

      renameProcedure(oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
    };

    generator.gamelab_behavior_get = function () {
      return [
        Blockly.JavaScript.variableDB_.getName(
            this.getTitleValue('VAR'),
            Blockly.Procedures.NAME_TYPE),
        Blockly.JavaScript.ORDER_ATOMIC
      ];
    };

    Blockly.Blocks.behavior_definition = Blockly.Block.createProcedureDefinitionBlock({
      initPostScript(block) {
        block.setHSV(136, 0.84, 0.80);
        block.parameterNames_ = ['this sprite'];
        block.parameterTypes_ = [Blockly.BlockValueType.SPRITE];
      },
      overrides: {
        getVars(category) {
          return {
            Behavior: [this.getTitleValue('NAME')],
          };
        },
        callType_: 'gamelab_behavior_get',
      }
    });

    generator.behavior_definition = generator.procedures_defnoreturn;

    Blockly.Procedures.DEFINITION_BLOCK_TYPES.push('behavior_definition');
    Blockly.Variables.registerGetter(Blockly.BlockValueType.BEHAVIOR,
      'gamelab_behavior_get');
    Blockly.Flyout.configure(Blockly.BlockValueType.BEHAVIOR, {
      initialize(flyout, cursor) {
        if (behaviorEditor && !behaviorEditor.isOpen()) {
          flyout.addButtonToFlyout_(cursor, 'Create a Behavior',
            behaviorEditor.openWithNewFunction.bind(behaviorEditor));
        }
      },
      addDefaultVar: false,
    });
  },

  installCustomBlocks(blockly, blockInstallOptions, customBlocks, level, hideCustomBlocks) {
    const createJsWrapperBlock = createJsWrapperBlockCreator(
      blockly,
      'gamelab',
      [
        // Strict Types
        blockly.BlockValueType.SPRITE,
        blockly.BlockValueType.BEHAVIOR,
        blockly.BlockValueType.LOCATION,
      ],
      blockly.BlockValueType.SPRITE_TYPE,
      customInputTypes,
    );

    const blocksByCategory = {};
    customBlocks.forEach(({name, category, config}) => {
      const blockName = createJsWrapperBlock(config);
      if (!blocksByCategory[category]) {
        blocksByCategory[category] = [];
      }
      blocksByCategory[category].push(blockName);
      if (name && blockName !== name) {
        console.error(`Block config ${name} generated a block named ${blockName}`);
      }
    });

    if (!hideCustomBlocks) {
      level.toolbox = appendBlocksByCategory(level.toolbox, blocksByCategory);
    }

    return blocksByCategory;
  },
};
