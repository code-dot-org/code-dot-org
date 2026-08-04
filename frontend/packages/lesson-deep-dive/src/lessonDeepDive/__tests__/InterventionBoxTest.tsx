import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import InterventionBox from '../ReviewModalities/InterventionBox';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

// The modality content components pull in heavy dependencies (audio, video,
// chat, redux) that are irrelevant to the navigation behavior under test, so
// each is replaced with a lightweight marker whose text we can assert on.
vi.mock('../ChallengeActivities/ChallengeBox', () => ({
  default: () => <div>challenge content</div>,
}));
vi.mock('../ReviewModalities/Chat', () => ({
  default: () => <div>chat content</div>,
}));
vi.mock('../ReviewModalities/VideosBox', () => ({
  default: () => <div>videos content</div>,
}));
vi.mock('../ReviewModalities/PodcastsBox', () => ({
  default: () => <div>podcasts content</div>,
}));
vi.mock('../ReviewModalities/VocabularyFlashcards', () => ({
  default: () => <div>flashcards content</div>,
}));

const mockUserId = 7;
vi.mock('@cdo/apps/util/reduxHooks', async importOriginal => ({
  ...(await importOriginal<object>()),
  useAppSelector: () => mockUserId,
}));

vi.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: vi.fn()},
}));

const sendEventMock = analyticsReporter.sendEvent as jest.Mock;

const LESSON_ID = 42;
const LESSON_NAME = 'Variables';

function renderInterventionBox(onNext: jest.Mock = vi.fn()) {
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
      onNext={onNext}
    />,
  );
}

describe('InterventionBox', () => {
  beforeEach(() => {
    sendEventMock.mockReset();
  });

  it('lists the Challenge option in the practice menu', () => {
    renderInterventionBox();
    expect(
      screen.getByRole('button', {name: 'Take on a challenge'}),
    ).toBeInTheDocument();
  });

  it('lists the Challenge option in the bottom nav', () => {
    renderInterventionBox();
    expect(screen.getByRole('button', {name: 'Challenge'})).toBeInTheDocument();
  });

  it('renders ChallengeBox and reports the click when the Challenge menu card is selected', () => {
    renderInterventionBox();

    fireEvent.click(screen.getByRole('button', {name: 'Take on a challenge'}));

    expect(screen.getByText('challenge content')).toBeInTheDocument();
    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED,
      {
        modality: 'challenge',
        lessonId: LESSON_ID,
        lessonName: LESSON_NAME,
        userId: mockUserId,
      },
    );
  });

  it('renders ChallengeBox when navigating to Challenge from the bottom nav', () => {
    renderInterventionBox();

    fireEvent.click(screen.getByRole('button', {name: 'Challenge'}));

    expect(screen.getByText('challenge content')).toBeInTheDocument();
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
      },
    );
  });
});
