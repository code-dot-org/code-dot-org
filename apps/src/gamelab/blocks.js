import {
  interpolateInputs,
  determineInputs,
} from '../block_utils';

const SPRITE_CATEGORY = 'sprites';
const EVENT_CATEGORY = 'events';
const CATEGORIES = {
  [SPRITE_CATEGORY]: {
    color: [184, 1.00, 0.74],
  },
  [EVENT_CATEGORY]: {
    color: [140, 1.00, 0.74],
  },
};

const SPRITES = [
  ['dog', '"dog"']
];

export default {
  install(blockly, blockInstallOptions) {
    const {
      ORDER_COMMA,
      ORDER_FUNCTION_CALL,
      ORDER_MEMBER,
    } = Blockly.JavaScript;
    const SPRITE_TYPE = blockly.BlockValueType.NUMBER;
    const generator = blockly.Generator.get('JavaScript');

    const createJsWrapperBlock = ({
      category,
      func,
      blockText,
      args,
      returnType,
      methodCall,
      eventBlock,
    }) => {
      const blockName = `gamelab_${func}`;
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
            // TODO(ram): Create Blockly.BlockValueType.SPRITE
            this.setOutput(true, Blockly.BlockValueType.NUMBER);
          } else {
            this.setNextStatement(true);
            if (eventBlock) {
              this.skipNextBlockGeneration = true;
            } else {
              this.setPreviousStatement(true);
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

        if (eventBlock) {
          const nextBlock = this.nextConnection && this.nextConnection.targetBlock();
          const handlerCode = Blockly.Generator.prefixLines(
            Blockly.JavaScript.blockToCode(nextBlock, true),
            '  ' // 2-space indent
          );
          values.push(`function () {\n${handlerCode}}`);
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
      blockText: 'Make a new {ANIMATION} sprite at {X} {Y}',
      args: [
        { name: 'ANIMATION', options: SPRITES},
        { name: 'X', type: blockly.BlockValueType.NUMBER},
        { name: 'Y', type: blockly.BlockValueType.NUMBER},
      ],
      returnType: SPRITE_TYPE,
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
      blockText: 'When up arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenDownArrow',
      blockText: 'When down arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenLeftArrow',
      blockText: 'When left arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whenRightArrow',
      blockText: 'When right arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whileUpArrow',
      blockText: 'While up arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whileDownArrow',
      blockText: 'While down arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whileLeftArrow',
      blockText: 'While left arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      category: EVENT_CATEGORY,
      func: 'whileRightArrow',
      blockText: 'While right arrow presssed',
      args: [],
      eventBlock: true,
    });
  },
};
