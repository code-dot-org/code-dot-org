jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
}));

import makeSpriteWithBehavior from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/makeSpriteWithBehavior';

import {fakeBlock, fakeGenerator} from '../blockDefinitionFakes';

describe('spritelab2_makeSpriteWithBehavior', () => {
  it('passes costume, location and behavior', () => {
    const code = makeSpriteWithBehavior.generator(
      fakeBlock({ANIMATION_NAME: '"food"'}),
      fakeGenerator({LOCATION: '({"x":100,"y":100})', BEHAVIOR: 'draggable()'})
    );
    expect(code).toBe(
      'makeSpriteWithBehavior({costume: "food"}, ({"x":100,"y":100}), draggable());\n'
    );
  });
});
