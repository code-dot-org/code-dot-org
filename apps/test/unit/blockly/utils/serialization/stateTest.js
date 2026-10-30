import {
  getCombinedSerialization,
  appendProceduresToState,
} from '@cdo/apps/blockly/utils/serialization/state';

describe('serialization state tests', () => {
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
});
