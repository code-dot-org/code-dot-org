//import msg from '@cdo/gamelab/locale';

const SPRITE_CATEGORY = 'sprites';
const CATEGORIES = {
  [SPRITE_CATEGORY]: {
    color: [184, 1.00, 0.74],
  },
};

const SPRITES = [
  ['a dog', 'dog']
];

export default {
  install(blockly, blockInstallOptions) {
    const generator = blockly.Generator.get('JavaScript');

    const createJsWrapperBlock = (category, functionName, blockText, args, returnType) => {
      const blockName = `gamelab_${functionName}`;
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
        const values = args.map(arg => this.getTitleValue(arg.name));
        if (returnType !== undefined) {
          // TODO(ram): find a blockly constant to use in place of '0',
          // I'm pretty sure it's called "ATOMIC" or something
          return [`${functionName}(${values.join(', ')});`, 0];
        } else {
          return `${functionName}(${values.join(', ')});`;
        }
      };
    };

    createJsWrapperBlock(
      SPRITE_CATEGORY,
      'makeNewSprite',
      'Make a new sprite',
      [
        { name: 'ANIMATION', type: 'string', options: SPRITES},
        { name: 'X', type: 'number' },
        { name: 'Y', type: 'number' },
      ],
      'sprite');
  },
};
