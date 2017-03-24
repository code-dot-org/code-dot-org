import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLevelSet', function () {
  it('has a pill and no bubbles for a single level', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        start={1}
        name="My Level Name"
        levels={fakeLevels(1)}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('a').length, 2, "One anchor for pill, one for description");
    assert.equal(wrapper.find('ProgressBubbleSet').length, 0);
  });

  it('has a pill and bubbles when we have multiple levels', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        start={1}
        name="My Progression Name"
        levels={fakeLevels(3)}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('a').length, 2, "One anchor for pill, one for description");
    assert.equal(wrapper.find('ProgressBubbleSet').length, 1);
  });

});
