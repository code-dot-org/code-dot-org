import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import {handleUpdateSectionAiChallengeEnabled} from '@cdo/apps/aichat/accessControlsApi';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types';
import AiChatAccessControls from '@cdo/apps/aichat/views/accessControls/AiChatAccessControls';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/accessControlsApi', () => ({
  handleUpdateSectionAiChatAccessLevel: jest.fn(),
  handleUpdateSectionAiChallengeEnabled: jest.fn(),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const updateChallengeEnabled =
  handleUpdateSectionAiChallengeEnabled as jest.Mock;

const SECTION_ID = 11;

function renderControls({
  aiChatAccessLevel = AiChatAccessLevels.ENABLED,
  lessonTutorAvailable = true,
  aiChallengeEnabled = false,
}: {
  aiChatAccessLevel?: AiChatAccessLevel;
  lessonTutorAvailable?: boolean;
  aiChallengeEnabled?: boolean;
} = {}) {
  const store = getStore();
  store.dispatch(
    setInitialData({id: 1, ai_chat_access_level: AiChatAccessLevels.ENABLED})
  );
  store.dispatch(
    setSections([
      {
        id: SECTION_ID,
        name: 'Period 1',
        grades: [],
        ai_chat_access_level: aiChatAccessLevel,
        ai_challenge_enabled: aiChallengeEnabled,
        lesson_tutor_available: lessonTutorAvailable,
      },
    ])
  );
  store.dispatch(selectSection(SECTION_ID));
  render(
    <Provider store={store}>
      <AiChatAccessControls />
    </Provider>
  );
  return store;
}

const challengeToggle = () =>
  screen.queryByRole('checkbox', {name: 'AI Tutor+ Challenges'});

describe('AiChatAccessControls AI Tutor+ Challenges toggle', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser, teacherSections});
    updateChallengeEnabled.mockReset();
  });

  afterEach(() => {
    restoreRedux();
  });

  it('shows when AI chat is enabled and the course has the lesson tutor', () => {
    renderControls();
    expect(challengeToggle()).not.toBeChecked();
  });

  it('is hidden when AI chat is essential only', () => {
    renderControls({aiChatAccessLevel: AiChatAccessLevels.ESSENTIAL_ONLY});
    expect(challengeToggle()).not.toBeInTheDocument();
  });

  it('is hidden when the course does not have the lesson tutor', () => {
    renderControls({lessonTutorAvailable: false});
    expect(challengeToggle()).not.toBeInTheDocument();
  });

  it('saves the new value and updates the section', async () => {
    updateChallengeEnabled.mockResolvedValue(undefined);
    const store = renderControls();

    fireEvent.click(challengeToggle()!);

    expect(updateChallengeEnabled).toHaveBeenCalledWith(SECTION_ID, true);
    await waitFor(() =>
      expect(
        store.getState().teacherSections.sections[SECTION_ID].aiChallengeEnabled
      ).toBe(true)
    );
    expect(challengeToggle()).toBeChecked();
  });

  it('reverts when the save fails', async () => {
    updateChallengeEnabled.mockRejectedValue(new Error('failed'));
    renderControls({aiChallengeEnabled: true});

    fireEvent.click(challengeToggle()!);

    await waitFor(() => expect(challengeToggle()).toBeChecked());
    expect(updateChallengeEnabled).toHaveBeenCalledWith(SECTION_ID, false);
  });
});
