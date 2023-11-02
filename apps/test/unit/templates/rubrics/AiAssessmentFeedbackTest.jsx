import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import AiAssessmentFeedback from '@cdo/apps/templates/rubrics/AiAssessmentFeedback';

describe('AiAssessmentFeedback', () => {
  const props = {
    learningGoalKey: 'learning_key',
  };

  it('displays checkboxes when thumbs down is clicked', () => {
    const wrapper = shallow(<AiAssessmentFeedback {...props} />);
    wrapper.find('input').at(1).simulate('change');
    expect(wrapper.find('Checkbox')).to.have.lengthOf(4);
  });

  it('displays textbox when checkbox labelled "other" is selected', () => {
    const wrapper = shallow(<AiAssessmentFeedback {...props} />);
    wrapper.find('input').at(1).simulate('change');
    wrapper.find('Checkbox').at(3).simulate('change');
    expect(wrapper.find('textarea')).to.have.lengthOf(1);
  });
});
