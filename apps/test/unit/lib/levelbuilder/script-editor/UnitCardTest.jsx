import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedUnitCard as UnitCard} from '@cdo/apps/lib/levelbuilder/script-editor/UnitCard';

const defaultProps = {
  addGroup: () => {},
  levelKeyList: {},
  lessonGroups: [
    {
      key: 'lg-key',
      display_name: 'Display Name',
      position: 1,
      user_facing: true,
      lessons: [
        {
          id: 100,
          name: 'A',
          key: 'lesson-1',
          position: 1
        },
        {
          name: 'B',
          key: 'lesson-2',
          id: 101,
          position: 2
        }
      ]
    },
    {
      key: 'lg-key-2',
      display_name: 'Display Name 2',
      position: 2,
      user_facing: true,
      lessons: [
        {
          id: 100,
          key: 'lesson-3',
          name: 'A',
          position: 1
        },
        {
          name: 'B',
          key: 'lesson-4',
          id: 101,
          position: 2
        }
      ]
    }
  ]
};

describe('UnitCard', () => {
  it('displays UnitCard correctly', () => {
    let wrapper = shallow(<UnitCard {...defaultProps} />);
    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
  });
});
