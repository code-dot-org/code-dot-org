import {render, screen} from '@testing-library/react';
import React from 'react';

import AiAssessmentFeedback from '@cdo/apps/templates/rubrics/AiAssessmentFeedback';
import AiAssessmentFeedbackContext, {
  NO_FEEDBACK,
  THUMBS_DOWN,
  THUMBS_UP,
} from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';

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

  const mockSetAiFeedback = () => {};

  it('displays no checkboxes when neither thumb is selected', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('displays no checkboxes when thumbs up is selected', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: THUMBS_UP, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('displays checkboxes when thumbs down is selected', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: THUMBS_DOWN, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(4);
  });

  it('displays textbox when checkbox labelled "other" is selected', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: THUMBS_DOWN, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentFeedback {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Other'});
    checkbox.click();
    expect(screen.queryAllByRole('textbox')).toHaveLength(1);
  });
});
