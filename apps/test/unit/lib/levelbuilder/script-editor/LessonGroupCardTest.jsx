import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedLessonGroupCard as LessonGroupCard} from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupCard';

const defaultProps = {
  lessonGroupsCount: 1,
  addLesson: () => {},
  moveGroup: () => {},
  removeGroup: () => {},
  moveLesson: () => {},
  removeLesson: () => {},
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
        key: 'lesson-1'
      },
      {
        name: 'B',
        id: 101,
        position: 2,
        key: 'lesson-2'
      }
    ]
  }
};

describe('LessonGroupCard', () => {
  it('displays LessonGroupCard correctly', () => {
    let wrapper = shallow(<LessonGroupCard {...defaultProps} />);
    expect(wrapper.find('OrderControls')).to.have.lengthOf(1);
    expect(wrapper.find('LessonToken')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
  });
});
