import {addPositionsToState} from '@cdo/apps/blockly/utils/serialization/xmlToJson';

describe('addPositionsToState', () => {
  it('should add x/y values from XML to JSON serialization', () => {
    const xmlBlocks = [
      {
        blockly_block: {
          id: 'blockId',
        },
        x: 20,
        y: 20,
      },
    ];

    const blockIdMap = new Map([['blockId', {x: 0, y: 0}]]);
    addPositionsToState(xmlBlocks, blockIdMap);

    expect(blockIdMap.get('blockId')).toEqual({
      x: 20,
      y: 20,
    });
  });

  it('should handle missing x/y values from XML', () => {
    const xmlBlocks = [
      {
        blockly_block: {
          id: 'blockId',
        },
        x: NaN,
        y: NaN,
      },
    ];

    const blockIdMap = new Map([['blockId', {x: 0, y: 0}]]);
    addPositionsToState(xmlBlocks, blockIdMap);

    expect(blockIdMap.get('blockId')).toEqual({
      x: 0,
      y: 0,
    });
  });
});
