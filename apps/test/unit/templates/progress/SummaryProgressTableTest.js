import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {UnconnectedSummaryProgressTable as SummaryProgressTable} from '@cdo/apps/templates/progress/SummaryProgressTable';

describe('SummaryProgressTable', () => {
  const lessons = [
    fakeLesson('lesson1', 1),
    fakeLesson('lesson2', 2),
    fakeLesson('lesson3', 3),
    fakeLesson('lesson4', 4),
  ];

  const levelsByLesson = [
    fakeLevels(3),
    fakeLevels(3),
    fakeLevels(3),
    fakeLevels(3),
  ];

  const groupedLesson = {lessons, levelsByLesson};

  it('has every other row be light and dark', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        groupedLesson={groupedLesson}
        lessonIsVisible={() => true}
      />
    );
    const rows = wrapper.find('tbody').props().children;
    expect(rows.length).toEqual(4);

    expect(rows.map(row => row.props.dark)).toEqual([false, true, false, true]);
  });

  it('does not show hidden rows when viewing as participant', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        groupedLesson={groupedLesson}
        lessonIsVisible={(lesson, viewAs) =>
          lesson.id !== 2 || viewAs === ViewType.Instructor
        }
      />
    );

    const rows = wrapper.find('tbody').props().children;
    expect(rows.length).toEqual(3);
    // dark is still every other for non-hidden rows
    expect(rows.map(row => row.props.dark)).toEqual([false, true, false]);
    expect(rows.map(row => row.props.lesson.id)).toEqual([1, 3, 4]);
  });

  it('marks hidden rows as hidden when viewing as instructor', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        groupedLesson={groupedLesson}
        lessonIsVisible={(lesson, viewAs) =>
          lesson.id !== 2 || viewAs !== ViewType.Participant
        }
      />
    );

    const rows = wrapper.find('tbody').props().children;
    expect(rows.length).toEqual(4);
    // dark is still every other, though the "hiddenness" of the second row
    // will end up taking priority in determining the background color
    expect(rows.map(row => row.props.dark)).toEqual([false, true, false, true]);
    expect(rows.map(row => row.props.lesson.id)).toEqual([1, 2, 3, 4]);
  });
});
