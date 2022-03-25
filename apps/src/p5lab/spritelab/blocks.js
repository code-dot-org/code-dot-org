/* global dashboard */
/* global appOptions */

import {SVG_NS} from '@cdo/apps/constants';
import {getStore} from '@cdo/apps/redux';
import {getLocation} from '../redux/locationPicker';
import {APP_HEIGHT, P5LabInterfaceMode} from '../constants';
import {TOOLBOX_EDIT_MODE} from '../../constants';
import {animationSourceUrl} from '../redux/animationList';
import {changeInterfaceMode} from '../actions';
import {Goal, showBackground} from '../redux/animationPicker';
import i18n from '@cdo/locale';
import spritelabMsg from '@cdo/spritelab/locale';
function animations(areBackgrounds) {
  const animationList = getStore().getState().animationList;
  if (!animationList || animationList.orderedKeys.length === 0) {
    console.warn('No sprites available');
    return [['sprites missing', 'null']];
  }
  let results = animationList.orderedKeys
    .filter(key => {
      const animation = animationList.propsByKey[key];
      const isBackground = (animation.categories || []).includes('backgrounds');
      return areBackgrounds ? isBackground : !isBackground;
    })
    .map(key => {
      const animation = animationList.propsByKey[key];
      if (animation.sourceUrl) {
        return [animation.sourceUrl, `"${animation.name}"`];
      } else {
        const url = animationSourceUrl(
          key,
          animation,
          getStore().getState().pageConstants.channelId
        );
        return [url, `"${animation.name}"`];
      }
    });
  // In case either all backgrounds or all costumes are missing and we request them, this allows the "create
  // new sprite" and "set background as" blocks to continue working without crashing.
  // When they are used without sprites being set, the image dropdown for those blocks will be empty except
  // for the "More" button. The user will have to add sprites/backgrounds to this dropdown one by one using the "More" button.
  if (results.length === 0) {
    return [['sprites missing', 'null']];
  }
  return results;
}
function sprites() {
  return animations(false);
}
function backgroundList() {
  return animations(true);
}

// This color palette is limited to colors which have different hues, therefore
// it should not contain different shades of the same color such as
// ['#ff0000', '#cc0000', '#880000'].
const limitedColours = [
  // fully-saturated primary colors
  '#ff0000', // RED
  '#00ff00', // GREEN
  '#0000ff', // BLUE

  // fully-saturated secondary colors
  '#ffff00', // YELLOW
  '#00ffff', // CYAN
  '#ff00ff', // MAGENTA

  // some "tertiary" colors
  '#ff8800', // ORANGE
  '#8800ff', // PURPLE
  '#00ff88' // LIME
];

