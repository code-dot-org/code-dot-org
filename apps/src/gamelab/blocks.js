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
    } = Blockly.JavaScript;
    const generator = blockly.Generator.get('JavaScript');

    const createJsWrapperBlock = (category, func, blockText, args, returnType) => {
      const blockName = `gamelab_${func}`;
      blockly.Blocks[blockName] = {
        helpUrl: '',
        init: function () {
          this.setHSV(...CATEGORIES[category].color);
          // TODO(ram): interpolate text with inputs
          this.appendDummyInput().appendTitle(blockText);
          args.forEach(arg => {
            if (arg.options) {
              const dropdown = new blockly.FieldDropdown(arg.options);
              this.appendDummyInput().appendTitle(dropdown, arg.name);
            } else if (arg.type === 'number') {
              this.appendValueInput(arg.name)
                .setCheck(blockly.BlockValueType.NUMBER);
            }
          });

          this.setInputsInline(true);
          // TODO(ram): Create Blockly.BlockValueType.SPRITE
          this.setOutput(true, Blockly.BlockValueType.NUMBER);
          //this.setTooltip(msg.tooltip());
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
        if (returnType !== undefined) {
          return [`${func}(${values.join(', ')});`, ORDER_FUNCTION_CALL];
        } else {
          return `${func}(${values.join(', ')});`;
        }
      };
    };

    createJsWrapperBlock(
      SPRITE_CATEGORY,
      'makeNewSprite',
       // TODO(ram): should be "Make a new {ANIMATION} sprite", coordinates TBD
      'Make a new sprite',
      [
        { name: 'ANIMATION', type: 'string', options: SPRITES},
        { name: 'X', type: 'number' },
        { name: 'Y', type: 'number' },
      ],
      'sprite');
  },
};
