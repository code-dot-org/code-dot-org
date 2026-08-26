jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
}));

import distanceBetween from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/distanceBetween';

import {fakeBlock, fakeGenerator} from '../blockDefinitionFakes';

describe('spritelab2_distanceBetween', () => {
  it('names both sprites by costume', () => {
    const [code] = distanceBetween.generator(
      fakeBlock({FROM: '"dog"', TO: '"food"'}),
      fakeGenerator()
    ) as [string, number];
    expect(code).toBe('distanceBetween({costume: "dog"}, {costume: "food"})');
  });
});
