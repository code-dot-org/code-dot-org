import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedProgressLessonContent as ProgressLessonContent} from '@cdo/apps/templates/progress/ProgressLessonContent';
import {
  fakeLevels,
  fakeProgressForLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLessonContent', function() {
  it('renders a bubble set (with no pill) when there is a single unnamed progression', () => {
    const levels = fakeLevels(3, {named: false});
    const wrapper = shallow(
      <ProgressLessonContent
        studentProgress={fakeProgressForLevels(levels)}
        levels={levels}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressBubbleSet').length, 1);
  });

  it('renders a ProgressLevelSet when there is a single named progression', () => {
    const levels = fakeLevels(3).map(level => ({
      ...level,
      progression: 'Progression'
    }));
    const wrapper = shallow(
      <ProgressLessonContent
        studentProgress={fakeProgressForLevels(levels)}
        levels={levels}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressLevelSet').length, 1);
  });

  it('renders a ProgressLevelSet for each progression when there are multiple progressions', () => {
    const levels = fakeLevels(3);
    const wrapper = shallow(
      <ProgressLessonContent
        studentProgress={fakeProgressForLevels(levels)}
        levels={fakeLevels(3)}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressLevelSet').length, 3);
  });
});
