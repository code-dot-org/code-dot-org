import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendar from '@cdo/apps/code-studio/components/progress/UnitCalendar';
import {testLessonSchedule, testLessons} from './unitCalendarTestData';

describe('UnitCalendar', () => {
  it('creates lesson chunks for all of the pieces of the schedule across weeks', () => {
    const wrapper = shallow(
      <UnitCalendar
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
        weekWidth={585}
      />
    );
    expect(wrapper.instance().generateSchedule()).to.deep.equal(
      testLessonSchedule
    );
    expect(wrapper.find('UnitCalendarLessonChunk').length).to.equal(5);
  });
});
