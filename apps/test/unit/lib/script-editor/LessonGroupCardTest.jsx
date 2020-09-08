import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedLessonGroupCard as LessonGroupCard} from '@cdo/apps/lib/script-editor/LessonGroupCard';

const defaultProps = {
  lessonGroupsCount: 1,
  setLessonMetrics: () => {},
  setTargetLesson: () => {},
  targetLessonPos: 1,
  lessonMetrics: {},
  addLesson: () => {},
  moveGroup: () => {},
  removeGroup: () => {},
  convertGroupToUserFacing: () => {},
  lessonGroup: {
    key: 'lg-key',
    display_name: 'Display Name',
    position: 1,
    user_facing: true,
    lessons: [
      {
        id: 100,
        name: 'A',
        position: 1,
        levels: [
          {
            ids: [1],
            position: 1,
            activeId: 1
          },
          {
            ids: [4],
            position: 2,
            activeId: 4
          },
          {
            ids: [5],
            position: 3,
            activeId: 5
          },
          {
            ids: [6],
            position: 4,
            activeId: 6
          }
        ]
      },
      {
        name: 'B',
        id: 101,
        position: 2,
        levels: [
          {
            ids: [2, 3],
            position: 1,
            activeId: 3
          }
        ]
      }
    ]
  }
};

describe('LessonGroupCard', () => {
  it('displays LessonGroupCard correctly', () => {
    let wrapper = shallow(<LessonGroupCard {...defaultProps} />);
    expect(wrapper.find('OrderControls')).to.have.lengthOf(1);
    expect(wrapper.find('Connect(UnconnectedLessonCard)')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
  });
});
