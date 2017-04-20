import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import { fakeLevels, fakeLevel } from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLevelSet', function () {
  it('has a pill and no bubbles for a single level', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name="My Level Name"
        levels={fakeLevels(1)}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert.equal(wrapper.find('ProgressBubbleSet').length, 0);
    assert.equal(wrapper.find('ProgressPill').props().text, '1');
  });

  it('has a pill and bubbles when we have multiple levels', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name="My Progression Name"
        levels={fakeLevels(3)}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert.equal(wrapper.find('ProgressBubbleSet').length, 1);
    assert.equal(wrapper.find('ProgressPill').props().text, '1-3');
  });

  it('renders a pill with no text when first level is unplugged', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name={undefined}
        levels={[
          fakeLevel({isUnplugged: true}),
          ...fakeLevels(5)
        ].map(level => ({...level, name: undefined }))}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').props().text, '');
  });

  it('renders a pill with no text when last level is unplugged', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name={undefined}
        levels={[
          ...fakeLevels(5),
          fakeLevel({isUnplugged: true}),
        ].map(level => ({...level, name: undefined }))}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').props().text, '');
  });

});
