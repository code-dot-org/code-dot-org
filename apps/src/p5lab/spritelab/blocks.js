import {Order} from 'blockly/javascript';

import FunctionEditor from '@cdo/apps/blockly/addons/functionEditor';
import {BLOCK_TYPES, NO_OPTIONS_MESSAGE} from '@cdo/apps/blockly/constants';
import {blocks as behaviorBlocks} from '@cdo/apps/blockly/customBlocks/googleBlockly/behaviorBlocks';
import {
  editButtonHandler,
  toolboxConfigurationSupportsEditButton,
} from '@cdo/apps/blockly/customBlocks/googleBlockly/proceduresBlocks';
import {parseSoundPathString} from '@cdo/apps/blockly/utils';
import {SVG_NS} from '@cdo/apps/constants';
import {spriteLabPointers} from '@cdo/apps/p5lab/spritelab/blockly/constants';
import {getStore} from '@cdo/apps/redux';
import {getAlphanumericId} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import spritelabMsg from '@cdo/spritelab/locale';

import {TOOLBOX_EDIT_MODE} from '../../constants';
import {changeInterfaceMode} from '../actions';
import {P5LabInterfaceMode} from '../constants';
import {animationSourceUrl} from '../redux/animationList';
import {getLocation} from '../redux/locationPicker';

