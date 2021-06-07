import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonAgenda from '@cdo/apps/templates/lessonOverview/LessonAgenda';

describe('LessonAgenda', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activities: [
        {
          key: 'activity-1',
          displayName: 'Main Activity',
          duration: 20,
          activitySections: [
            {
              key: 'section-1',
              displayName: 'Making programs',
              duration: 20,
              scriptLevels: []
            },
            {
              key: 'section-2',
              displayName: '',
              duration: 0,
              scriptLevels: [{id: 10}]
            },
            {
              key: 'section-3',
              duration: 10,
              displayName: 'Non Programming Progression',
              scriptLevels: []
            }
          ]
        },
        {
          key: 'activity-2',
          displayName: '2nd Activity',
          duration: 30,
          activitySections: [
            {
              key: 'section-4',
              duration: 0,
              displayName: 'Section 4',
              scriptLevels: [{id: 11}]
            },
            {
              key: 'section-5',
              duration: 0,
              displayName: '',
              scriptLevels: []
            },
            {
              key: 'section-6',
              duration: 0,
              displayName: 'Section 6',
              scriptLevels: []
            }
          ]
        }
      ]
    };
  });

  it('Display correct information for agenda', () => {
    const wrapper = shallow(<LessonAgenda {...defaultProps} />);

    expect(wrapper.text()).to.include('Main Activity (20 minutes)');
    expect(wrapper.text()).to.include('Making programs (20 minutes)');
    expect(wrapper.text()).to.include('Non Programming Progression');
    expect(wrapper.text()).to.include('2nd Activity (30 minutes)');
  });
});
