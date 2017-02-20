import { assert } from '../../../util/configuredChai';
import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';
import { SummaryProgressTable } from '@cdo/apps/templates/progress/SummaryProgressTable';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import Immutable from 'immutable';

describe('SummaryProgressTable', () => {
  const fakeLesson = (name, id) => ({name, id});
  const fakeLevels = numLevels => _.range(numLevels).map(index => ({
    status: LevelStatus.not_tried,
    url: `/level${index}`,
    name: `Level ${index}`
  }));

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
    fakeLevels(3)
  ];

  it('has every other row be light and dark', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        lessons={lessons}
        levelsByLesson={levelsByLesson}
        viewAs={ViewType.Student}
        sectionId={'11'}
        hiddenStageMap={Immutable.fromJS({})}
      />
    );
    const rows = wrapper.find('tbody').props().children;
    assert.equal(rows.length, 4);

    assert.deepEqual(rows.map(row => row.props.dark), [false, true, false, true]);
    assert.deepEqual(rows.map(row => row.props.hiddenForStudents), [false, false, false, false]);
  });

  it('does not show hidden rows when viewing as student', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        lessons={lessons}
        levelsByLesson={levelsByLesson}
        viewAs={ViewType.Student}
        sectionId={'11'}
        hiddenStageMap={Immutable.fromJS({
          '11': {
            '2': false
          }
        })}
      />
    );

    const rows = wrapper.find('tbody').props().children;
    assert.equal(rows.length, 3);
    // dark is still every other for non-hidden rows
    assert.deepEqual(rows.map(row => row.props.dark), [false, true, false]);
    assert.deepEqual(rows.map(row => row.props.hiddenForStudents), [false, false, false]);
  });

  it('marks hidden rows as hidden when viewing as teacher', () => {
    const wrapper = shallow(
      <SummaryProgressTable
        lessons={lessons}
        levelsByLesson={levelsByLesson}
        viewAs={ViewType.Teacher}
        sectionId={'11'}
        hiddenStageMap={Immutable.fromJS({
          '11': {
            '2': true
          }
        })}
      />
    );

    const rows = wrapper.find('tbody').props().children;
    assert.equal(rows.length, 4);
    // dark is still every other, though it will be overriden by hiddenForStudents
    // in the case of the second row
    assert.deepEqual(rows.map(row => row.props.dark), [false, true, false, true]);
    assert.deepEqual(rows.map(row => row.props.hiddenForStudents), [false, true, false, false]);
  });
});
