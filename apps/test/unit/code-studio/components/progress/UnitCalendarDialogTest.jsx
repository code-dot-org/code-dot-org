import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarDialog from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';
import UnitCalendar from '@cdo/apps/code-studio/components/progress/UnitCalendar';

const testLessons = [
  {
    id: 1,
    title: 'Lesson 1',
    duration: 87,
    assessment: true,
    unplugged: false,
    url: 'https://www.google.com/'
  },
  {
    id: 2,
    title: 'Lesson 2',
    duration: 40,
    assessment: false,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 3,
    title: 'Lesson 3',
    duration: 135,
    assessment: true,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 4,
    title: 'Lesson 4',
    duration: 60,
    assessment: false,
    unplugged: false,
    url: 'https://www.google.com/'
  }
];

const testLessonsSchedule = [
  [
    {
      id: 1,
      title: 'Lesson 1',
      duration: 87,
      assessment: true,
      unplugged: false,
      isStart: true,
      isEnd: true,
      isMajority: true,
      url: 'https://www.google.com/'
    }
  ],
  [
    {
      id: 2,
      title: 'Lesson 2',
      duration: 40,
      assessment: false,
      unplugged: true,
      isStart: true,
      isEnd: true,
      isMajority: true,
      url: 'https://www.google.com/'
    },
    {
      id: 3,
      title: 'Lesson 3',
      duration: 50,
      assessment: true,
      unplugged: true,
      isStart: true,
      isEnd: false,
      isMajority: false,
      url: 'https://www.google.com/'
    }
  ],
  [
    {
      id: 3,
      title: 'Lesson 3',
      duration: 85,
      assessment: true,
      unplugged: true,
      isStart: false,
      isEnd: true,
      isMajority: true,
      url: 'https://www.google.com/'
    }
  ],
  [
    {
      id: 4,
      title: 'Lesson 4',
      duration: 60,
      assessment: false,
      unplugged: false,
      isStart: true,
      isEnd: true,
      isMajority: true,
      url: 'https://www.google.com/'
    }
  ]
];

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
