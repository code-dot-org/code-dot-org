import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AiAssessmentFeedback from '@cdo/apps/templates/rubrics/AiAssessmentFeedback';
import AiAssessmentFeedbackContext from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';

describe('AiAssessmentFeedback', () => {
  const mockAiInfo = {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    aiConfidencePassFail: 2,
  };
  const props = {
    aiEvalInfo: mockAiInfo,
    aiFeedbackId: 1,
  };

  const defaultStatus = -1;
  const thumbsupval = 1;
  const thumbsdownval = 0;
  const mockSetAiFeedback = () => {};

  it('displays no checkboxes when neither thumb is selected', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: defaultStatus, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('Checkbox')).toHaveLength(0);
  });

  it('displays no checkboxes when thumbs up is selected', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: thumbsupval, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    expect(wrapper.find('Checkbox')).toHaveLength(0);
  });

  it('displays checkboxes when thumbs down is selected', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: thumbsdownval, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('Checkbox')).toHaveLength(4);
  });

  it('displays textbox when checkbox labelled "other" is selected', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: thumbsdownval, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    wrapper.find('Checkbox').at(3).find('input').first().simulate('change');
    expect(wrapper.find('textarea')).toHaveLength(1);
  });
});
