import {TutorGalleryData} from '@code-dot-org/lesson-deep-dive';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import {LessonDeepDiveData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import TutorApp from '@cdo/apps/aiTutor/views/TutorApp';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const sendEventMock = analyticsReporter.sendEvent as jest.Mock;

let mockChallengesEnabled = true;
jest.mock('@cdo/apps/aiTutor/hooks/useLessonDeepDiveChallengesEnabled', () => ({
  useLessonDeepDiveChallengesEnabled: () => mockChallengesEnabled,
}));

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer',
  () => ({__esModule: true, default: () => <div>lesson-deep-dive</div>})
);

// The stub's buttons stand in for the gallery's analytics callbacks.
jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ChallengeGallery: ({
    onViewed,
    onVisibilityToggled,
    onReactionAdded,
  }: {
    onViewed: (sectionId: number | null, unitId: number) => void;
    onVisibilityToggled: (
      sectionId: number | null,
      responseId: number,
      approved: boolean
    ) => void;
    onReactionAdded: (sectionId: number | null, responseId: number) => void;
  }) => (
    <div>
      challenge-gallery
      <button type="button" onClick={() => onViewed(3, 1)}>
        view
      </button>
      <button type="button" onClick={() => onVisibilityToggled(3, 9, true)}>
        toggle
      </button>
      <button type="button" onClick={() => onReactionAdded(3, 9)}>
        react
      </button>
    </div>
  ),
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

    it('does not render the gallery route when challenges are disabled', () => {
      mockChallengesEnabled = false;
      renderAt('/gallery');
      expect(screen.queryByText('challenge-gallery')).not.toBeInTheDocument();
    });
  });
});

describe('TutorApp gallery analytics', () => {
  beforeEach(() => {
    mockChallengesEnabled = true;
    sendEventMock.mockReset();
  });

  const clickAll = () => {
    for (const name of ['view', 'toggle', 'react']) {
      fireEvent.click(screen.getByRole('button', {name}));
    }
  };

  it('reports gallery events for teachers', () => {
    renderAt('/gallery', LESSON_DATA, {...GALLERY_DATA, is_teacher: true});
    clickAll();

    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.TUTOR_PLUS_GALLERY_VIEWED,
      {section_id: 3, unit_id: 1}
    );
    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.TUTOR_PLUS_GALLERY_VISIBILITY_TOGGLED,
      {section_id: 3, project_id: 9, is_visible: true}
    );
    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.TUTOR_PLUS_GALLERY_REACTION_ADDED,
      {section_id: 3, project_id: 9}
    );
  });

  it('does not report gallery events for students', () => {
    renderAt('/gallery');
    clickAll();

    expect(sendEventMock).not.toHaveBeenCalled();
  });
});
