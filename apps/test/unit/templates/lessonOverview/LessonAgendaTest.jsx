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
              scriptLevels: []
            },
            {
              key: 'section-2',
              displayName: '',
              scriptLevels: [{id: 10}]
            },
            {
              key: 'section-3',
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
              displayName: 'Section 4',
              scriptLevels: [{id: 11}]
            },
            {
              key: 'section-5',
              displayName: '',
              scriptLevels: []
            },
            {
              key: 'section-6',
              displayName: 'Section 6',
              scriptLevels: []
            }
          ]
        }
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonAgenda {...defaultProps} />);
    expect(wrapper.find('a').length).to.equal(6);

    expect(
      wrapper
        .find('a')
        .at(0)
        .props().href
    ).to.equal('#activity-activity-1');
    expect(
      wrapper
        .find('a')
        .at(0)
        .contains('Main Activity (20 minutes)')
    ).to.be.true;

    expect(
      wrapper
        .find('a')
        .at(1)
        .props().href
    ).to.equal('#activity-section-section-1');
    expect(
      wrapper
        .find('a')
        .at(2)
        .props().href
    ).to.equal('#activity-section-section-3');

    expect(
      wrapper
        .find('a')
        .at(3)
        .props().href
    ).to.equal('#activity-activity-2');
    expect(
      wrapper
        .find('a')
        .at(3)
        .contains('2nd Activity (30 minutes)')
    ).to.be.true;

    expect(
      wrapper
        .find('a')
        .at(4)
        .props().href
    ).to.equal('#activity-section-section-4');

    expect(
      wrapper
        .find('a')
        .at(5)
        .props().href
    ).to.equal('#activity-section-section-6');
  });
});
