import {expect} from '../../../util/reconfiguredChai';
import {
  addPositionsToState,
  getCombinedSerialization,
  insertCollider,
  isBlockLocationUnset,
  isOverlapping,
  appendProceduresToState,
} from '@cdo/apps/blockly/addons/cdoSerializationHelpers';

describe('CdoSerializationHelpers', () => {
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

  describe('insertCollider', () => {
    it('should insert the collider at the correct position', () => {
      const colliders = [
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 30, height: 10};

      insertCollider(colliders, item);
      expect(colliders).to.deep.equal([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 30, height: 10},
        {y: 40, height: 10},
      ]);
    });

    it('should insert the collider at the end if it is the lowest', () => {
      const colliders = [
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 50, height: 10};

      insertCollider(colliders, item);
      expect(colliders).to.deep.equal([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
        {y: 50, height: 10},
      ]);
    });

    it('should insert the collider at the beginning if it is the highest', () => {
      const colliders = [
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 0, height: 10};

      insertCollider(colliders, item);
      expect(colliders).to.deep.equal([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ]);
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

  describe('isOverlapping', () => {
    it('should return true when colliders overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).to.equal(true);
    });

    it('should return true when one collider is completely inside the other', () => {
      const collider1 = {x: 0, y: 0, width: 20, height: 20};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).to.equal(true);
    });

    it('should return false when colliders only touch but do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 10, y: 10, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).to.equal(false);
    });

    it('should return false when colliders do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 20, y: 20, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).to.equal(false);
    });
  });
  describe('appendProceduresToState', () => {
    const sharedBehaviorsState = {
      blocks: {
        blocks: [
          {
            type: 'behavior_definition',
            extraState: {
              procedureId: 'procedure1',
              behaviorId: 'walking',
            },
          },
          {
            type: 'behavior_definition',
            extraState: {
              procedureId: 'procedure2',
              behaviorId: 'running',
            },
          },
        ],
      },
      procedures: [
        {id: 'procedure1', name: 'walking'},
        {id: 'procedure2', name: 'running'},
      ],
    };
    it('should add all shared behaviors to a project when project contains none', () => {
      const projectState = {
        blocks: {
          blocks: [
            {
              type: 'when_run',
            },
          ],
        },
        procedures: [],
      };

      const updatedState = appendProceduresToState(
        projectState,
        sharedBehaviorsState
      );

      // Check if all shared behavior blocks are added to the project
      expect(updatedState.blocks.blocks).to.have.lengthOf(3);
      // Check if all associated procedures are added to the project
      expect(updatedState.procedures).to.have.lengthOf(2);
    });

    it('should not add duplicates when one or more existing behaviors are found', () => {
      const projectState = {
        blocks: {
          blocks: [
            {
              type: 'when_run',
            },
            {
              type: 'behavior_definition',
              extraState: {
                procedureId: 'procedure1',
                behaviorId: 'walking',
                userCreated: true,
              },
            },
          ],
        },
        procedures: [{id: 'procedure1', name: 'walking'}],
      };

      const updatedState = appendProceduresToState(
        projectState,
        sharedBehaviorsState
      );

      expect(updatedState.blocks.blocks).to.have.lengthOf(3);
      expect(updatedState.procedures).to.have.lengthOf(2);
    });

    it('should not add duplicate shared behaviors for any that have been renamed', () => {
      const projectState = {
        blocks: {
          blocks: [
            {
              type: 'when_run',
            },
            {
              type: 'behavior_definition',
              extraState: {
                procedureId: 'procedure1',
                behaviorId: 'walking',
                userCreated: true,
              },
            },
          ],
        },
        procedures: [{id: 'procedure1', name: 'moseying'}],
      };

      const updatedState = appendProceduresToState(
        projectState,
        sharedBehaviorsState
      );

      expect(updatedState.blocks.blocks).to.have.lengthOf(3);
      expect(updatedState.procedures).to.have.lengthOf(2);
    });
  });
});
