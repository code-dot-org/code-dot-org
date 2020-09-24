import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedLessonGroups as LessonGroups} from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroups';

const defaultProps = {
  addGroup: () => {},
  lessonGroups: [
    {
      key: 'lg-key',
      display_name: 'Display Name',
      position: 1,
      user_facing: false,
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
  ],
  levelKeyList: {
    1: 'level 1',
    2: 'level 2',
    3: 'level 3',
    4: 'level 4',
    5: 'level 5',
    6: 'level 6'
  }
};

describe('LessonGroups', () => {
  it('displays correct lesson groups and add lesson group button when not addingLessonGroup', () => {
    let wrapper = shallow(<LessonGroups {...defaultProps} />);

    wrapper.setState({
      addingLessonGroup: false,
      targetLessonPos: null
    });

    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(1);
    expect(wrapper.find('button')).to.have.lengthOf(1);
  });

  it('displays place to add lesson group if clicked add lesson group', () => {
    let wrapper = shallow(<LessonGroups {...defaultProps} />);

    wrapper.setState({
      addingLessonGroup: true,
      targetLessonPos: null
    });

    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(1);
    expect(wrapper.find('Connect(NewLessonGroupInput)')).to.have.lengthOf(1);
  });
});