const customInputTypes = {
  locationPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      currentInputRow.appendField(
        `${inputConfig.label}(0, 0)`,
        `${inputConfig.name}_LABEL`
      );
      const fieldRow = currentInputRow.getFieldRow();
      const label = fieldRow[fieldRow.length - 1];
      const icon = document.createElementNS(SVG_NS, 'tspan');
      icon.style.fontFamily = 'FontAwesome';
      icon.textContent = '\uf276';
      const button = new Blockly.FieldButton(
        icon,
        updateValue => {
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
              label.setValue(
                `${inputConfig.label}(${loc.x}, ${APP_HEIGHT - loc.y})`
              );
            } catch (e) {
              // Just ignore bad values
            }
          }
        }
      );
      currentInputRow.appendField(button, inputConfig.name);
    },
    generateCode(block, arg) {
      return `(${block.getTitleValue(arg.name)})`;
    }
  },
  locationVariableDropdown: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      block.getVars = function() {
        return {
          [Blockly.BlockValueType.LOCATION]: [
            block.getTitleValue(inputConfig.name)
          ]
        };
      };
      block.renameVar = function(oldName, newName) {
        if (
          Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))
        ) {
          block.setTitleValue(newName, inputConfig.name);
        }
      };
      block.removeVar = function(oldName) {
        if (
          Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))
        ) {
          block.dispose(true, true);
        }
      };

      currentInputRow
        .appendField(inputConfig.label)
        .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendField(
          new Blockly.FieldVariable(
            Blockly.Msg.VARIABLES_SET_ITEM,
            null,
            null,
            Blockly.BlockValueType.LOCATION,
            null
          ),
          inputConfig.name
        )
        .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
    },
    generateCode(block, arg) {
      return Blockly.JavaScript.translateVarName(block.getTitleValue(arg.name));
    }
  },
  soundPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      var onSelect = function(soundValue) {
        block.setTitleValue(soundValue, inputConfig.name);
      };
      currentInputRow.appendField(inputConfig.label).appendField(
        new Blockly.FieldDropdown([['Choose', 'Choose']], () => {
          dashboard.assets.showAssetManager(onSelect, 'audio', null, {
            libraryOnly: true
          });
        }),
        inputConfig.name
      );
    },
    generateCode(block, arg) {
      return `'${block.getTitleValue(arg.name)}'`;
    }
  },
  costumePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      let buttons;
      if (
        getStore().getState().pageConstants &&
        getStore().getState().pageConstants.showAnimationMode
      ) {
        buttons = [
          {
            text: i18n.costumeMode(),
            action: () => {
              getStore().dispatch(
                changeInterfaceMode(P5LabInterfaceMode.ANIMATION)
              );
            }
          }
        ];
      }
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldImageDropdown(sprites, 32, 32, buttons),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return block.getTitleValue(arg.name);
    }
  },
  backgroundPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      let buttons;
      if (
        getStore().getState().pageConstants &&
        getStore().getState().pageConstants.showAnimationMode
      ) {
        buttons = [
          {
            text: i18n.more(),
            action: () => {
              getStore().dispatch(showBackground(Goal.NEW_ANIMATION));
            }
          }
        ];
      }
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldImageDropdown(backgroundList, 40, 40, buttons),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return block.getTitleValue(arg.name);
    }
  },
  spritePointer: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      if (Object.keys(spritelabMsg).length === 0) {
        // spritelab i18n is not available on Levelbuilder
        block.shortString = ' ';
        block.longString = ' ';
      } else {
        switch (block.type) {
          case 'gamelab_clickedSpritePointer':
            block.shortString = spritelabMsg.clicked();
            block.longString = spritelabMsg.clickedSprite();
            break;
          case 'gamelab_newSpritePointer':
            block.shortString = spritelabMsg.new();
            block.longString = spritelabMsg.newSprite();
            break;
          case 'gamelab_subjectSpritePointer':
            block.shortString = spritelabMsg.subject();
            block.longString = spritelabMsg.subjectSprite();
            break;
          case 'gamelab_objectSpritePointer':
            block.shortString = spritelabMsg.object();
            block.longString = spritelabMsg.objectSprite();
            break;
          default:
            // unsupported block for spritePointer, leave the block text blank
            block.shortString = '';
            block.longString = '';
        }
      }
      block.thumbnailSize = 32;
      currentInputRow
        .appendField(block.longString)
        .appendField(
          new Blockly.FieldImage('', 1, block.thumbnailSize),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      switch (block.type) {
        case 'gamelab_clickedSpritePointer':
          return '{id: extraArgs.clickedSprite}';
        case 'gamelab_newSpritePointer':
          return '{id: extraArgs.newSprite}';
        case 'gamelab_subjectSpritePointer':
          return '{id: extraArgs.subjectSprite}';
        case 'gamelab_objectSpritePointer':
          return '{id: extraArgs.objectSprite}';
        default:
          // unsupported block for spritePointer, returning undefined here
          // will match the behavior of an empty socket.
          return undefined;
      }
    }
  },
  spritePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      block.getVars = function() {
        return {
          [Blockly.BlockValueType.SPRITE]: [
            block.getTitleValue(inputConfig.name)
          ]
        };
      };
      block.renameVar = function(oldName, newName) {
        if (
          Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))
        ) {
          block.setTitleValue(newName, inputConfig.name);
        }
      };
      block.removeVar = function(oldName) {
        if (
          Blockly.Names.equals(oldName, block.getTitleValue(inputConfig.name))
        ) {
          block.dispose(true, true);
        }
      };
      block.superSetTitleValue = block.setTitleValue;
      block.setTitleValue = function(newValue, name) {
        if (name === inputConfig.name && block.blockSpace.isFlyout) {
          newValue = Blockly.Variables.generateUniqueName(newValue);
        }
        block.superSetTitleValue(newValue, name);
      };

      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldVariable(
            null,
            null,
            null,
            Blockly.BlockValueType.SPRITE,
            i18n.sprite()
          ),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return `{name: '${Blockly.JavaScript.translateVarName(
        block.getTitleValue(arg.name)
      )}'}`;
    }
  },
  limitedColourPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const options = {
        colours: limitedColours,
        columns: 3
      };
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldColour('#ff0000', undefined, options),
          'VAL'
        );
    },
    generateCode(block, arg) {
      return `'${block.getTitleValue(arg.name)}'`;
    }
  },
  // Custom input for a variable input that generates the name of the variable
  // rather than the value of the variable.
  variableNamePicker: {
    addInputRow(blockly, block, inputConfig) {
      return block.appendValueInput(inputConfig.name);
    },

    generateCode(block, arg) {
      const input = block.getInput(arg.name);
      if (input) {
        const targetBlock = input.connection.targetBlock();
        if (targetBlock && targetBlock.type === 'variables_get') {
          return `'${Blockly.JavaScript.blockToCode(targetBlock)[0]}'`;
        }
      }
      return '';
    }
  }
};

