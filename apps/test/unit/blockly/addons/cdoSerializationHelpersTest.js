import {expect} from '../../../util/reconfiguredChai';
import {
  addPositionsToState,
  getNewLocation,
  getCursorYAdjustment,
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

describe('getNewLocation', () => {
  it('should determine the new location based on the cursor', () => {
    const block = {workspace: {RTL: false}};
    const cursor = {x: 16, y: 16};
    const newLocation = getNewLocation(block, cursor);

    expect(newLocation).to.deep.equal({x: 16, y: 16});
  });

  it('should determine the new location for blocks with SVG frames', () => {
    const block = {
      unusedSvg_: {},
      workspace: {RTL: false},
    };
    const cursor = {x: 16, y: 100};
    const newLocation = getNewLocation(block, cursor);

    // Horizontal SVG frame offset is 15.
    // Vertical SVG frame offset is 35.
    expect(newLocation).to.deep.equal({x: 31, y: 135});
  });

  it('should determine the new location for blocks with SVG frames in RTL mode', () => {
    const block = {
      unusedSvg_: {},
      workspace: {RTL: true},
    };
    // For RTL workspaces, we position blocks from the left.
    const cursor = {x: 515, y: 150};
    const newLocation = getNewLocation(block, cursor);

    expect(newLocation).to.deep.equal({x: 500, y: 185});
  });
});

describe('getCursorYAdjustment', () => {
  it('should determine the cursor Y adjustment based on the block height and padding', () => {
    const block = {
      getHeightWidth: () => ({height: 20, width: 100}),
    };
    const cursorYAdjustment = getCursorYAdjustment(block);

    // Vertical spacing between blocks is 10
    expect(cursorYAdjustment).to.equal(30);
  });

  it('should determine the cursor Y adjustment when an svg frame is present', () => {
    const block = {
      id: 'block6',
      type: 'procedures_defnoreturn',
      functionalSvg_: {},
      getHeightWidth: () => ({height: 50, width: 150}),
    };

    const cursorYAdjustment = getCursorYAdjustment(block);

    // SVG adds 40 to frame (+10 for vertical spacing between blocks)
    expect(cursorYAdjustment).to.equal(100);
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
