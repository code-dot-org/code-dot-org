import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import LessonInsightFeedback from '@cdo/apps/templates/studentSnapshot/lessonInsightWidget/LessonInsightFeedback';
import {submitLessonInsightFeedback} from '@cdo/apps/templates/studentSnapshot/lessonInsightWidget/lessonInsightFeedbackApi';

jest.mock(
  '@cdo/apps/templates/studentSnapshot/lessonInsightWidget/lessonInsightFeedbackApi'
);
const mockSubmit = submitLessonInsightFeedback as jest.MockedFunction<
  typeof submitLessonInsightFeedback
>;

describe('LessonInsightFeedback', () => {
  const ids = {unitId: 1, lessonId: 2, studentId: 3, sectionId: 4};

  beforeEach(() => {
    jest.clearAllMocks();
    render(<LessonInsightFeedback {...ids} />);
  });

  it('prompts for feedback with neither thumb selected', () => {
    screen.getByText('Was this helpful?');
    expect(screen.getByLabelText('Helpful')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByLabelText('Not helpful')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('submits and selects thumbs up', () => {
    fireEvent.click(screen.getByLabelText('Helpful'));

    expect(screen.getByLabelText('Helpful')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(mockSubmit).toHaveBeenCalledWith({...ids, thumbsUp: true});
  });

  it('switches from thumbs up to thumbs down', () => {
    fireEvent.click(screen.getByLabelText('Helpful'));
    fireEvent.click(screen.getByLabelText('Not helpful'));

    expect(screen.getByLabelText('Helpful')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByLabelText('Not helpful')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(mockSubmit).toHaveBeenLastCalledWith({...ids, thumbsUp: false});
  });

  it('clears the rating when the selected thumb is clicked again', () => {
    fireEvent.click(screen.getByLabelText('Not helpful'));
    fireEvent.click(screen.getByLabelText('Not helpful'));

    expect(screen.getByLabelText('Not helpful')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(mockSubmit).toHaveBeenLastCalledWith({...ids, thumbsUp: null});
  });
});
