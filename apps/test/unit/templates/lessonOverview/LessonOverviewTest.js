import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';

describe('LessonOverview', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview'
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    expect(wrapper.contains('Lesson Name'));
    expect(wrapper.contains('Lesson Overview'));
  });
});
