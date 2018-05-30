import { SVG_NS } from '../constants';
import {
  appendBlocksByCategory,
  createJsWrapperBlockCreator
} from '../block_utils';
import { getStore } from '../redux';
import { getLocation } from './locationPickerModule';
import { GAME_HEIGHT } from './constants';

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
      const label = currentInputRow
          .appendTitle(`${inputConfig.label}(0, 0)`, `${inputConfig.name}_LABEL`)
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
      blockly.BlockValueType.SPRITE,
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
