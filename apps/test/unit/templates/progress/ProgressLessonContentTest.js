import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgressLessonContent from '@cdo/apps/templates/progress/ProgressLessonContent';
import {fakeLevels} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLessonContent', function () {
  it('renders no levels warning when there are no levels', () => {
    const wrapper = shallow(
      <ProgressLessonContent levels={[]} disabled={false} />
    );
    expect(wrapper.find('span').length).toEqual(1);
  });

  it('renders without errors when there are levels', () => {
    const wrapper = shallow(
      <ProgressLessonContent levels={fakeLevels(3)} disabled={false} />
    );
    expect(wrapper.exists()).toBe(true);
  });
});
