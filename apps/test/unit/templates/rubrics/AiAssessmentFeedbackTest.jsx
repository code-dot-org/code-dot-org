import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import AiAssessmentFeedbackContext from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import AiAssessmentFeedback from '@cdo/apps/templates/rubrics/AiAssessmentFeedback';

describe('AiAssessmentFeedback', () => {
  const mockAiInfo = {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    aiConfidencePassFail: 2,
  };
  const props = {
    aiEvalInfo: mockAiInfo,
  };

  const defaultStatus = -1;
  const thumbsupval = 1;
  const thumbsdownval = 0;
  const mockSetAiFeedback = () => {};

  it('displays no checkboxes when neither thumb is selected', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{defaultStatus, mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('Checkbox')).to.have.lengthOf(0);
  });

  it('displays no checkboxes when thumbs up is selected', () => {
    const wrapper = mount(<AiAssessmentFeedback {...props} />, {
      wrappingComponent: AiAssessmentFeedbackContext.Provider,
      wrappingComponentProps: {
        value: {aiFeedback: thumbsupval, setAiFeedback: mockSetAiFeedback},
      },
    });
    expect(wrapper.find('Checkbox')).to.have.lengthOf(0);
  });

  it('displays checkboxes when thumbs down is selected', () => {
    const wrapper = mount(<AiAssessmentFeedback {...props} />, {
      wrappingComponent: AiAssessmentFeedbackContext.Provider,
      wrappingComponentProps: {
        value: {aiFeedback: thumbsdownval, setAiFeedback: mockSetAiFeedback},
      },
    });
    expect(wrapper.find('Checkbox')).to.have.lengthOf(4);
  });

  it('displays textbox when checkbox labelled "other" is selected', () => {
    const wrapper = mount(<AiAssessmentFeedback {...props} />, {
      wrappingComponent: AiAssessmentFeedbackContext.Provider,
      wrappingComponentProps: {
        value: {aiFeedback: thumbsdownval, setAiFeedback: mockSetAiFeedback},
      },
    });
    wrapper.find('Checkbox').at(3).find('input').first().simulate('change');
    expect(wrapper.find('textarea')).to.have.lengthOf(1);
  });
});
