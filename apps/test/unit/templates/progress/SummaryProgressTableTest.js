import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedSummaryProgressTable as SummaryProgressTable} from '@cdo/apps/templates/progress/SummaryProgressTable';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('SummaryProgressTable', () => {
  const lessons = [
    fakeLesson('lesson1', 1),
    fakeLesson('lesson2', 2),
    fakeLesson('lesson3', 3),
    fakeLesson('lesson4', 4)
  ];

  const levelsByLesson = [
    fakeLevels(3),
    fakeLevels(3),
    fakeLevels(3),
    fakeLevels(3)
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
    assert.equal(rows.length, 4);

    assert.deepEqual(rows.map(row => row.props.dark), [
      false,
      true,
      false,
      true
    ]);
  });

  it('does not show hidden rows when viewing as student', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        groupedLesson={groupedLesson}
        lessonIsVisible={(lesson, viewAs) =>
          lesson.id !== 2 || viewAs === ViewType.Teacher
        }
      />
    );

    const rows = wrapper.find('tbody').props().children;
    assert.equal(rows.length, 3);
    // dark is still every other for non-hidden rows
    assert.deepEqual(rows.map(row => row.props.dark), [false, true, false]);
    assert.deepEqual(rows.map(row => row.props.lesson.id), [1, 3, 4]);
  });

  it('marks hidden rows as hidden when viewing as teacher', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        groupedLesson={groupedLesson}
        lessonIsVisible={(lesson, viewAs) =>
          lesson.id !== 2 || viewAs !== ViewType.Student
        }
      />
    );

    const rows = wrapper.find('tbody').props().children;
    assert.equal(rows.length, 4);
    // dark is still every other, though the "hiddenness" of the second row
    // will end up taking priority in determining the background color
    assert.deepEqual(rows.map(row => row.props.dark), [
      false,
      true,
      false,
      true
    ]);
    assert.deepEqual(rows.map(row => row.props.lesson.id), [1, 2, 3, 4]);
  });
});
