import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';

describe('LessonEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview'
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonEditor {...defaultProps} />);
    expect(wrapper.contains('Lesson Name'));
    expect(wrapper.contains('Lesson Overview'));
    expect(wrapper.find('ActivitiesEditor').length).to.equal(1);
  });
});
