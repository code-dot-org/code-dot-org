import sectionStandardsProgress, {
  setTeacherCommentForReport,
  getUnpluggedLessonsForScript,
  getNumberLessonsInScript,
  lessonsByStandard,
  getNumberLessonsCompleted,
  getPluggedLessonCompletionStatus,
  getUnpluggedLessonCompletionStatus,
  getLessonSelectionStatus,
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import {
  lessonId,
  scriptId,
  pluggedLesson,
  stateForTeacherMarkedAndProgress,
  stateForTeacherMarkedIncompletedLesson,
  stateForTeacherMarkedCompletedLesson,
  stateForCompletedLesson,
  stateForPartiallyCompletedLesson,
  fakeState,
} from '@cdo/apps/templates/sectionProgress/standards/standardsTestHelpers';

describe('sectionStandardsProgressRedux', () => {
  const initialState = sectionStandardsProgress(undefined, {});

  describe('getLessonSelectionStatus', () => {
    it('returns true if lesson is in selected list', () => {
      expect(
        getLessonSelectionStatus(stateForTeacherMarkedCompletedLesson, lessonId)
      ).toBe(true);
    });
    it('returns false if lesson is not in selected', () => {
      expect(
        getLessonSelectionStatus(
          stateForTeacherMarkedIncompletedLesson,
          lessonId
        )
      ).toBe(false);
    });
  });

  describe('setTeacherCommentForReport', () => {
    it('can set the teacher comment', () => {
      const action = setTeacherCommentForReport(
        'A lovely comment about my class'
      );
      const nextState = sectionStandardsProgress(initialState, action);
      expect(nextState.teacherComment).toEqual(
        'A lovely comment about my class'
      );
    });
  });

  describe('getNumberLessonsInScript', () => {
    it('gets the correct number of lessons in the script', () => {
      expect(getNumberLessonsInScript(fakeState)).toEqual(3);
    });
  });

  describe('lessonsByStandard', () => {
    it('gets the correct lessons and completion by standard, no progress, no scores', () => {
      expect(lessonsByStandard(fakeState)).toEqual({
        4: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3',
          },
        ],
        16: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
        17: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
      });
    });

    // Plugged lessons calculate completion based on progress.
    // Unplugged lessons calculate completion based on teacher score.
    it('gets the correct lessons and completion by standard, completed lesson based only on progress', () => {
      expect(lessonsByStandard(stateForCompletedLesson)).toEqual({
        4: [
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3',
          },
        ],
        16: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
        17: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
      });
    });

    it('gets the correct lessons and completion by standard, plugged lesson completion based on progress, unplugged based on teacher score', () => {
      expect(lessonsByStandard(stateForTeacherMarkedAndProgress)).toEqual({
        4: [
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3',
          },
        ],
        16: [
          {
            completed: true,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 1,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
        17: [
          {
            completed: true,
            inProgress: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 1,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1',
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2',
          },
        ],
      });
    });
  });

  describe('getUnpluggedLessonsForScript', () => {
    it('gets the unplugged lessons for script', () => {
      expect(getUnpluggedLessonsForScript(fakeState)).toEqual([
        {
          id: 662,
          name: 'Going Places Safely',
          number: 1,
          url: 'https://curriculum.code.org/csf-19/coursea/1',
          completed: false,
          inProgress: false,
        },
        {
          id: 664,
          name: 'Happy Maps',
          number: 3,
          url: 'https://curriculum.code.org/csf-19/coursea/3',
          completed: false,
          inProgress: false,
        },
      ]);
    });
  });

  describe('getUnPluggedLessonCompletionStatus', () => {
    it('incomplete when no teacher scores for lesson', () => {
      expect(
        getUnpluggedLessonCompletionStatus(fakeState, scriptId, lessonId)
      ).toEqual({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0,
      });
    });

    it('incomplete when teacher scores lesson as incomplete', () => {
      expect(
        getUnpluggedLessonCompletionStatus(
          stateForTeacherMarkedIncompletedLesson,
          scriptId,
          lessonId
        )
      ).toEqual({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0,
      });
    });

    it('complete when teacher scores lesson as complete', () => {
      expect(
        getUnpluggedLessonCompletionStatus(
          stateForTeacherMarkedCompletedLesson,
          scriptId,
          lessonId
        )
      ).toEqual({
        completed: true,
        inProgress: false,
        numStudentsCompleted: 1,
      });
    });
  });

  describe('getPluggedLessonCompletionStatus', () => {
    it('accurately calculates no progress', () => {
      expect(
        getPluggedLessonCompletionStatus(fakeState, pluggedLesson)
      ).toEqual({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0,
      });
    });

    it('accurately calculates partial progress', () => {
      expect(
        getPluggedLessonCompletionStatus(
          stateForPartiallyCompletedLesson,
          pluggedLesson
        )
      ).toEqual({
        completed: false,
        inProgress: true,
        numStudentsCompleted: 2,
      });
    });

    it('accurately calculates > 80% of students completed > 60% of levels', () => {
      expect(
        getPluggedLessonCompletionStatus(stateForCompletedLesson, pluggedLesson)
      ).toEqual({
        completed: true,
        inProgress: true,
        numStudentsCompleted: 4,
      });
    });
  });

  describe('getNumberLessonsCompleted', () => {
    it('accurately calculates number of lessons completed when there is no student progress', () => {
      expect(getNumberLessonsCompleted(fakeState)).toBe(0);
    });

    it('accurately calculates the number of lessons completed when there is student progress', () => {
      expect(getNumberLessonsCompleted(stateForCompletedLesson)).toBe(1);
    });

    it('accurately calculates the number of lessons completed when there is student progress and teacher marked', () => {
      expect(getNumberLessonsCompleted(stateForTeacherMarkedAndProgress)).toBe(
        2
      );
    });
  });
});