function animations(includeBackgrounds) {
  const animationList = getStore().getState().animationList;
  if (!animationList || animationList.orderedKeys.length === 0) {
    console.warn('No sprites available');
    return [['sprites missing', 'null']];
  }
  let results = animationList.orderedKeys
    .filter(key => {
      const animation = animationList.propsByKey[key];
      const animationIsBackground = (animation.categories || []).includes(
        'backgrounds'
      );
      return includeBackgrounds
        ? animationIsBackground
        : !animationIsBackground;
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
  // In case either all backgrounds or all costumes are missing and we request them, this allows blocks
  // with backgroundPicker or costumePicker custom input types to continue working without crashing.
  // When they are used without animations, the image dropdown for those blocks will be empty except
  // for the "Costumes" or "Backgrounds" button
  if (results.length === 0) {
    return [['sprites missing', 'null']];
  }
  return results;
}
function costumeList() {
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
  '#00ff88', // LIME
];

const customInputTypes = {
  locationPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      currentInputRow.appendField(
        `${inputConfig.label}`,
        `${inputConfig.name}_LABEL`
      );
      const icon = document.createElementNS(SVG_NS, 'tspan');
      icon.style.fontFamily = 'FontAwesome';
      icon.textContent = ' \uf276'; // map-pin
      const onChange = () => {
        getLocation(loc => {
          if (loc) {
            fieldButton.setValue(JSON.stringify(loc));
          }
        });
      };
      const fieldButton = Blockly.cdoUtils.locationField(
        icon,
        onChange,
        block,
        inputConfig,
        currentInputRow
      );
      currentInputRow.appendField(fieldButton, inputConfig.name);
    },
    generateCode(block, arg) {
      return `(${block.getFieldValue(arg.name)})`;
    },
  },
  soundPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const icon = document.createElementNS(SVG_NS, 'tspan');
      icon.style.fontFamily = 'FontAwesome';
      icon.textContent = ' \uf08e '; // arrow-up-right-from-square
      const onSelect = function (soundValue) {
        block.setTitleValue(soundValue, inputConfig.name);
      };
      const onClick = () => {
        dashboard.assets.showAssetManager(onSelect, 'audio', null, {
          libraryOnly: true,
        });
      };
      const transformText = soundPath => {
        return parseSoundPathString(soundPath);
      };
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          Blockly.cdoUtils.soundField(onClick, transformText, icon),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return JSON.stringify(block.getFieldValue(arg.name));
    },
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
            },
          },
        ];
      }
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldAnimationDropdown(costumeList, 32, 32, buttons),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return block.getFieldValue(arg.name);
    },
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
            text: i18n.backgroundMode(),
            action: () => {
              getStore().dispatch(
                changeInterfaceMode(P5LabInterfaceMode.BACKGROUND)
              );
            },
          },
        ];
      }
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldAnimationDropdown(backgroundList, 40, 40, buttons),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      return block.getFieldValue(arg.name);
    },
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
      // Try to get the image url for this block. If we find one,
      // initialize the field with the image and short string.
      // Otherwise, initialize the field with the long string and a 1 pixel
      // wide empty image.
      const imageUrl = Blockly.getPointerBlockImageUrl(
        block,
        spriteLabPointers
      );
      // We set the width to 1 so we don't show a blank space when there is no
      // image (we can't set a width of 0). We keep the height the same no matter what
      // because blockly doesn't seem to support us changing the height after initialization.
      const width = imageUrl.length > 0 ? block.thumbnailSize : 1;
      const label = imageUrl.length > 0 ? block.shortString : block.longString;
      currentInputRow
        .appendField(label)
        .appendField(
          new Blockly.FieldImage(imageUrl, width, block.thumbnailSize),
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
    },
  },
  spritePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      block.getVars = function () {
        return [block.getFieldValue(inputConfig.name)];
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
        block.getFieldValue(arg.name)
      )}'}`;
    },
  },
  behaviorPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const noBehaviorLabel = i18n.behaviorsNotFound();
      const noBehaviorOption = [noBehaviorLabel, NO_OPTIONS_MESSAGE];
      // Behavior definition blocks are always moved to the hidden workspace.
      const definitionWorkspace = Blockly.getHiddenDefinitionWorkspace();
      if (!definitionWorkspace) {
        return [noBehaviorOption];
      }
      const behaviorBlocks = definitionWorkspace
        .getTopBlocks()
        .filter(block => block.type === BLOCK_TYPES.behaviorDefinition);
      // Menu options are an array, each option containing a human-readable part,
      // and a language-neutral string. Both are the same in this case.
      const behaviorOptions = behaviorBlocks.map(block => [
        block.getProcedureModel().getName(),
        block.behaviorId,
      ]);
      behaviorOptions.sort();
      // Add a "No behaviors found" option, if needed
      if (behaviorOptions.length === 0) {
        behaviorOptions.push(noBehaviorOption);
      }
      const dropdownField = new Blockly.FieldBehaviorPicker(behaviorOptions);
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(dropdownField, inputConfig.name);
      const behaviorsFound =
        dropdownField.getOptions().length > 1 ||
        dropdownField.getOptions()[0][1] !== NO_OPTIONS_MESSAGE;

      // Behavior editing is only permitted using the modal function editor.
      if (
        behaviorsFound &&
        Blockly.useModalFunctionEditor &&
        // TODO: Support editing behaviors from within a modal editor workspace.
        block.workspace.id === Blockly.getMainWorkspace().id &&
        toolboxConfigurationSupportsEditButton(block)
      ) {
        const editButton = new Blockly.FieldButton({
          value: i18n.edit(),
          onClick: editButtonHandler,
          colorOverrides: {button: 'blue', text: 'white'},
          allowReadOnlyClick: true, // We support showing the editor even if viewing in read only mode.
        });
        block.inputList[block.inputList.length - 1].appendField(
          editButton,
          'EDIT'
        );
        // getProcedureModel is defined on procedure blocks as part of
        // @blockly/block-shareable-procedures
        // For this block, we will get the procedure based on selected
        // dropdown field option.
        block.getProcedureModel = function () {
          const fieldValue = block.getFieldValue(inputConfig.name);
          const procedureMap = block.workspace.getProcedureMap();
          let procedure = undefined;
          for (const value of procedureMap.values()) {
            if (value.getName() === fieldValue) {
              procedure = value;
              break;
            }
          }
          // We should always find the procedure in the map.
          return procedure;
        };
      }
    },
    generateCode(block, arg) {
      const fieldValue = block.getFieldValue(arg.name);
      const invalidBehavior = fieldValue === NO_OPTIONS_MESSAGE;
      const behaviorId = Blockly.JavaScript.getName(fieldValue, 'PROCEDURE');
      if (invalidBehavior) {
        console.warn('No behaviors available');
        return undefined;
      } else {
        return `new Behavior(${behaviorId}, [])`;
      }
    },
    openEditor(e) {
      e.stopPropagation();
      if (this.getFieldValue('BEHAVIOR') === NO_OPTIONS_MESSAGE) {
        Blockly.behaviorEditor.openWithNewFunction();
      } else {
        Blockly.behaviorEditor.openEditorForFunction(
          this,
          this.getFieldValue('BEHAVIOR')
        );
      }
    },
  },
  limitedColourPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const options = {
        colours: limitedColours,
        columns: 3,
      };
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldColour('#ff0000', undefined, options),
          'VAL'
        );
    },
    generateCode(block, arg) {
      return `'${block.getFieldValue(arg.name)}'`;
    },
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
    },
  },
  // Custom input for a variable field that generates the name of the variable
  // rather than the value of the variable.
  variableFieldNamePicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(new Blockly.FieldVariable(), inputConfig.name);
    },

    generateCode(block, arg) {
      const id = block.getFieldValue(arg.name);
      const label = Blockly.getMainWorkspace()
        .getVariableMap()
        .getVariableById(id).name;
      const name = Blockly.JavaScript.getVariableName(id);
      return [`"${label}"`, `"${name}"`];
    },
  },

  bitmap: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const config = {
        height: 8,
        width: 8,
        fieldHeight: 42,
        buttons: {randomize: false},
      };
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new Blockly.FieldBitmap(null, null, config),
          inputConfig.name
        );
    },
    generateCode(block, arg) {
      // Convert 2d array into a string.
      return JSON.stringify(block.getFieldValue(arg.name));
    },
  },
};

