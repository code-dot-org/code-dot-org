import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import RelatedLessons from '@cdo/apps/lib/levelbuilder/lesson-editor/RelatedLessons';

describe('RelatedLessons', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      relatedLessons: [
        {
          scriptTitle: 'Course A',
          versionYear: '2017',
          lockable: false,
          relativePosition: 3,
          id: 123,
          editUrl: '/lessons/123/edit'
        },
        {
          scriptTitle: 'Express (2019)',
          versionYear: '2019',
          lockable: null,
          relativePosition: 2,
          id: 456,
          editUrl: '/lessons/456/edit'
        },
        {
          scriptTitle: 'Course 1',
          lockable: null,
          relativePosition: 4,
          id: 789,
          editUrl: '/lessons/789/edit'
        }
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<RelatedLessons {...defaultProps} />);
    expect(wrapper.text()).to.include('Update Similar Lessons');
    expect(wrapper.text()).to.include(
      'The following lessons are similar to this one.'
    );

    const link1 = wrapper.find('a').at(0);
    expect(link1.props().href).to.equal('/lessons/123/edit');
    expect(link1.text()).to.equal('Course A - 2017 - Lesson 3');

    const link2 = wrapper.find('a').at(1);
    expect(link2.props().href).to.equal('/lessons/456/edit');
    // Redundant version year is omitted
    expect(link2.text()).to.equal('Express (2019) - Lesson 2');

    const link3 = wrapper.find('a').at(2);
    expect(link3.props().href).to.equal('/lessons/789/edit');
    // Missing version year is omitted
    expect(link3.text()).to.equal('Course 1 - Lesson 4');
  });
});
