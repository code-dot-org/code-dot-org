import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import ProgressLessonContent from '@cdo/apps/templates/progress/ProgressLessonContent';
import {fakeLevels} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLessonContent', function() {
  it('renders a bubble set (with no pill) when there is a single unnamed progression', () => {
    const wrapper = shallow(
      <ProgressLessonContent
        levels={fakeLevels(3, {named: false})}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('Connect(ProgressBubbleSet)').length, 1);
  });

  it('renders a ProgressLevelSet when there is a single named progression', () => {
    const wrapper = shallow(
      <ProgressLessonContent
        levels={fakeLevels(3).map(level => ({
          ...level,
          progression: 'Progression'
        }))}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('Connect(ProgressLevelSet)').length, 1);
  });

  it('renders a ProgressLevelSet for each progression when there are multiple progressions', () => {
    const wrapper = shallow(
      <ProgressLessonContent levels={fakeLevels(3)} disabled={false} />
    );

    assert.equal(wrapper.find('Connect(ProgressLevelSet)').length, 3);
  });
});
