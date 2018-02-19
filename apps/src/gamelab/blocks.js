//import msg from '@cdo/gamelab/locale';

const SPRITE_CATEGORY = 'sprites';
const EVENT_CATEGORY = 'events';
const EVENT_LOOP_CATEGORY = 'event_loop';
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
};

const SPRITES = [
  ['a dog', '"dog"']
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
      eventLoopBlock,
    }) => {
      const blockName = `gamelab_${func}`;
      blockly.Blocks[blockName] = {
        helpUrl: '',
        init: function () {
          this.setHSV(...CATEGORIES[category].color);
          if (methodCall) {
            this.appendValueInput('THIS');
          }
          // TODO(ram): interpolate text with inputs
          this.appendDummyInput().appendTitle(blockText);
          args.forEach(arg => {
            if (arg.options) {
              const dropdown = new blockly.FieldDropdown(arg.options);
              this.appendDummyInput().appendTitle(dropdown, arg.name);
            } else if (arg.type) {
              this.appendValueInput(arg.name)
                .setCheck(arg.type);
            }
          });

          this.setInputsInline(true);
          if (returnType) {
            // TODO(ram): Create Blockly.BlockValueType.SPRITE
            this.setOutput(true, Blockly.BlockValueType.NUMBER);
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
       // TODO(ram): should be "Make a new {ANIMATION} sprite", coordinates TBD
      blockText: 'Make a new sprite',
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
      blockText: 'move up',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveDown',
      blockText: 'move down',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveLeft',
      blockText: 'move left',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'moveRight',
      blockText: 'move right',
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
  },
};