export default {
  sprites,
  customInputTypes,
  install(blockly, blockInstallOptions) {
    // Legacy style block definitions :(
    const generator = blockly.getGenerator();

    const behaviorEditor = (Blockly.behaviorEditor = new Blockly.FunctionEditor(
      {
        FUNCTION_HEADER: i18n.behaviorEditorHeader(),
        FUNCTION_NAME_LABEL: i18n.behaviorEditorLabel(),
        FUNCTION_DESCRIPTION_LABEL: i18n.behaviorEditorDescription()
      },
      'behavior_definition',
      {
        [Blockly.BlockValueType.SPRITE]: 'sprite_parameter_get'
      },
      false /* disableParamEditing */,
      [
        Blockly.BlockValueType.NUMBER,
        Blockly.BlockValueType.STRING,
        Blockly.BlockValueType.COLOUR,
        Blockly.BlockValueType.BOOLEAN,
        Blockly.BlockValueType.SPRITE,
        Blockly.BlockValueType.LOCATION
      ]
    ));

    Blockly.Blocks.sprite_variables_get = {
      // Variable getter.
      init: function() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.appendDummyInput()
          .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
          .appendField(
            Blockly.disableVariableEditing
              ? fieldLabel
              : new Blockly.FieldVariable(
                  Blockly.Msg.VARIABLES_SET_ITEM,
                  null,
                  null,
                  Blockly.BlockValueType.SPRITE,
                  i18n.sprite()
                ),
            'VAR'
          )
          .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      getVars: function() {
        return Blockly.Variables.getVars.bind(this)(
          Blockly.BlockValueType.SPRITE
        );
      },
      renameVar: function(oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar
    };
    generator.sprite_variables_get = function() {
      return [
        `{name: '${Blockly.JavaScript.translateVarName(
          this.getTitleValue('VAR')
        )}'}`,
        Blockly.JavaScript.ORDER_ATOMIC
      ];
    };
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.SPRITE,
      'sprite_variables_get'
    );

    Blockly.Blocks.sprite_parameter_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.appendDummyInput()
          .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
          .appendField(fieldLabel, 'VAR')
          .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      renameVar(oldName, newName) {
        if (behaviorEditor.isOpen()) {
          behaviorEditor.renameParameter(oldName, newName);
          behaviorEditor.refreshParamsEverywhere();
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar
    };
    generator.sprite_parameter_get = generator.variables_get;

    Blockly.Blocks.gamelab_behavior_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        Blockly.cdoUtils.setHSV(this, 136, 0.84, 0.8);
        const mainTitle = this.appendDummyInput()
          .appendField(fieldLabel, 'VAR')
          .appendField(Blockly.Msg.VARIABLES_GET_TAIL);

        let allowBehaviorEditing = Blockly.useModalFunctionEditor;

        // If there is a toolbox with no categories and the level allows editing
        // blocks, disallow editing the behavior, because renaming the behavior
        // can break things.
        if (
          window.appOptions && // global appOptions is not available on level edit page
          appOptions.level.toolbox &&
          !appOptions.readonlyWorkspace &&
          !Blockly.hasCategories
        ) {
          allowBehaviorEditing = false;
        }

        if (allowBehaviorEditing) {
          var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
          Blockly.bindEvent_(
            editLabel.fieldGroup_,
            'mousedown',
            this,
            this.openEditor
          );
          mainTitle.appendField(editLabel);
        }

        this.setStrictOutput(true, Blockly.BlockValueType.BEHAVIOR);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        this.currentParameterNames_ = [];
      },

      openEditor(e) {
        e.stopPropagation();
        behaviorEditor.openEditorForFunction(this, this.getTitle_('VAR').id);
      },

      getVars() {
        return {};
      },

      renameVar(oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },

      renameProcedure(oldName, newName, userCreated) {
        if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
          if (userCreated) {
            this.getTitle_('VAR').id = newName;
          }
        }
      },

      getCallName() {
        return this.getTitleValue('VAR');
      },

      setProcedureParameters(paramNames, paramIds, typeNames) {
        Blockly.Blocks.procedures_callnoreturn.setProcedureParameters.call(
          this,
          paramNames.slice(1),
          paramIds && paramIds.slice(1),
          typeNames && typeNames.slice(1)
        );
      },

      mutationToDom() {
        const container = document.createElement('mutation');
        for (let x = 0; x < this.currentParameterNames_.length; x++) {
          const parameter = document.createElement('arg');
          parameter.setAttribute('name', this.currentParameterNames_[x]);
          if (this.currentParameterTypes_[x]) {
            parameter.setAttribute('type', this.currentParameterTypes_[x]);
          }
          container.appendChild(parameter);
        }
        return container;
      },

      domToMutation(xmlElement) {
        this.currentParameterNames_ = [];
        this.currentParameterTypes_ = [];
        for (let childNode of xmlElement.childNodes) {
          if (childNode.nodeName.toLowerCase() === 'arg') {
            this.currentParameterNames_.push(childNode.getAttribute('name'));
            this.currentParameterTypes_.push(childNode.getAttribute('type'));
          }
        }
        // Use parameter names as dummy IDs during initialization. Add dummy
        // "this_sprite" param.
        this.setProcedureParameters(
          [null].concat(this.currentParameterNames_),
          [null].concat(this.currentParameterNames_),
          [null].concat(this.currentParameterTypes_)
        );
      }
    };

    generator.gamelab_behavior_get = function() {
      const name = Blockly.JavaScript.variableDB_.getName(
        this.getTitle_('VAR').id,
        Blockly.Procedures.NAME_TYPE
      );
      const extraArgs = [];
      for (let x = 0; x < this.currentParameterNames_.length; x++) {
        extraArgs[x] =
          Blockly.JavaScript.valueToCode(
            this,
            'ARG' + x,
            Blockly.JavaScript.ORDER_COMMA
          ) || 'null';
      }
      return [
        `new Behavior(${name}, [${extraArgs.join(', ')}])`,
        Blockly.JavaScript.ORDER_ATOMIC
      ];
    };

    Blockly.Blocks.behavior_definition = Blockly.Block.createProcedureDefinitionBlock(
      {
        initPostScript(block) {
          block.setHSV(136, 0.84, 0.8);
          block.parameterNames_ = [i18n.thisSprite()];
          block.parameterTypes_ = [Blockly.BlockValueType.SPRITE];
          block.setUserVisible(false);
        },
        overrides: {
          getVars(category) {
            return {};
          },
          callType_: 'gamelab_behavior_get'
        }
      }
    );

    generator.behavior_definition = generator.procedures_defnoreturn;

    Blockly.Procedures.DEFINITION_BLOCK_TYPES.push('behavior_definition');
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.BEHAVIOR,
      'gamelab_behavior_get'
    );

    // NOTE: On the page where behaviors are created (the functions/#/edit page)
    // blockInstallOptions is undefined.
    if (
      !blockInstallOptions ||
      !blockInstallOptions.level ||
      blockInstallOptions.level.editBlocks !== TOOLBOX_EDIT_MODE
    ) {
      Blockly.Flyout.configure(Blockly.BlockValueType.BEHAVIOR, {
        initialize(flyout, cursor) {
          if (behaviorEditor && !behaviorEditor.isOpen()) {
            flyout.addButtonToFlyout_(
              cursor,
              i18n.createBlocklyBehavior(),
              behaviorEditor.openWithNewFunction.bind(behaviorEditor)
            );
          }
        },
        addDefaultVar: false
      });
    }
  }
};
