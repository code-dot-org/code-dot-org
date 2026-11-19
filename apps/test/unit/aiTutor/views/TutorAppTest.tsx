import {
  LessonDeepDiveData,
  TutorGalleryData,
} from '@code-dot-org/lesson-deep-dive';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import TutorApp from '@cdo/apps/aiTutor/views/TutorApp';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';

let mockChallengesEnabled = true;
jest.mock('@cdo/apps/aiTutor/hooks/useLessonDeepDiveChallengesEnabled', () => ({
  useLessonDeepDiveChallengesEnabled: () => mockChallengesEnabled,
}));

const mockUserId = 3;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: () => mockUserId,
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const mockTranscribeAudio = jest.fn();
jest.mock('@cdo/apps/aichat/api/client', () => ({
  __esModule: true,
  getClientApi: jest.fn(async () => ({transcribeAudio: mockTranscribeAudio})),
}));

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/WhiteboardChallenge',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/TutorChat',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/SkillsCheck/TutorFeedback',
  () => ({__esModule: true, default: () => null})
);
jest.mock('@cdo/apps/jsonVideo/TutorVideo', () => ({
  __esModule: true,
  default: () => null,
}));

const mockAudio = new Blob(['audio-bytes'], {type: 'audio/webm'});
jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ChallengeGallery: () => <div>challenge-gallery</div>,
  LessonDeepDiveContainer: ({
    onModalitySelected,
  }: {
    onModalitySelected: (modality: string) => void;
  }) => (
    <button type="button" onClick={() => onModalitySelected('challenge')}>
      lesson-deep-dive
    </button>
  ),
  ChallengeRoute: ({
    lessonId,
    transcribeAudio,
  }: {
    lessonId: number;
    transcribeAudio: (audio: Blob) => Promise<string>;
  }) => (
    <button type="button" onClick={() => transcribeAudio(mockAudio)}>
      challenge-route:{lessonId}
    </button>
  ),
}));

const LESSON_DATA: LessonDeepDiveData = {
  lessonId: 7,
  lessonName: 'Test Lesson',
  lessonSummary: '',
  vocabulary: [],
  objectives: [],
  assessmentAnalysis: [],
  jsonVideos: [],
  practiceProblems: [],
  progressCounts: {
    levelsTotalCount: 10,
    levelsAttemptedCount: 5,
    validatedLevelsTotalCount: 5,
    validatedLevelsCorrectCount: 3,
    validatedLevelsIncorrectCount: 2,
  },
  timeSpentSeconds: 600,
  unitLabel: null,
  nextLessonUrl: null,
};

const GALLERY_DATA: TutorGalleryData = {
  currentUnitId: 1,
  is_teacher: false,
  units: [],
  sections: [],
};

function renderAt(
  path: string,
  lessonDeepDiveData: LessonDeepDiveData | null = LESSON_DATA,
  tutorGalleryData: TutorGalleryData | null = GALLERY_DATA
) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <TutorApp
        lessonDeepDiveData={lessonDeepDiveData}
        tutorGalleryData={tutorGalleryData}
      />
    </MemoryRouter>
  );
}

describe('TutorApp routing', () => {
  beforeEach(() => {
    mockChallengesEnabled = true;
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR, false);
  });

  describe('index redirect', () => {
    it('redirects to welcome when lessonDeepDiveData is present', () => {
      renderAt('/');
      expect(screen.getByText('lesson-deep-dive')).toBeInTheDocument();
    });

    it('redirects to gallery when lessonDeepDiveData is null', () => {
      renderAt('/', null, GALLERY_DATA);
      expect(screen.getByText('challenge-gallery')).toBeInTheDocument();
    });
  });

  describe(':screenId route', () => {
    it('renders LessonDeepDiveContainer for any named screen', () => {
      renderAt('/reflection');
      expect(screen.getByText('lesson-deep-dive')).toBeInTheDocument();
    });

    it('does not render the :screenId route when lessonDeepDiveData is null', () => {
      renderAt('/reflection', null, GALLERY_DATA);
      expect(screen.queryByText('lesson-deep-dive')).not.toBeInTheDocument();
    });

    it('renders nothing when the lesson tutor experiment is off', () => {
      experiments.setEnabled(experiments.LESSON_TUTOR, false);
      renderAt('/reflection');
      expect(screen.queryByText('lesson-deep-dive')).not.toBeInTheDocument();
    });

    it('reports the modality a student picks', () => {
      renderAt('/intervention');
      fireEvent.click(screen.getByRole('button', {name: 'lesson-deep-dive'}));
      expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
        EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED,
        {
          modality: 'challenge',
          lessonId: LESSON_DATA.lessonId,
          lessonName: LESSON_DATA.lessonName,
          userId: mockUserId,
        }
      );
    });
  });

  describe('challenge route', () => {
    it('renders ChallengeRoute with the lesson id from lessonDeepDiveData', () => {
      renderAt('/challenge/42/whiteboard');
      expect(screen.getByText('challenge-route:7')).toBeInTheDocument();
    });

    it('transcribes audio through the aichat client in the lesson context', async () => {
      const setContext = jest.spyOn(AichatContextManager, 'setContext');
      renderAt('/challenge/42/video');

      fireEvent.click(screen.getByRole('button', {name: 'challenge-route:7'}));

      await waitFor(() =>
        expect(mockTranscribeAudio).toHaveBeenCalledWith(mockAudio)
      );
      expect(setContext).toHaveBeenCalledWith({
        clientType: 'lesson-deep-dive',
        currentLevelId: null,
        scriptId: null,
        channelId: undefined,
        lessonId: 7,
      });
    });

    it('does not render the challenge route when lessonDeepDiveData is null', () => {
      renderAt('/challenge/42/whiteboard', null, GALLERY_DATA);
      expect(screen.queryByText(/challenge-route/)).not.toBeInTheDocument();
    });
  });

  describe('gallery route', () => {
    it('renders ChallengeGallery at /gallery', () => {
      renderAt('/gallery');
      expect(screen.getByText('challenge-gallery')).toBeInTheDocument();
    });

    it('does not render the gallery route when tutorGalleryData is null', () => {
      renderAt('/gallery', LESSON_DATA, null);
      expect(screen.queryByText('challenge-gallery')).not.toBeInTheDocument();
    });

    it('does not render the gallery route when challenges are disabled', () => {
      mockChallengesEnabled = false;
      renderAt('/gallery');
      expect(screen.queryByText('challenge-gallery')).not.toBeInTheDocument();
    });
  });
});
