import {blockTypesIn} from '@cdo/apps/p5lab/spritelab/lab2/blockCatalog';
import {getCompleteToolboxDefinition} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/completeToolbox';
import {SUPPORTED_SHARED_BLOCK_TYPES} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/supportedSharedBlocks';
import {applyToolboxAdditions} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/toolboxAdditions';
import {ToolboxInfo} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/types';

// The supported half of a block pool, as installCustomBlocks would report it.
const POOL = {Pool: [...SUPPORTED_SHARED_BLOCK_TYPES]};

function offeredTypes(forToolboxEditing: boolean): Set<string> {
  return new Set(
    blockTypesIn(getCompleteToolboxDefinition(POOL, forToolboxEditing).contents)
  );
}

describe('getCompleteToolboxDefinition', () => {
  // Platform and Story are injected rather than authored, so nothing else
  // keeps their blocks in the complete toolbox.
  it('offers every block the injected categories use', () => {
    const bare: ToolboxInfo = {
      kind: 'categoryToolbox',
      contents: [{kind: 'category', name: 'Sprites', contents: []}],
    };
    const injected = blockTypesIn(applyToolboxAdditions(bare).contents);
    expect(injected.length).toBeGreaterThan(0);

    const offered = offeredTypes(false);
    expect(injected.filter(type => !offered.has(type))).toEqual([]);
  });

  it('leaves unsupported pool blocks out', () => {
    const offered = getCompleteToolboxDefinition(
      {Experimental: ['gamelab_setupScoreboard'], ...POOL},
      false
    );
    expect(blockTypesIn(offered.contents)).not.toContain(
      'gamelab_setupScoreboard'
    );
  });
});
