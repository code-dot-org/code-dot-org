import i18n from '@cdo/locale';

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
        if (
          inputConfig.assignment &&
          name === inputConfig.name &&
          block.blockSpace.isFlyout
        ) {
          newValue = Blockly.Variables.generateUniqueName(newValue);
        }
        block.superSetTitleValue(newValue, name);
      };

      currentInputRow
        .appendTitle(inputConfig.label)
        .appendTitle(
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
      return Blockly.JavaScript.translateVarName(block.getTitleValue(arg.name));
    }
  },
  limitedColourPicker: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const options = {
        colours: limitedColours,
        columns: 3
      };
      currentInputRow
        .appendTitle(inputConfig.label)
        .appendTitle(
          new Blockly.FieldColour('#ff0000', undefined, options),
          'VAL'
        );
    },
    generateCode(block, arg) {
      return `'${block.getTitleValue(arg.name)}'`;
    }
  }
};

export default {
  customInputTypes,
  install(blockly, blockInstallOptions) {
    // Legacy style block definitions :(
    const generator = blockly.Generator.get('JavaScript');

    const behaviorEditor = (Blockly.behaviorEditor = new Blockly.FunctionEditor(
      {
        FUNCTION_HEADER: 'Behavior',
        FUNCTION_NAME_LABEL: 'Name your behavior:',
        FUNCTION_DESCRIPTION_LABEL: 'What is your behavior supposed to do?'
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
          .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
          .appendTitle(
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
          .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
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
    generator.sprite_variables_get = generator.variables_get;
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
          .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
          .appendTitle(fieldLabel, 'VAR')
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
      removeVar: Blockly.Blocks.variables_get.removeVar
    };
    generator.sprite_parameter_get = generator.variables_get;
  }
};
