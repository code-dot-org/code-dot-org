import STANDARD_INPUT_TYPES from '@cdo/apps/block_utils_standard_input_types';
import {styleTypes} from '@cdo/apps/blockly/themes/cdoBlockStyles.mjs';
import {
  determineInputs,
  groupInputsByRow,
  interpolateInputs,
} from './block_utils_input_utils';

const DEFAULT_COLOR = [184, 1.0, 0.74];

/**
 * Create a block generator that creats blocks that directly map to a javascript
 * function call, method call, or other (hopefully simple) expression.
 *
 * @params {Blockly} blockly The Blockly object provided to install()
 * @params {string[]} strictTypes Input/output types that are always configerd
 *   with strict type checking.
 * @params {string} defaultObjectType Default type used for the 'THIS' input in
 *   method call blocks.
 * @param {Object.<string,InputType>} customInputTypes customType input
 *   definitions.
 * @returns {function} A function that takes a bunch of block properties and
 *   adds a block to the blockly.Blocks object. See param documentation below.
 */
export default function (
  blockly,
  strictTypes,
  defaultObjectType,
  customInputTypes
) {
  const {ORDER_FUNCTION_CALL, ORDER_MEMBER, ORDER_NONE} = Blockly.JavaScript;

  const generator = blockly.getGenerator();

  const inputTypes = {
    ...STANDARD_INPUT_TYPES,
    ...customInputTypes,
  };

  /**
   * Create a block that directly maps to a javascript function call, method
   * call, or other (hopefully simple) expression.
   *
   * @param {Object} opts Block options
   * @param {number[]} opts.color HSV block color as a 3-element number array
   * @param {string} opts.func For function/method calls, the function name
   * @param {string} opts.expression Instead of specifying func, use this param
   *   to specify an arbitrary javascript expression instead
   * @param {number} opts.orderPrecedence For expressions, the minimum binding
   *   strength of any operators in the expression. You can omit this, and the
   *   code generator code will just wrap the expression in parens, see:
   *   https://developers.google.com/blockly/guides/create-custom-blocks/operator-precedence
   * @param {string} opts.name Block name, defaults to func.
   * @param {string} opts.blockText Human-readable text to show on the block,
   *   with params specified in curly braces, see determineInputs()
   * @param {InputConfig[]} opts.args List of block inputs.
   * @param {BlockValueType} opts.returnType Type of value returned by this
   *   block, omit if you want a block with no output.
   * @param {boolean} opts.strictOutput Whether to enforce strict type checking
   *   on the output.
   * @param {boolean} opts.methodCall Generate a method call. The blockText
   *   should contain '{THIS}' in order to create an input for the instance
   * @params {string} opts.objectType Type used for the 'THIS' input in a method
   *   call block.
   * @param {string} opts.thisObject Specify an explicit `this` for method call.
   * @param {boolean} opts.eventBlock Generate an event block, which is just a
   *   block without a previous statement connector.
   * @param {boolean} opts.eventLoopBlock Generate an "event loop" block, which
   *   looks like a loop block but without previous or next statement connectors
   * @param {boolean} opts.inline Render inputs inline, defaults to false
   * @param {boolean} opts.simpleValue Just return the field value of the block.
   * @param {string[]} opts.extraArgs Additional arguments to pass into the generated function.
   * @param {string[]} opts.callbackParams Parameters to add to the generated callback function.
   * @param {string[]} opts.miniToolboxBlocks
   * @param {?string} helperCode The block's helper code, to verify the func.
   *
   * @returns {string} the name of the generated block
   */
  return (
    {
      color,
      style,
      func,
      expression,
      orderPrecedence,
      name,
      blockText,
      args,
      returnType,
      strictOutput,
      methodCall,
      objectType,
      thisObject,
      eventBlock,
      eventLoopBlock,
      inline,
      simpleValue,
      extraArgs,
      callbackParams,
      miniToolboxBlocks,
    },
    helperCode,
    pool
  ) => {
    if (!pool || pool === 'GamelabJr') {
      pool = 'gamelab'; // Fix for users who already have the old blocks saved in their solutions.
      // TODO: when we nuke per-level custom blocks, `throw new Error('No block pool specified');`
    }
    if (!!func + !!expression + !!simpleValue !== 1) {
      throw new Error(
        'Provide exactly one of func, expression, or simpleValue'
      );
    }
    if (
      func &&
      helperCode &&
      !new RegExp(`function ${func}\\W`).test(helperCode)
    ) {
      throw new Error(`func '${func}' not found in helper code`);
    }
    if ((expression || simpleValue) && !name) {
      throw new Error('This block requires a name');
    }
    if (blockText === undefined) {
      throw new Error('blockText must be specified');
    }
    if (
      simpleValue &&
      (!args || args.filter(arg => !arg.assignment).length !== 1)
    ) {
      throw new Error(
        'simpleValue blocks must have exactly one non-assignment argument'
      );
    }
    if (simpleValue && !returnType && !args.some(arg => arg.assignment)) {
      throw new Error(
        'simpleValue blocks must specify a return type or have ' +
          'an assignment input'
      );
    }
    if (inline === undefined) {
      inline = true;
    }

    if (style && !styleTypes.includes(style)) {
      // Attempt to guess the intended styles based on the first three letters.
      const bestGuess =
        styleTypes[
          styleTypes.findIndex(type =>
            type.startsWith(style.toLowerCase().slice(0, 3))
          )
        ];
      throw new Error(
        `"${style}" is not a valid style for ${name || func}. ` +
          (bestGuess
            ? `Did you mean "${bestGuess}"?`
            : `Choose one of [${styleTypes.sort().join(', ')}]`)
      );
    }

    args = args || [];
    if (args.filter(arg => arg.statement).length > 1 && inline) {
      console.warn('blocks with multiple statement inputs cannot be inlined');
      inline = false;
    }
    args.forEach(arg => {
      if (arg.customInput && inputTypes[arg.customInput] === undefined) {
        throw new Error(
          `${arg.customInput} is not a valid input type, ` +
            `choose one of [${Object.keys(customInputTypes).join(', ')}]`
        );
      }
    });
    const blockName = `${pool}_${name || func}`;
    if (eventLoopBlock && args.filter(arg => arg.statement).length === 0) {
      // If the eventloop block doesn't explicitly list its statement inputs,
      // just tack one onto the end
      args.push({
        name: 'DO',
        statement: true,
      });
    }
    const inputs = [...args];
    if (methodCall && !thisObject) {
      const thisType =
        objectType || defaultObjectType || Blockly.BlockValueType.NONE;
      inputs.push({
        name: 'THIS',
        type: thisType,
        strict: strictTypes.includes(thisType),
      });
    }
    const inputConfigs = determineInputs(blockText, inputs, strictTypes);
    const inputRows = groupInputsByRow(inputConfigs, inputTypes);
    if (inputRows.length === 1) {
      inline = false;
    }

    blockly.Blocks[blockName] = {
      helpUrl: '',
      init: function () {
        // Styles should be used over hard-coded colors in Google Blockly blocks
        if (style && this.setStyle) {
          this.setStyle(style);
        } else if (color) {
          Blockly.cdoUtils.setHSV(this, ...color);
        } else if (!returnType) {
          if (this.setStyle) {
            this.setStyle('default');
          } else {
            Blockly.cdoUtils.setHSV(this, ...DEFAULT_COLOR);
          }
        }

        if (returnType) {
          this.setOutput(
            true,
            returnType,
            strictOutput || strictTypes.includes(returnType)
          );
        } else if (eventLoopBlock) {
          // No previous or next statement connector
        } else if (eventBlock) {
          this.setNextStatement(true);
          this.skipNextBlockGeneration = true;
        } else {
          this.setNextStatement(true);
          this.setPreviousStatement(true);
        }

        // Use window.appOptions, not global appOptions, because the levelbuilder
        // block page doesn't have appOptions, but we *do* want to show the mini-toolbox
        // there
        if (
          miniToolboxBlocks &&
          (!window.appOptions || window.appOptions.level.miniToolbox)
        ) {
          var toggle = new Blockly.FieldIcon('+');
          if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
            toggle.setReadOnly();
          }

          var miniToolboxXml = '<xml>';
          miniToolboxBlocks.forEach(block => {
            miniToolboxXml += `\n <block type="${block}"></block>`;
          });
          miniToolboxXml += '\n</xml>';
          // Block.isMiniFlyoutOpen is used in the blockly repo to track whether or not the horizontal flyout is open.
          this.isMiniFlyoutOpen = false;
          // On button click, open/close the horizontal flyout, toggle button text between +/-, and re-render the block.
          Blockly.cdoUtils.bindBrowserEvent(
            toggle.fieldGroup_,
            'mousedown',
            this,
            () => {
              if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
                return;
              }

              if (this.isMiniFlyoutOpen) {
                toggle.setValue('+');
              } else {
                toggle.setValue('-');
              }
              this.isMiniFlyoutOpen = !this.isMiniFlyoutOpen;
              this.render();
              // If the mini flyout just opened, make sure mini-toolbox blocks are updated with the right thumbnails.
              // This has to happen after render() because some browsers don't render properly if the elements are not
              // visible. The root cause is that getComputedTextLength returns 0 if a text element is not visible, so
              // the thumbnail image overlaps the label in Firefox, Edge, and IE.
              if (this.isMiniFlyoutOpen) {
                let miniToolboxBlocks = this.miniFlyout.blockSpace_.topBlocks_;
                let rootInputBlocks = this.getConnections_(true /* all */)
                  .filter(function (connection) {
                    return connection.type === Blockly.INPUT_VALUE;
                  })
                  .map(function (connection) {
                    return connection.targetBlock();
                  });
                miniToolboxBlocks.forEach(function (block, index) {
                  block.shadowBlockValue_(rootInputBlocks[index]);
                });
              }
            }
          );

          this.appendDummyInput()
            .appendField(toggle, 'toggle')
            .appendField(' ');

          this.initMiniFlyout(miniToolboxXml);
        }

        // These blocks should not be loaded into a Google Blockly level.
        // In the event that they are, skip this so the page doesn't crash.
        if (this.setBlockToShadow) {
          // Set block to shadow for preview field if needed
          switch (this.type) {
            case 'gamelab_clickedSpritePointer':
              this.setBlockToShadow(
                root =>
                  root.type === 'gamelab_spriteClicked' &&
                  root.getConnections_()[1] &&
                  root.getConnections_()[1].targetBlock()
              );
              break;
            case 'gamelab_newSpritePointer':
              this.setBlockToShadow(
                root =>
                  root.type === 'gamelab_whenSpriteCreated' &&
                  root.getConnections_()[1] &&
                  root.getConnections_()[1].targetBlock()
              );
              break;
            case 'gamelab_subjectSpritePointer':
              this.setBlockToShadow(
                root =>
                  root.type === 'gamelab_checkTouching' &&
                  root.getConnections_()[1] &&
                  root.getConnections_()[1].targetBlock()
              );
              break;
            case 'gamelab_objectSpritePointer':
              this.setBlockToShadow(
                root =>
                  root.type === 'gamelab_checkTouching' &&
                  root.getConnections_()[2] &&
                  root.getConnections_()[2].targetBlock()
              );
              break;
            default:
              // Not a pointer block, so no block to shadow
              break;
          }
        }
        interpolateInputs(blockly, this, inputRows, inputTypes, inline);
        this.setInputsInline(inline);
      },
    };

    generator[blockName] = function () {
      let prefix = '';
      const values = args
        .map(arg => {
          const inputConfig = inputConfigs.find(
            input => input.name === arg.name
          );
          if (!inputConfig) {
            return;
          }
          let inputCode = inputTypes[inputConfig.mode].generateCode(
            this,
            inputConfig
          );
          if (inputConfig.assignment) {
            prefix += `${inputCode} = `;
          }
          if (inputCode === '') {
            // Missing inputs should be passed into func as undefined
            inputCode = 'undefined';
          }
          if (inputConfig.defer) {
            inputCode = `function () {\n  return ${inputCode};\n}`;
          }
          return inputCode;
        })
        .filter(value => value !== null);

      if (extraArgs) {
        values.push(...extraArgs);
      }

      if (simpleValue) {
        const code = prefix + values[args.findIndex(arg => !arg.assignment)];
        if (returnType !== undefined) {
          return [
            code,
            orderPrecedence === undefined ? ORDER_NONE : orderPrecedence,
          ];
        } else {
          return code + ';\n';
        }
      }

      if (methodCall) {
        const object =
          thisObject ||
          Blockly.JavaScript.valueToCode(this, 'THIS', ORDER_MEMBER);
        prefix += `${object}.`;
      }

      if (eventBlock) {
        const nextBlock =
          this.nextConnection && this.nextConnection.targetBlock();
        let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
        handlerCode = Blockly.Generator.prefixLines(handlerCode, '  ');
        if (callbackParams) {
          let params = callbackParams.join(',');
          values.push(`function (${params}) {\n${handlerCode}}`);
        } else {
          values.push(`function () {\n${handlerCode}}`);
        }
      }

      if (
        this.type === 'gamelab_setPrompt' ||
        this.type === 'gamelab_setPromptWithChoices'
      ) {
        const input = this.getInput('VAR');
        if (input) {
          const targetBlock = input.connection.targetBlock();
          if (targetBlock && targetBlock.type === 'variables_get') {
            const varName = Blockly.JavaScript.blockToCode(targetBlock)[0];
            values.push(`function(val) {${varName} = val;}`);
          }
        }
      }

      if (expression) {
        // If the original expression has a value placeholder, replace it
        // with the selected value.
        let valueExpression = expression.replace('VALUE', values[0]);
        if (returnType !== undefined) {
          return [
            `${prefix}${valueExpression}`,
            orderPrecedence === undefined ? ORDER_NONE : orderPrecedence,
          ];
        } else {
          return `${prefix}${valueExpression}`;
        }
      }

      if (returnType !== undefined) {
        return [`${prefix}${func}(${values.join(', ')})`, ORDER_FUNCTION_CALL];
      } else {
        return `${prefix}${func}(${values.join(', ')});\n`;
      }
    };

    return blockName;
  };
}
