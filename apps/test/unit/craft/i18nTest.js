import {assert} from '../../util/reconfiguredChai';

// we have to include the base locale file so the craft-specific one will work,
// even though we don't need to use the base locale directly in this test.
// eslint-disable-next-line no-unused-vars
import commonI18n from '@cdo/locale';
import craftI18n from '@cdo/apps/craft/locale';
import {blockTypesToDropdownOptions} from '@cdo/apps/craft/utils';

describe('Minecraft Internationalization', () => {
  it('provides a user-friendly name for a block when possible', () => {
    const blockType = 'wool_blue';
    const results = blockTypesToDropdownOptions([blockType]);
    const displayName = results[0][0];
    assert.equal(displayName, 'blue wool');
  });

  it('translates blocks when a translation exists', () => {
    const blockType = 'rail';
    const results = blockTypesToDropdownOptions([blockType]);
    const displayName = results[0][0];
    assert.equal(displayName, craftI18n.blockTypeRail());
  });

  it('defaults to blockType when no translation exists', () => {
    const blockType = 'some_block_type_that_will_never_ever_exist';
    const results = blockTypesToDropdownOptions([blockType]);
    assert.deepEqual(results, [[blockType, blockType]]);
  });
});
