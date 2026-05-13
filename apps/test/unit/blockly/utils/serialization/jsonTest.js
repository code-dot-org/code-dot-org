import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';
import {partitionJsonBlocksByType} from '@cdo/apps/blockly/utils/serialization/json';

describe('partitionJsonBlocksByType', () => {
  it('should work with JSON blocks and prioritized types', () => {
    const blocks = [
      {type: 'blockType1'},
      {type: 'when_run'},
      {type: 'blockType2'},
      {type: 'Dancelab_whenSetup'},
    ];

    const result = partitionJsonBlocksByType(blocks, [
      'when_run',
      'Dancelab_whenSetup',
    ]);
    expect(result).toEqual([
      {type: 'when_run'},
      {type: 'Dancelab_whenSetup'},
      {type: 'blockType1'},
      {type: 'blockType2'},
    ]);
  });

  it('should handle an empty block array', () => {
    const result = partitionJsonBlocksByType([], PROCEDURE_DEFINITION_TYPES);
    expect(result).toEqual([]);
  });

  it('should return the original array if no prioritized types are provided', () => {
    const blocks = [{type: 'A'}, {type: 'B'}, {type: 'C'}];

    const result = partitionJsonBlocksByType(blocks, undefined);
    expect(result).toEqual(blocks);
  });
});
