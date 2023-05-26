import {
  DROPDOWN_INPUT,
  VALUE_INPUT,
  INLINE_DUMMY_INPUT,
  DUMMY_INPUT,
  STATEMENT_INPUT,
  FIELD_INPUT,
  VARIABLE_INPUT,
} from './constants';

/**
 * @type {Object.<string, InputType>}
 */
const STANDARD_INPUT_TYPES = {
  [VALUE_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      const inputRow = block
        .appendValueInput(inputConfig.name)
        .setAlign(blockly.ALIGN_RIGHT);
      if (inputConfig.strict) {
        inputRow.setStrictCheck(inputConfig.type);
      } else {
        inputRow.setCheck(inputConfig.type);
      }
      return inputRow;
    },
    generateCode(block, inputConfig) {
      return Blockly.JavaScript.valueToCode(
        block,
        inputConfig.name,
        Blockly.JavaScript.ORDER_COMMA
      );
    },
  },
  [STATEMENT_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      return block.appendStatementInput(inputConfig.name);
    },
    generateCode(block, inputConfig) {
      const code = Blockly.JavaScript.statementToCode(block, inputConfig.name);
      return `function () {\n${code}}`;
    },
  },
  [INLINE_DUMMY_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      if (inputConfig.customOptions && inputConfig.customOptions.assetUrl) {
        currentInputRow
          .appendField(inputConfig.label)
          .appendField(
            new Blockly.FieldImage(
              Blockly.assetUrl(inputConfig.customOptions.assetUrl),
              inputConfig.customOptions.width,
              inputConfig.customOptions.height
            )
          );
      }
    },
    generateCode(block, inputConfig) {
      return null;
    },
  },
  [DUMMY_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      return block.appendDummyInput();
    },
    generateCode(block, inputConfig) {
      return null;
    },
  },
  [DROPDOWN_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const options = sanitizeOptions(inputConfig.options);
      const dropdown = new blockly.FieldDropdown(options);
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(dropdown, inputConfig.name);
    },
    generateCode(block, inputConfig) {
      let code = block.getFieldValue(inputConfig.name);
      if (
        inputConfig.type === Blockly.BlockValueType.STRING &&
        !code.startsWith('"') &&
        !code.startsWith("'")
      ) {
        // Wraps the value in quotes, and escapes quotes/newlines
        code = JSON.stringify(code);
      }
      return code;
    },
  },
  [VARIABLE_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      // Make sure the variable name gets declared at the top of the program
      block.getVars = function () {
        return {
          [Blockly.Variables.DEFAULT_CATEGORY]: [
            block.getFieldValue(inputConfig.name),
          ],
        };
      };

      // The following functions make sure that the variable naming/renaming options work for this block
      block.renameVar = function (oldName, newName) {
        if (
          Blockly.Names.equals(oldName, block.getFieldValue(inputConfig.name))
        ) {
          block.setTitleValue(newName, inputConfig.name);
        }
      };
      block.removeVar = function (oldName) {
        if (
          Blockly.Names.equals(oldName, block.getFieldValue(inputConfig.name))
        ) {
          block.dispose(true, true);
        }
      };
      block.superSetTitleValue = block.setTitleValue;
      block.setTitleValue = function (newValue, name) {
        if (name === inputConfig.name && block.blockSpace.isFlyout) {
          newValue = Blockly.Variables.generateUniqueName(newValue);
        }
        block.superSetTitleValue(newValue, name);
      };

      // Add the variable field to the block
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(new Blockly.FieldVariable(null), inputConfig.name);
    },
    generateCode(block, inputConfig) {
      return Blockly.JavaScript.translateVarName(
        block.getFieldValue(inputConfig.name)
      );
    },
  },
  [FIELD_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const {type} = inputConfig;
      const field = Blockly.cdoUtils.getField(type);
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(field, inputConfig.name);
    },
    generateCode(block, inputConfig) {
      let code = block.getFieldValue(inputConfig.name);
      if (inputConfig.type === Blockly.BlockValueType.STRING) {
        // Wraps the value in quotes, and escapes quotes/newlines
        code = JSON.stringify(code);
      }
      return code;
    },
  },
};
export default STANDARD_INPUT_TYPES;

/**
 * Adds a second value to options array elements if a second one does not exist.
 * The second value is used as the generated code for that option.
 * Required for backwards compatibility with existing blocks that are missing the second value.
 *
 * @param  {string[][]| string[]} dropdownOptions
 * @returns {string[][]} Sanitized array of dropdownOptions, ensuring that both a first and second value exist
 */
const sanitizeOptions = function (dropdownOptions) {
  return dropdownOptions.map(option =>
    option.length === 1 ? [option[0], option[0]] : option
  );
};
