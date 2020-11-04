import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLevelSet', function() {
  it('has a pill and no bubbles for a single level', () => {
    const levels = fakeLevels(1);
    const wrapper = shallow(
      <ProgressLevelSet
        studentProgress={fakeProgressForLevels(levels)}
        name="My Level Name"
        levels={levels}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert.equal(wrapper.find('ProgressBubbleSet').length, 0);
    assert.equal(wrapper.find('ProgressPill').props().text, '1');
  });

  it('has a pill and bubbles when we have multiple levels', () => {
    const levels = fakeLevels(3);
    const wrapper = shallow(
      <ProgressLevelSet
        studentProgress={fakeProgressForLevels(levels)}
        name="My Progression Name"
        levels={levels}
        disabled={false}
      />
    );

    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert.equal(wrapper.find('ProgressBubbleSet').length, 1);
    assert.equal(wrapper.find('ProgressPill').props().text, '1-3');
  });

  it('renders a pill with no text when first level is unplugged', () => {
    const levels = [fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(
      level => ({...level, name: undefined})
    );
    const wrapper = shallow(
      <ProgressLevelSet
        studentProgress={fakeProgressForLevels(levels)}
        name={undefined}
        levels={levels}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').props().text, '');
  });

  it('renders a pill with no text when last level is unplugged', () => {
    const levels = [...fakeLevels(5), fakeLevel({isUnplugged: true})].map(
      level => ({...level, name: undefined})
    );
    const wrapper = shallow(
      <ProgressLevelSet
        studentProgress={fakeProgressForLevels(levels)}
        name={undefined}
        levels={levels}
        disabled={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').props().text, '');
  });
});
