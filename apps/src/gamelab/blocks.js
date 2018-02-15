//import msg from '@cdo/gamelab/locale';

const SPRITE_CATEGORY = 'sprites';
const CATEGORIES = {
  [SPRITE_CATEGORY]: {
    color: [184, 1.00, 0.74],
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

    const createJsWrapperBlock = ({category, func, blockText, args, returnType, methodCall}) => {
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
            this.setNextStatement(true);
            this.setPreviousStatement(true);
          }
        },
      };

      generator[blockName] = function () {
        const object =
          Blockly.JavaScript.valueToCode(this, 'THIS', ORDER_MEMBER);
        const values = args.map(arg => {
          if (arg.options) {
            return this.getTitleValue(arg.name);
          } else {
            return Blockly.JavaScript.valueToCode(this, arg.name, ORDER_COMMA);
          }
        });
        const prefix = methodCall ? `${object}.` : '';
        if (returnType !== undefined) {
          return [`${prefix}${func}(${values.join(', ')})`, ORDER_FUNCTION_CALL];
        } else {
          return `${prefix}${func}(${values.join(', ')});`;
        }
      };
    };

    createJsWrapperBlock({
      category: SPRITE_CATEGORY,
      func: 'makeNewSprite',
       // TODO(ram): should be "Make a new {ANIMATION} sprite", coordinates TBD
      blockText: 'Make a new sprite',
      args: [
        { name: 'ANIMATION', type: 'string', options: SPRITES},
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
  },
};
