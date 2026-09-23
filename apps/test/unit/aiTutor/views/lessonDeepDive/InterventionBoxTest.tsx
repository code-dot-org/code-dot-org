import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import InterventionBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/InterventionBox';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';

// The modality content components pull in heavy dependencies (audio, video,
// chat, redux) that are irrelevant to the navigation behavior under test, so
// each is replaced with a lightweight marker whose text we can assert on.
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/Challenges',
  () => () => <div>challenge content</div>
);
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/Chat',
  () => () => <div>chat content</div>
);
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/VideosBox',
  () => () => <div>videos content</div>
);
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/PodcastsBox',
  () => () => <div>podcasts content</div>
);
jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ...jest.requireActual('@code-dot-org/lesson-deep-dive'),
  VocabularyFlashcards: () => <div>flashcards content</div>,
}));

const mockUserId = 7;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: () => mockUserId,
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const sendEventMock = analyticsReporter.sendEvent as jest.Mock;

const LESSON_ID = 42;
const LESSON_NAME = 'Variables';

function renderInterventionBox(
  onNext: jest.Mock = jest.fn(),
  focusTopic?: string
) {
  render(
    <InterventionBox
      lessonId={LESSON_ID}
      lessonName={LESSON_NAME}
      lessonSummary=""
      vocabulary={[]}
      assessmentAnalysis={[]}
      objectives={[]}
      jsonVideos={[]}
      reflectionData={null}
      focusTopic={focusTopic}
      onNext={onNext}
    />
  );
}

describe('InterventionBox', () => {
  beforeEach(() => {
    sendEventMock.mockReset();
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
  });

  it('Does not list the Challenge option in the practice menu if no experiment', () => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
    renderInterventionBox();
    expect(
      screen.queryByRole('button', {name: /I want a challenge instead/i})
    ).not.toBeInTheDocument();
  });

  it('Does not list the Challenge option in the bottom nav if no experiment', () => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
    renderInterventionBox();
    // Select a modality to reveal the bottom nav, then verify Challenge is absent.
    fireEvent.click(screen.getByRole('button', {name: 'Watch a video'}));
    expect(
      screen.queryByRole('button', {name: 'Challenge'})
    ).not.toBeInTheDocument();
  });

  it('lists the Challenge option in the practice menu', () => {
    renderInterventionBox();
    expect(
      screen.getByRole('button', {name: /I want a challenge instead/i})
    ).toBeInTheDocument();
  });

  it('lists the Challenge option in the bottom nav', () => {
    renderInterventionBox();
    // The bottom nav only appears after a modality is selected.
    fireEvent.click(screen.getByRole('button', {name: 'Watch a video'}));
    expect(screen.getByRole('button', {name: 'Challenge'})).toBeInTheDocument();
  });

  it('renders Challenges and reports the click when the Challenge link is clicked', () => {
    renderInterventionBox();

    fireEvent.click(
      screen.getByRole('button', {name: /I want a challenge instead/i})
    );

    expect(screen.getByText('challenge content')).toBeInTheDocument();
    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED,
      {
        modality: 'challenge',
        lessonId: LESSON_ID,
        lessonName: LESSON_NAME,
        userId: mockUserId,
      }
    );
  });

  it('renders Challenges when navigating to Challenge from the bottom nav', () => {
    renderInterventionBox();
    // Select any modality first to reveal the bottom nav.
    fireEvent.click(screen.getByRole('button', {name: 'Watch a video'}));
    fireEvent.click(screen.getByRole('button', {name: 'Challenge'}));

    expect(screen.getByText('challenge content')).toBeInTheDocument();
  });

  it('shows personalised subtext when focusTopic is provided', () => {
    renderInterventionBox(jest.fn(), 'variables and scope');
    // The <p> wraps all three inline nodes; its combined text content covers
    // both the prefix and the suffix.
    const subtext = screen.getByText(/Based on your reflection/i);
    expect(subtext).toHaveTextContent(
      "Based on your reflection, we'll start with variables and scope. You can work any way you like from here."
    );
    // The topic itself is wrapped in <strong>.
    expect(screen.getByText('variables and scope').tagName.toLowerCase()).toBe(
      'strong'
    );
  });

  it('strips a trailing period from focusTopic in the subtext', () => {
    renderInterventionBox(jest.fn(), 'loops.');
    // The <strong> element must not carry the trailing period.
    expect(screen.getByText('loops').tagName.toLowerCase()).toBe('strong');
  });

  it('shows fallback subtext when focusTopic is not provided', () => {
    renderInterventionBox();
    expect(
      screen.getByText('You can work any way you like from here.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Based on your reflection/)
    ).not.toBeInTheDocument();
  });

  it('reports a navigation event when moving between modalities to Challenge', () => {
    renderInterventionBox();

    // Start on Video, then move to Challenge.
    fireEvent.click(screen.getByRole('button', {name: 'Watch a video'}));
    sendEventMock.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Challenge'}));

    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_NAVIGATION,
      {
        from: 'videos',
        to: 'challenge',
        lessonId: LESSON_ID,
        lessonName: LESSON_NAME,
        userId: mockUserId,
      }
    );
  });
});
