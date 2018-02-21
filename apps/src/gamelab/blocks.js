import {
  interpolateInputs,
  determineInputs,
} from '../block_utils';

const SPRITE_CATEGORY = 'sprites';
const EVENT_CATEGORY = 'events';
const EVENT_LOOP_CATEGORY = 'event_loop';
const VARIABLES_CATEGORY = 'variables';
const CATEGORIES = {
  [SPRITE_CATEGORY]: {
    color: [184, 1.00, 0.74],
  },
  [EVENT_CATEGORY]: {
    color: [140, 1.00, 0.74],
  },
  [EVENT_LOOP_CATEGORY]: {
    color: [322, 0.90, 0.95],
  },
  [VARIABLES_CATEGORY]: {
    color: [312, 0.32, 0.62],
  },
};

const SPRITES = [
  ['dog', '"dog"'],
  ['cat', '"cat"'],
];

export default {
  install(blockly, blockInstallOptions) {
    const {
      ORDER_COMMA,
      ORDER_FUNCTION_CALL,
      ORDER_MEMBER,
      ORDER_NONE,
    } = Blockly.JavaScript;

    // TODO(ram): Create Blockly.BlockValueType.SPRITE
    const SPRITE_TYPE = blockly.BlockValueType.NONE;
    const generator = blockly.Generator.get('JavaScript');

    const createJsWrapperBlock = ({
      category,
      func,
      expression,
      orderPrecedence,
      name,
      blockText,
      args,
      returnType,
      methodCall,
      eventBlock,
      eventLoopBlock,
    }) => {
      args = args || [];
      const blockName = `gamelab_${name || func}`;

      blockly.Blocks[blockName] = {
        helpUrl: '',
        init: function () {
          this.setHSV(...CATEGORIES[category].color);
          if (methodCall) {
            args.push({
              name: 'THIS',
              type: Blockly.BlockValueType.NONE,
            });
          }

          interpolateInputs(blockly, this, determineInputs(blockText, args));

          this.setInputsInline(true);
          if (returnType) {
            this.setOutput(true, returnType);
          } else {
            if (eventLoopBlock) {
              this.appendStatementInput('DO');
            } else {
              this.setNextStatement(true);
              if (eventBlock) {
                this.skipNextBlockGeneration = true;
              } else {
                this.setPreviousStatement(true);
              }
            }
          }
        },
      };

      generator[blockName] = function () {
        const values = args.map(arg => {
          if (arg.options) {
            return this.getTitleValue(arg.name);
          } else {
            return Blockly.JavaScript.valueToCode(this, arg.name, ORDER_COMMA);
          }
        });

        let prefix = '';
        if (methodCall) {
          const object =
            Blockly.JavaScript.valueToCode(this, 'THIS', ORDER_MEMBER);
          prefix = `${object}.`;
        }

        if (eventLoopBlock || eventBlock) {
          let handlerCode = '';
          if (eventBlock) {
            const nextBlock = this.nextConnection &&
              this.nextConnection.targetBlock();
            handlerCode = Blockly.JavaScript.blockToCode(nextBlock, true);
          } else if (eventLoopBlock) {
            handlerCode = Blockly.JavaScript.statementToCode(this, 'DO');
          }
          handlerCode = Blockly.Generator.prefixLines(handlerCode, '  ');
          values.push(`function () {\n${handlerCode}}`);
        }

        if (expression) {
          if (returnType !== undefined) {
            return [`${prefix}${expression}`, orderPrecedence || ORDER_NONE];
          } else {
            return `${prefix}${expression}`;
          }
        }

        if (returnType !== undefined) {
          return [`${prefix}${func}(${values.join(', ')})`, ORDER_FUNCTION_CALL];
        } else {
          return `${prefix}${func}(${values.join(', ')});\n`;
        }
      };
    };

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'makeNewSprite',
      blockText: 'make a new {ANIMATION} sprite at {X} {Y}',
      args: [
        { name: 'ANIMATION', options: SPRITES },
        { name: 'X', type: blockly.BlockValueType.NUMBER },
        { name: 'Y', type: blockly.BlockValueType.NUMBER },
      ],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'makeNewGroup',
      blockText: 'make a new group',
      args: [],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'add',
      blockText: 'add {SPRITE} to group {THIS}',
      args: [
        { name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveUp',
      blockText: '{THIS} move up',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveDown',
      blockText: '{THIS} move down',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveLeft',
      blockText: '{THIS} move left',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveRight',
      blockText: '{THIS} move right',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenUpArrow',
      blockText: 'when up arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenDownArrow',
      blockText: 'when down arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenLeftArrow',
      blockText: 'when left arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenRightArrow',
      blockText: 'when right arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_LOOP_CATEGORY,
      func: 'whileUpArrow',
      blockText: 'while up arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_LOOP_CATEGORY,
      func: 'whileDownArrow',
      blockText: 'while down arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_LOOP_CATEGORY,
      func: 'whileLeftArrow',
      blockText: 'while left arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_LOOP_CATEGORY,
      func: 'whileRightArrow',
      blockText: 'while right arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenTouching',
      blockText: 'when {SPRITE1} is touching {SPRITE2}',
      args: [
        { name: 'SPRITE1', type: SPRITE_TYPE },
        { name: 'SPRITE2', type: SPRITE_TYPE },
      ],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'displace',
      blockText: '{THIS} blocks {SPRITE} from moving',
      args: [
        {name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'destroy',
      blockText: 'remove {THIS}',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: VARIABLES_CATEGORY,
      expression: 'arguments[0]',
      orderPrecedence: ORDER_MEMBER,
      name: 'firstTouched',
      blockText: 'first touched sprite',
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      category: VARIABLES_CATEGORY,
      expression: 'arguments[1]',
      orderPrecedence: ORDER_MEMBER,
      name: 'secondTouched',
      blockText: 'second touched sprite',
      returnType: SPRITE_TYPE,
    });
  },
};