export default {
  costumeList,
  customInputTypes,
  install(blockly, blockInstallOptions) {
    Blockly.cdoUtils.registerCustomProcedureBlocks();
    // Legacy style block definitions :(
    const generator = blockly.getGenerator();

    const behaviorEditor = (Blockly.behaviorEditor = new FunctionEditor(
      {
        FUNCTION_HEADER: i18n.behaviorEditorHeader(),
        FUNCTION_NAME_LABEL: i18n.behaviorEditorLabel(),
        FUNCTION_DESCRIPTION_LABEL: i18n.behaviorEditorDescription(),
      },
      'behavior_definition',
      {
        [Blockly.BlockValueType.SPRITE]: 'sprite_parameter_get',
      },
      false /* disableParamEditing */,
      [
        Blockly.BlockValueType.NUMBER,
        Blockly.BlockValueType.STRING,
        Blockly.BlockValueType.COLOUR,
        Blockly.BlockValueType.BOOLEAN,
        Blockly.BlockValueType.SPRITE,
        Blockly.BlockValueType.LOCATION,
      ]
    ));

    Blockly.common.defineBlocks(behaviorBlocks);

    generator.forBlock.behavior_definition = function (_block, generator) {
      const block = _block;
      if (!generator.nameDB_) {
        return null;
      }
      // If we don't have a behavior id, generate a random id.
      // This ensures the hidden definition block will generate valid code.
      if (!block.behaviorId) {
        block.behaviorId = getAlphanumericId();
      }
      // Define a procedure with a return value.
      const funcName = generator.nameDB_.getName(
        block.behaviorId,
        Blockly.Names.NameType.PROCEDURE
      );

      // Holds the additional code that is prefixed (injected before every statement) and/or
      // suffixed (injected after every statement) to the main block of code
      let xfix1 = '';
      if (generator.STATEMENT_PREFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_PREFIX, block);
      }
      if (generator.STATEMENT_SUFFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_SUFFIX, block);
      }
      if (xfix1) {
        xfix1 = generator.prefixLines(xfix1, generator.INDENT);
      }
      let loopTrap = '';
      if (generator.INFINITE_LOOP_TRAP) {
        loopTrap = generator.prefixLines(
          generator.injectId(generator.INFINITE_LOOP_TRAP, block),
          generator.INDENT
        );
      }

      // Translate all the inner blocks within the current block into code
      const branch = generator.statementToCode(block, 'STACK');
      // Sprite Lab behavior blocks do not have return inputs, but this check is included
      // in case we'd like to support that in the future.
      let returnValue =
        (block.getInput('RETURN') &&
          generator.valueToCode(block, 'RETURN', Order.NONE)) ||
        '';

      // Contains the same code as xfix1 if both are present, but applied before the return statement
      let xfix2 = '';
      if (branch && returnValue) {
        xfix2 = xfix1;
      }
      if (returnValue) {
        returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
      }
      const args = [];
      args.push(
        generator.nameDB_.getName(
          i18n.thisSprite(),
          Blockly.Names.NameType.VARIABLE
        )
      );
      const variables = block.getVars();
      for (let i = 0; i < variables.length; i++) {
        args[i] = generator.nameDB_.getName(
          variables[i],
          Blockly.Names.NameType.VARIABLE
        );
      }
      let code =
        'function ' +
        funcName +
        '(' +
        args.join(', ') +
        ') {\n' +
        xfix1 +
        loopTrap +
        branch +
        xfix2 +
        returnValue +
        '}';
      // Once we are on V11, we can remove this cast as scrub_ will no longer be protected.
      code = generator.scrub_(block, code);
      // Add % so as not to collide with helper functions in definitions list.
      generator.provideFunction_('%' + funcName, code);
      return null;
    };
    generator.forBlock.gamelab_behavior_get = function (_block, generator) {
      const block = _block;
      // Generating 'undefined' mimics the code for a missing block.
      const undefinedCode = ['undefined', Order.ATOMIC];
      // If we don't have a behavior Id, find on the definition block.
      if (!this.behaviorId) {
        const procedureModel = block.getProcedureModel();
        // If there's no model, fail gracefully.
        if (!procedureModel) {
          return undefinedCode;
        }
        const definitionBlock = Blockly.Procedures.getDefinition(
          procedureModel.getName(),
          Blockly.getHiddenDefinitionWorkspace()
        );
        block.behaviorId = definitionBlock?.behaviorId;
        // If we somehow still don't have a behavior id, fail gracefully.
        if (!this.behaviorId) {
          return undefinedCode;
        }
      }
      if (block.behaviorId && generator.nameDB_) {
        const name = generator.nameDB_.getName(block.behaviorId, 'PROCEDURE');
        return [`new Behavior(${name}, [])`, Order.ATOMIC];
      } else {
        return null;
      }
    };
    generator.forBlock.sprite_parameter_get = generator.forBlock.variables_get;
    Blockly.Blocks.sprite_variables_get = {
      // Variable getter.
      init: function () {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl('/docs/spritelab/codestudio_spriteName');
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
        this.setStyle('sprite_blocks');
      },
      getVars: function () {
        return Blockly.Variables.getVars.bind(this)(
          Blockly.BlockValueType.SPRITE
        );
      },
      renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar,
    };
    Blockly.customBlocks.defineNewBlockGenerator(
      generator,
      'sprite_variables_get',
      function () {
        return [
          `{name: '${Blockly.JavaScript.translateVarName(
            this.getFieldValue('VAR')
          )}'}`,
          Blockly.JavaScript.ORDER_ATOMIC,
        ];
      }
    );
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.SPRITE,
      'sprite_variables_get'
    );
    Blockly.customBlocks.defineNewBlockGenerator(
      generator,
      'math_random_int',
      Blockly.customBlocks.mathRandomIntGenerator
    );
    // NOTE: On the page where behaviors are created (the functions/#/edit page)
    // blockInstallOptions is undefined.
    if (
      !blockInstallOptions ||
      !blockInstallOptions.level ||
      blockInstallOptions.level.editBlocks !== TOOLBOX_EDIT_MODE
    ) {
      // This is only used by CDO Blockly. When we are ready to remove support
      // for CDO Blockly we can remove this call.
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
        addDefaultVar: false,
      });
    }
    delete blockly.Blocks.procedures_defreturn;
    delete blockly.Blocks.procedures_ifreturn;
  },
};
