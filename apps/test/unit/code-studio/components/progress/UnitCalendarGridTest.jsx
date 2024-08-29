import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitCalendarGrid from '@cdo/apps/code-studio/components/progress/UnitCalendar';

import {testLessonSchedule, testLessons} from './unitCalendarTestData';

describe('UnitCalendar', () => {
  it('creates lesson chunks for all of the pieces of the schedule across weeks', () => {
    const wrapper = shallow(
      <UnitCalendarGrid
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
        weekWidth={585}
      />
    );
    expect(wrapper.instance().generateSchedule()).toEqual(testLessonSchedule);
    expect(wrapper.find('UnitCalendarLessonChunk').length).toBe(5);
  });
});
