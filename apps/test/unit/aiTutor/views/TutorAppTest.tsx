import {TutorGalleryData} from '@code-dot-org/lesson-deep-dive';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import {LessonDeepDiveData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import TutorApp from '@cdo/apps/aiTutor/views/TutorApp';
import experiments from '@cdo/apps/util/experiments';

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer',
  () => ({__esModule: true, default: () => <div>lesson-deep-dive</div>})
);

jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ChallengeGallery: () => <div>challenge-gallery</div>,
}));

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeRoute',
  () => ({
    __esModule: true,
    default: ({lessonId}: {lessonId: number}) => (
      <div>challenge-route:{lessonId}</div>
    ),
  })
);

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
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
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
  });

  describe('challenge route', () => {
    it('renders ChallengeRoute with the lesson id from lessonDeepDiveData', () => {
      renderAt('/challenge/42/whiteboard');
      expect(screen.getByText('challenge-route:7')).toBeInTheDocument();
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

    it('does not render the gallery route when lesson-tutor-challenge is off', () => {
      experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
      renderAt('/gallery');
      expect(screen.queryByText('challenge-gallery')).not.toBeInTheDocument();
    });
  });
});
