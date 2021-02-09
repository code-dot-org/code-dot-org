import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarDialog from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';
import UnitCalendar from '@cdo/apps/code-studio/components/progress/UnitCalendar';
import {testLessonsSchedule, testLessons} from './unitCalendarTestData';

describe('UnitCalendarDialog', () => {
  it('makes a schedule based on the lessons and weekly instructional minutes', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendar
          schedule={testLessonsSchedule}
          weeklyInstructionalMinutes={90}
        />
      )
    ).to.be.true;
  });
});
