import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import {
  fakeLesson,
  fakeLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('DetailProgressTable', () => {
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

  it('has ProgressLesson for each lesson', () => {
    const wrapper = shallow(
      <DetailProgressTable groupedLesson={groupedLesson} />
    );

    const rows = wrapper.props().children;
    assert.equal(rows.length, 4);
  });

  it('throws if passed mismatched props', () => {
    assert.throws(() =>
      shallow(
        <DetailProgressTable
          groupedLesson={{
            ...groupedLesson,
            levelsByLesson: levelsByLesson.slice(1)
          }}
        />
      )
    );
  });
});
