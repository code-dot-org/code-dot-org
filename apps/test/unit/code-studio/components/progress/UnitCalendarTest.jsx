import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendar from '@cdo/apps/code-studio/components/progress/UnitCalendar';
import {testLessonsSchedule} from './unitCalendarTestData';

describe('UnitCalendar', () => {
  it('creates lesson chunks for all of the pieces of the schedule across weeks', () => {
    const wrapper = shallow(
      <UnitCalendar
        schedule={testLessonsSchedule}
        weeklyInstructionalMinutes={90}
      />
    );
    expect(wrapper.find('UnitCalendarLessonChunk').length).to.equal(5);
  });
});
