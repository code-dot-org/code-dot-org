import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import RelatedLessons from '@cdo/apps/levelbuilder/lesson-editor/RelatedLessons';

describe('RelatedLessons', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      relatedLessons: [
        {
          unitTitle: 'Course A',
          versionYear: '2017',
          lockable: false,
          relativePosition: 3,
          id: 123,
          editUrl: '/lessons/123/edit',
        },
        {
          unitTitle: 'Express (2019)',
          versionYear: '2019',
          lockable: null,
          relativePosition: 2,
          id: 456,
          editUrl: '/lessons/456/edit',
        },
        {
          unitTitle: 'Course 1',
          lockable: null,
          relativePosition: 4,
          id: 789,
          editUrl: '/lessons/789/edit',
        },
      ],
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<RelatedLessons {...defaultProps} />);
    expect(wrapper.text()).toContain('Update Similar Lessons');
    expect(wrapper.text()).toContain(
      'The following lessons are similar to this one.'
    );

    const link1 = wrapper.find('a').at(0);
    expect(link1.props().href).toBe('/lessons/123/edit');
    expect(link1.text()).toBe('Course A - 2017 - Lesson 3');

    const link2 = wrapper.find('a').at(1);
    expect(link2.props().href).toBe('/lessons/456/edit');
    // Redundant version year is omitted
    expect(link2.text()).toBe('Express (2019) - Lesson 2');

    const link3 = wrapper.find('a').at(2);
    expect(link3.props().href).toBe('/lessons/789/edit');
    // Missing version year is omitted
    expect(link3.text()).toBe('Course 1 - Lesson 4');
  });
});
