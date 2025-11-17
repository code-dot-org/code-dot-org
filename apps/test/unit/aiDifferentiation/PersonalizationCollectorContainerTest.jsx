import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import PersonalizationCollectorContainer from '@cdo/apps/aiDifferentiation/personalization/PersonalizationCollectorContainer';
import * as teachingProfileApi from '@cdo/apps/aiDifferentiation/personalization/teachingProfileApi';
import * as aiEvaluationApi from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import i18n from '@cdo/locale';

// Mock the APIs
jest.mock('@cdo/apps/aiDifferentiation/personalization/teachingProfileApi');
jest.mock('@cdo/apps/aiEvaluation/aiEvaluationApi');

// Mock analyticsReporter
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

// Mock CSRF token
const mockCSRFToken = 'mock-csrf-token';
Object.defineProperty(document, 'querySelector', {
  value: jest.fn().mockReturnValue({
    getAttribute: jest.fn().mockReturnValue(mockCSRFToken),
  }),
  writable: true,
});

const defaultFetchResponse = {
  exists: false,
  data: null,
};

const existingDataResponse = {
  exists: true,
  data: {
    yearsTeaching: 5,
    selectedConfidence: 7,
    selectedGoals: ['Increase student engagement'],
    otherGoalText: '',
    classroomVision: 'A collaborative learning environment',
    selectedSupports: ['Step-by-step guides'],
    otherSupportText: '',
    challenge: 'Managing different skill levels',
    dateYearsTeachingSet: '2023-01-01T00:00:00.000Z',
  },
};

const mockMatchingProfileResponse = {
  matchingProfile: 'The Innovator',
};

