import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import {fakeLesson} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('DetailProgressTable', () => {
  const lessons = [
    fakeLesson('lesson1', 1),
    fakeLesson('lesson2', 2),
    fakeLesson('lesson3', 3),
    fakeLesson('lesson4', 4)
  ];

  it('has ProgressLesson for each lesson', () => {
    const wrapper = shallow(<DetailProgressTable lessons={lessons} />);
    const rows = wrapper.props().children;
    assert.equal(rows.length, 4);
  });
});
