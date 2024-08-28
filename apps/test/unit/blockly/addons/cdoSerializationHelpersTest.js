import {
  addPositionsToState,
  getCombinedSerialization,
  insertCollider,
  isBlockAtEdge,
  isOverlapping,
  appendProceduresToState,
  partitionJsonBlocksByType,
} from '@cdo/apps/blockly/addons/cdoSerializationHelpers';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';

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

      expect(result).toEqual(mainSerialization);
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

      expect(result).toEqual(expected);
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
      expect(result).not.toBe(mainSerialization);
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
      expect(colliders).toEqual([
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
      expect(colliders).toEqual([
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
      expect(colliders).toEqual([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ]);
    });
  });

  describe('isBlockAtEdge', () => {
    const viewWidth = 515;
    const arbitraryCoordinates = {x: 20, y: 140};
    const defaultLTRCoordinates = {x: 0, y: 0};
    const defaultRTLCoordinates = {x: viewWidth, y: 0};

    let block, result;
    const workspaceLTR = {RTL: false, getMetrics: () => ({viewWidth})};
    const workspaceRTL = {RTL: true, getMetrics: () => ({viewWidth})};

    it('should return true for a block at (0, 0) on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => defaultLTRCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return true for a block at either x=0 or y=0 on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => ({
          x: defaultLTRCoordinates.x,
          y: arbitraryCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);

      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => ({
          x: arbitraryCoordinates.x,
          y: defaultLTRCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return false for a block at specific coordinates on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => arbitraryCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(false);
    });

    it('should return true for a block at the top-right corner of an RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => defaultRTLCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return true for a block at either x=width or y=0 on a RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => ({
          x: defaultRTLCoordinates.x,
          y: arbitraryCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);

      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => ({
          x: arbitraryCoordinates.x,
          y: defaultRTLCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return false for a block at specific coordinates of an RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => arbitraryCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(false);
    });
  });

  describe('isOverlapping', () => {
    it('should return true when colliders overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(true);
    });

    it('should return true when one collider is completely inside the other', () => {
      const collider1 = {x: 0, y: 0, width: 20, height: 20};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(true);
    });

    it('should return false when colliders only touch but do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 10, y: 10, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(false);
    });

    it('should return false when colliders do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 20, y: 20, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(false);
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
      expect(updatedState.blocks.blocks).toHaveLength(3);
      // Check if all associated procedures are added to the project
      expect(updatedState.procedures).toHaveLength(2);
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

      expect(updatedState.blocks.blocks).toHaveLength(3);
      expect(updatedState.procedures).toHaveLength(2);
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

      expect(updatedState.blocks.blocks).toHaveLength(3);
      expect(updatedState.procedures).toHaveLength(2);
    });
  });

  describe('partitionBlocksByType', () => {
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
});