describe('PersonalizationCollectorContainer', () => {
  let fetchStub;
  let saveTeachingProfileDataSpy;
  let matchTeachingProfileSpy;

  beforeEach(() => {
    // Mock fetch for loading existing data
    fetchStub = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(defaultFetchResponse),
    });

    // Mock API functions
    saveTeachingProfileDataSpy = jest
      .spyOn(teachingProfileApi, 'saveTeachingProfileData')
      .mockResolvedValue({});

    matchTeachingProfileSpy = jest
      .spyOn(aiEvaluationApi, 'matchTeachingProfile')
      .mockResolvedValue(mockMatchingProfileResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderDefault() {
    render(<PersonalizationCollectorContainer />);
  }

  async function renderAndWaitForLoad() {
    renderDefault();
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });
  }

  it('renders loading state initially', () => {
    renderDefault();
    screen.getByText('Loading...');
  });

  it('renders first question after loading', async () => {
    await renderAndWaitForLoad();

    // Show progress bar
    screen.getByText('Question 1 of 6');

    // Show first question (years teaching)
    screen.getByText("I've been teaching for");
    screen.getByText('years!');

    // Show navigation buttons
    screen.getByRole('button', {name: i18n.back()});
    screen.getByRole('button', {name: i18n.next()});
  });

  it('loads existing data when available', async () => {
    fetchStub.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(existingDataResponse),
    });

    await renderAndWaitForLoad();

    // Pre-populate the years teaching field
    screen.getByDisplayValue('5');
  });

  it('navigates through questions using next button', async () => {
    await renderAndWaitForLoad();

    // Start at question 1 (years teaching)
    screen.getByText('Question 1 of 6');
    screen.getByText("I've been teaching for");

    // Fill in years and go to next question
    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      // Step 1: show interstitial
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText(
        'You’ve found your rhythm! The perfect blend of experience and continued growth makes you an incredible educator.'
      );
    });

    await waitFor(() => {
      // Step 2: advance from interstitial to next question
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });

    // Show confidence question
    screen.getByText('Not confident at all');
    screen.getByText('Extremely confident');
  });

  it('navigates back to previous question using back button', async () => {
    await renderAndWaitForLoad();

    // Navigate to second question first
    const yearsInput = screen.getByRole('spinbutton');

    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      // Step 1: show interstitial
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText(
        'You’ve found your rhythm! The perfect blend of experience and continued growth makes you an incredible educator.'
      );
    });

    await waitFor(() => {
      // Step 2: advance from interstitial to next question
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });

    await waitFor(() => {
      // Go back to first question
      fireEvent.click(screen.getByRole('button', {name: i18n.back()}));
    });

    await waitFor(() => {
      screen.getByText('Question 1 of 6');
    });

    // Should be back on years teaching question
    screen.getByText("I've been teaching for");
  });

  it('saves data when advancing to next question', async () => {
    await renderAndWaitForLoad();

    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});

    const nextButton = screen.getByRole('button', {name: i18n.next()});
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(saveTeachingProfileDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          yearsTeaching: 3,
          dateYearsTeachingSet: expect.any(Date),
        })
      );
    });
  });

  it('handles confidence selection with segmented buttons', async () => {
    await renderAndWaitForLoad();

    // Navigate to confidence question
    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });

    // Show segmented buttons for confidence (0-10)
    screen.getByText('0');
    screen.getByText('5');
    screen.getByText('10');

    // Click on confidence level 8 and advance
    fireEvent.click(screen.getByText('8'));
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      expect(saveTeachingProfileDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedConfidence: 8,
        })
      );
    });
  });

  it('handles checkbox selections for goals', async () => {
    await renderAndWaitForLoad();

    // Navigate through to goals question (question 3)
    const yearsInput = screen.getByRole('spinbutton');

    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });

    fireEvent.click(screen.getByText('7'));
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 3 of 6');
    });

    // Go to goals question with checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Select a goal and advance
    fireEvent.click(checkboxes[0]);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      expect(saveTeachingProfileDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedGoals: expect.arrayContaining([expect.any(String)]),
        })
      );
    });
  });

  it('shows text field when "Other" is selected for goals', async () => {
    await renderAndWaitForLoad();

    // Navigate to goals question
    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });
    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });

    fireEvent.click(screen.getByText('7'));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      screen.getByText('Question 3 of 6');
    });

    // Find and select "Other" checkbox
    const otherCheckbox = screen.getByRole('checkbox', {name: /other/i});
    fireEvent.click(otherCheckbox);

    // Show text field for other goal (this is synchronous)
    screen.getByPlaceholderText('Please describe your other goal...');
  });

  it('completes full flow and shows results', async () => {
    await renderAndWaitForLoad();

    // Complete all questions quickly
    // Question 1: Years teaching
    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '5'}});

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    // Question 2: Confidence
    await waitFor(() => {
      screen.getByText('Question 2 of 6');
    });
    const confidenceButton = screen.getByText('7');
    fireEvent.click(confidenceButton);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    // Question 3: Goals
    await waitFor(() => {
      screen.getByText('Question 3 of 6');
    });
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    // Question 4: Classroom vision
    await waitFor(() => {
      screen.getByText('Question 4 of 6');
    });
    const visionTextarea = screen.getByRole('textbox');
    fireEvent.change(visionTextarea, {
      target: {value: 'A collaborative environment'},
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    // Question 5: Support preferences
    await waitFor(() => {
      screen.getByText('Question 5 of 6');
    });
    const supportCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(supportCheckbox);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    // Question 6: Challenge
    await waitFor(() => {
      screen.getByText('Question 6 of 6');
    });
    const challengeTextarea = screen.getByRole('textbox');
    fireEvent.change(challengeTextarea, {
      target: {value: 'Managing different skill levels'},
    });

    // Final submission
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      expect(matchTeachingProfileSpy).toHaveBeenCalled();
      expect(saveTeachingProfileDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          matchedPersona: 'The Innovator',
        })
      );
    });

    // Show results
    await waitFor(() => {
      expect(screen.queryByText('Question 6 of 6')).toBeNull();
      // Progress bar should be hidden when showing results
      expect(screen.queryByText('Question 1 of 6')).toBeNull();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    fetchStub.mockRejectedValue(new Error('API Error'));

    renderDefault();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load existing teaching profile data:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('shows saving state on next button', async () => {
    saveTeachingProfileDataSpy.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    await renderAndWaitForLoad();

    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      // Show saving state
      screen.getByRole('button', {name: i18n.saving()});
      expect(screen.getByRole('button', {name: i18n.saving()})).toBeDisabled();
    });
  });

  it('does not allow going back from first question', async () => {
    await renderAndWaitForLoad();

    screen.getByText('Question 1 of 6');

    const backButton = screen.getByRole('button', {name: i18n.back()});
    fireEvent.click(backButton);

    // Remain on first question (synchronous check)
    screen.getByText('Question 1 of 6');
    screen.getByText("I've been teaching for");
  });

  it('handles save error during navigation', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    saveTeachingProfileDataSpy.mockRejectedValue(new Error('Save failed'));

    renderDefault();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '3'}});

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save teaching profile data:',
        expect.any(Error)
      );
      // Navigate to next question despite save error
      screen.getByText('Question 2 of 6');
    });

    consoleSpy.mockRestore();
  });

  it('handles final save and match errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    saveTeachingProfileDataSpy.mockRejectedValue(
      new Error('Final save failed')
    );

    await renderAndWaitForLoad();

    // Navigate through all questions quickly
    const yearsInput = screen.getByRole('spinbutton');
    fireEvent.change(yearsInput, {target: {value: '5'}});

    for (let i = 0; i < 6; i++) {
      // const nextBtn = screen.getByRole('button', {name: /next|saving/i});

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', {name: /next|saving/i}));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', {name: /next|saving/i}));
      });

      if (i === 0) {
        // Confidence question
        await waitFor(() => {
          screen.getByText('Question 2 of 6');
        });
        fireEvent.click(screen.getByText('7'));
      } else if (i === 1) {
        // Goals question
        await waitFor(() => {
          screen.getByText('Question 3 of 6');
        });
        fireEvent.click(screen.getAllByRole('checkbox')[0]);
      } else if (i === 2) {
        // Vision question
        await waitFor(() => {
          screen.getByText('Question 4 of 6');
        });
        fireEvent.change(screen.getByRole('textbox'), {
          target: {value: 'Test vision'},
        });
      } else if (i === 3) {
        // Support question
        await waitFor(() => {
          screen.getByText('Question 5 of 6');
        });
        fireEvent.click(screen.getAllByRole('checkbox')[0]);
      } else if (i === 4) {
        // Challenge question
        await waitFor(() => {
          screen.getByText('Question 6 of 6');
        });
        fireEvent.change(screen.getByRole('textbox'), {
          target: {value: 'Test challenge'},
        });
      }
    }

    // Should show results despite errors
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in final step:',
        expect.any(Error)
      );
      // Should still show results page
      expect(screen.queryByText('Question 6 of 6')).toBeNull();
    });

    consoleSpy.mockRestore();
  });
});
