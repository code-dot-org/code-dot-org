import {stripEditingLocks} from '@cdo/apps/p5lab/spritelab/lab2/scenesApi';

// The toolbox editor loads baked toolboxes through this strip. Delete locks
// are never authorable in toolbox mode and go everywhere; move locks are an
// authored toolbox feature on CHILD blocks and residue on roots.
describe('stripEditingLocks', () => {
  const source = {
    blocks: {
      blocks: [
        {
          type: 'spritelab2_whenRun',
          deletable: false,
          movable: false,
          next: {
            block: {
              type: 'gamelab_spriteSay',
              deletable: false,
              movable: false,
            },
          },
          inputs: {
            VALUE: {
              block: {type: 'math_number', deletable: false, movable: false},
              shadow: {type: 'math_number', deletable: false},
            },
          },
        },
        {type: 'gamelab_atTime', deletable: false, movable: false},
      ],
    },
  };

  it('drops delete locks everywhere and move locks on roots only', () => {
    // The strip returns WorkspaceSerialization; assert the input's shape
    // back so the assertions can reach into it without optional chains.
    const stripped = stripEditingLocks(source) as typeof source;
    const [hat, second] = stripped.blocks.blocks;

    expect(hat.deletable).toBeUndefined();
    expect(hat.movable).toBeUndefined();
    expect(second.deletable).toBeUndefined();
    expect(second.movable).toBeUndefined();

    // Children keep their authored move locks; delete locks still go.
    expect(hat.next!.block.deletable).toBeUndefined();
    expect(hat.next!.block.movable).toBe(false);
    expect(hat.inputs!.VALUE.block.deletable).toBeUndefined();
    expect(hat.inputs!.VALUE.block.movable).toBe(false);
    expect(hat.inputs!.VALUE.shadow!.deletable).toBeUndefined();
  });

  it('does not mutate its input', () => {
    stripEditingLocks(source);
    expect(source.blocks.blocks[0].deletable).toBe(false);
    expect(source.blocks.blocks[0].movable).toBe(false);
  });

  it('passes an empty source through', () => {
    expect(stripEditingLocks({})).toEqual({});
  });
});
