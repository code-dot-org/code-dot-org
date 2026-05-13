import {render, screen} from '@testing-library/react';
import React from 'react';

import UnitCalendarGrid from '@cdo/apps/code-studio/components/progress/UnitCalendarGrid';

import {testLessonSchedule, testLessons} from './unitCalendarTestData';

describe('UnitCalendar', () => {
  it('creates lesson chunks for all of the pieces of the schedule across weeks', () => {
    render(
      <UnitCalendarGrid
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
        weekWidth={585}
      />
    );

    testLessonSchedule.forEach((week, ind) => {
      screen.getByText(`Week ${ind + 1}`);
      week.forEach(lesson => {
        screen.getByText(lesson.title);
      });
    });
  });
});
