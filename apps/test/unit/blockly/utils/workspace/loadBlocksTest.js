import {moveHiddenBlocks} from '@cdo/apps/blockly/utils/workspace/loadBlocks';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

describe('moveHiddenBlocks', () => {
  it('should not move any blocks if none have the appropriate procedure type and none are invisible', () => {
    const source = {
      blocks: {
        blocks: [{type: 'when_run', id: 1}],
      },
      procedures: [],
    };

    const typesToHide = ['procedures_defnoreturn'];
    const result = moveHiddenBlocks(source, typesToHide);
    expect(result).to.deep.equal({
      mainSource: {
        blocks: {
          blocks: [{type: 'when_run', id: 1}],
        },
        procedures: [],
      },
      hiddenDefinitionSource: {blocks: {blocks: []}, procedures: []},
    });
  });

  it('should move all blocks if they all match a procedure type', () => {
    const source = {
      blocks: {
        blocks: [
          {
            type: 'procedures_defnoreturn',
            id: 1,
            extraState: {procedureId: 'a'},
          },
        ],
      },
      procedures: [{id: 'a'}],
    };

    const typesToHide = ['procedures_defnoreturn'];
    const result = moveHiddenBlocks(source, typesToHide);
    expect(result).to.deep.equal({
      mainSource: {blocks: {blocks: []}, procedures: [{id: 'a'}]},
      hiddenDefinitionSource: {
        blocks: {
          blocks: [
            {
              type: 'procedures_defnoreturn',
              id: 1,
              extraState: {procedureId: 'a'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      },
    });
  });

  it('should handle a mix of blocks to move and blocks not to move', () => {
    const source = {
      blocks: {
        blocks: [
          {type: 'when_run', id: 1},
          {
            type: 'gamelab_everyInterval',
            id: 2,
            extraState: {invisible: true},
          },
          {
            type: 'procedures_defnoreturn',
            id: 3,
            extraState: {procedureId: 'a'},
          },
        ],
      },
      procedures: [{id: 'a'}],
    };

    const typesToHide = ['procedures_defnoreturn'];
    const result = moveHiddenBlocks(source, typesToHide);
    expect(result).to.deep.equal({
      mainSource: {
        blocks: {blocks: [{type: 'when_run', id: 1}]},
        procedures: [{id: 'a'}],
      },
      hiddenDefinitionSource: {
        blocks: {
          blocks: [
            {
              type: 'gamelab_everyInterval',
              id: 2,
              extraState: {invisible: true},
            },
            {
              type: 'procedures_defnoreturn',
              id: 3,
              extraState: {procedureId: 'a'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      },
    });
  });

  it('should move the block but not the procedure model if a model with the procedure id does not exist', () => {
    const source = {
      blocks: {
        blocks: [
          {
            type: 'procedures_defnoreturn',
            id: 1,
            extraState: {procedureId: 'nonexistent'},
          },
        ],
      },
      procedures: [{id: 'a'}],
    };
    const procedureTypesToHide = ['procedures_defnoreturn'];
    const result = moveHiddenBlocks(source, procedureTypesToHide);
    expect(result).to.deep.equal({
      mainSource: {blocks: {blocks: []}, procedures: [{id: 'a'}]},
      hiddenDefinitionSource: {
        blocks: {
          blocks: [
            {
              type: 'procedures_defnoreturn',
              id: 1,
              extraState: {procedureId: 'nonexistent'},
            },
          ],
        },
        procedures: [],
      },
    });
  });

  it('should hide multiple procedure types', () => {
    const source = {
      blocks: {
        blocks: [
          {type: 'when_run', id: 1},
          {
            type: 'procedures_defnoreturn',
            id: 2,
            extraState: {procedureId: 'a'},
          },
          {
            type: 'behavior_definition',
            id: 3,
            extraState: {procedureId: 'b'},
          },
        ],
      },
      procedures: [{id: 'a'}, {id: 'b'}],
    };
    const procedureTypesToHide = [
      'procedures_defnoreturn',
      'behavior_definition',
    ];
    const result = moveHiddenBlocks(source, procedureTypesToHide);
    expect(result).to.deep.equal({
      mainSource: {
        blocks: {blocks: [{type: 'when_run', id: 1}]},
        procedures: [{id: 'a'}, {id: 'b'}],
      },
      hiddenDefinitionSource: {
        blocks: {
          blocks: [
            {
              type: 'procedures_defnoreturn',
              id: 2,
              extraState: {procedureId: 'a'},
            },
            {
              type: 'behavior_definition',
              id: 3,
              extraState: {procedureId: 'b'},
            },
          ],
        },
        procedures: [{id: 'a'}, {id: 'b'}],
      },
    });
  });
});
