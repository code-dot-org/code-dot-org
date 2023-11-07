import {expect} from '../../../util/reconfiguredChai';
import {
  addPositionsToState,
  getCombinedSerialization,
  isBlockLocationUnset,
} from '@cdo/apps/blockly/addons/cdoSerializationHelpers';

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

    expect(blockIdMap.get('blockId')).to.deep.equal({
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

    expect(blockIdMap.get('blockId')).to.deep.equal({
      x: 0,
      y: 0,
    });
  });
});

describe('isBlockLocationUnset', () => {
  const workspaceLTR = {RTL: false, getMetrics: () => ({viewWidth: 515})};
  const workspaceRTL = {RTL: true, getMetrics: () => ({viewWidth: 515})};

  it('should return true for a block at (0, 0) on an LTR workspace', () => {
    const block = {
      workspace: workspaceLTR,
      getRelativeToSurfaceXY: () => ({x: 0, y: 0}),
    };

    const result = isBlockLocationUnset(block);
    expect(result).to.be.true;
  });

  it('should return false for a block at specific coordinates on an LTR workspace', () => {
    const block = {
      workspace: workspaceLTR,
      getRelativeToSurfaceXY: () => ({x: 20, y: 140}),
    };

    const result = isBlockLocationUnset(block);
    expect(result).to.be.false;
  });

  it('should return true for a block at the top-right corner of an RTL workspace', () => {
    const block = {
      workspace: workspaceRTL,
      getRelativeToSurfaceXY: () => ({x: 515, y: 0}),
    };

    const result = isBlockLocationUnset(block);
    expect(result).to.be.true;
  });

  it('should return false for a block at specific coordinates of an RTL workspace', () => {
    const block = {
      workspace: workspaceRTL,
      getRelativeToSurfaceXY: () => ({x: 495, y: 140}),
    };

    const result = isBlockLocationUnset(block);
    expect(result).to.be.false;
  });
});

describe('getCombinedSerialization', () => {
  it('should return mainSerialization if otherSerialization is empty', () => {
    const mainSerialization = {
      blocks: {blocks: [{id: 1}, {id: 2}]},
      procedures: [{id: 3}, {id: 4}],
    };
    const otherSerialization = {};

    const result = getCombinedSerialization(
      mainSerialization,
      otherSerialization
    );

    expect(result).to.deep.equal(mainSerialization);
  });

  it('should merge blocks and procedures based on id', () => {
    const mainSerialization = {
      blocks: {blocks: [{id: 1}, {id: 2}]},
      procedures: [{id: 3}, {id: 4}],
    };
    const otherSerialization = {
      blocks: {blocks: [{id: 2}, {id: 5}]},
      procedures: [{id: 4}, {id: 6}],
    };
    const expected = {
      blocks: {blocks: [{id: 1}, {id: 2}, {id: 5}]},
      procedures: [{id: 3}, {id: 4}, {id: 6}],
    };

    const result = getCombinedSerialization(
      mainSerialization,
      otherSerialization
    );

    expect(result).to.deep.equal(expected);
  });

  it('should return references to new objects instead of mutating the original main serialization', () => {
    const mainSerialization = {
      blocks: {blocks: [{id: 1}, {id: 2}]},
      procedures: [{id: 3}, {id: 4}],
    };
    const otherSerialization = {
      blocks: {blocks: [{id: 2}, {id: 5}]},
      procedures: [{id: 4}, {id: 6}],
    };

    const result = getCombinedSerialization(
      mainSerialization,
      otherSerialization
    );

    // Strict equality is true for Objects in Javascript when they refer to the same location in memory
    // So this is checking that the input was copied and not mutated
    expect(result).to.not.equal(mainSerialization);
  });
});
