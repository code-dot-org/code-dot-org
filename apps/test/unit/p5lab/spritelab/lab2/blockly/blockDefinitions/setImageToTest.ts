// The real module drags the image-picker UI (and its store/scss imports)
// into the suite; the definition only needs the field type name.
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
}));

import setImageTo from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setImageTo';

import {fakeBlock, fakeGenerator} from '../blockDefinitionFakes';

describe('spritelab2_setImageTo', () => {
  it('names the sprite by costume and takes the image as a value', () => {
    const code = setImageTo.generator(
      fakeBlock({ANIMATION_NAME: '"dog"'}),
      fakeGenerator({IMAGE: 'predictWith("m", {})'})
    );
    expect(code).toBe('setImage({costume: "dog"}, predictWith("m", {}));\n');
  });

  it('falls back to an empty name with no value attached', () => {
    const code = setImageTo.generator(
      fakeBlock({ANIMATION_NAME: '"dog"'}),
      fakeGenerator()
    );
    expect(code).toBe('setImage({costume: "dog"}, "");\n');
  });
});
