import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import {handleUpdateSectionAiChallengeEnabled} from '@cdo/apps/aichat/accessControlsApi';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types';
import AiChatAccessControls from '@cdo/apps/aichat/views/accessControls/AiChatAccessControls';
import DCDO from '@cdo/apps/dcdo';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
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
import experiments from '@cdo/apps/util/experiments';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/accessControlsApi', () => ({
  handleUpdateSectionAiChatAccessLevel: jest.fn(),
  handleUpdateSectionAiChallengeEnabled: jest.fn(),
}));

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {
    get: jest.fn((_key: string, defaultValue: unknown) => defaultValue),
  },
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const updateChallengeEnabled =
  handleUpdateSectionAiChallengeEnabled as jest.Mock;
const sendEvent = analyticsReporter.sendEvent as jest.Mock;
const mockDcdoGet = DCDO.get as jest.Mock;

const SECTION_ID = 11;
const COURSE_ID = 42;
const UNIT_ID = 7;

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
        course_id: COURSE_ID,
        unit_id: UNIT_ID,
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

const enableExperiments = (...keys: string[]) =>
  jest
    .spyOn(experiments, 'isEnabledAllowingQueryString')
    .mockImplementation(key => keys.includes(key));

describe('AiChatAccessControls AI Tutor+ Challenges toggle', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser, teacherSections});
    updateChallengeEnabled.mockReset();
    sendEvent.mockReset();
    enableExperiments(
      experiments.LESSON_TUTOR,
      experiments.LESSON_TUTOR_CHALLENGE
    );
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
    mockDcdoGet.mockImplementation(
      (_key: string, defaultValue: unknown) => defaultValue
    );
  });

  it('shows when AI chat is enabled and the course has the lesson tutor', () => {
    renderControls();
    expect(challengeToggle()).not.toBeChecked();
  });

  it('is tagged as new', () => {
    renderControls();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('is hidden when AI chat is essential only', () => {
    renderControls({aiChatAccessLevel: AiChatAccessLevels.ESSENTIAL_ONLY});
    expect(challengeToggle()).not.toBeInTheDocument();
  });

  it('is hidden when Tutor+ is switched off', () => {
    mockDcdoGet.mockImplementation((key: string, defaultValue: unknown) =>
      key === 'lesson-deep-dive-enabled' ? false : defaultValue
    );
    renderControls();
    expect(challengeToggle()).not.toBeInTheDocument();
  });

  it('is hidden without the lesson-tutor experiment', () => {
    enableExperiments(experiments.LESSON_TUTOR_CHALLENGE);
    renderControls();
    expect(challengeToggle()).not.toBeInTheDocument();
  });

  it('is hidden without the lesson-tutor-challenge experiment', () => {
    enableExperiments(experiments.LESSON_TUTOR);
    renderControls();
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
    expect(sendEvent).toHaveBeenCalledWith('tutor_plus_challenges_toggled', {
      section_id: SECTION_ID,
      course_id: COURSE_ID,
      unit_id: UNIT_ID,
      enabled: true,
    });
  });

  it('reverts when the save fails', async () => {
    updateChallengeEnabled.mockRejectedValue(new Error('failed'));
    renderControls({aiChallengeEnabled: true});

    fireEvent.click(challengeToggle()!);

    await waitFor(() => expect(challengeToggle()).toBeChecked());
    expect(updateChallengeEnabled).toHaveBeenCalledWith(SECTION_ID, false);
    expect(sendEvent).not.toHaveBeenCalledWith(
      'tutor_plus_challenges_toggled',
      expect.anything()
    );
  });
});
