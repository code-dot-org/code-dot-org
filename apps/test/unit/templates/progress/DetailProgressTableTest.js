import { assert } from '../../../util/configuredChai';
import _ from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';
import { DetailProgressTable } from '@cdo/apps/templates/progress/DetailProgressTable';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import Immutable from 'immutable';

describe('DetailProgressTable', () => {
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

  it('marks hidden lessons as hidden when viewing as teacher', () => {
    const wrapper = shallow(
      <DetailProgressTable
        lessons={lessons}
        levelsByLesson={levelsByLesson}
        viewAs={ViewType.Teacher}
        sectionId={'11'}
        hiddenStageState={Immutable.fromJS({
          bySection: {
            '11': {
              '2': true
            }
          }
        })}
      />
    );

    const rows = wrapper.props().children;
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.map(row => row.props.hiddenForStudents), [false, true, false, false]);
  });
});
