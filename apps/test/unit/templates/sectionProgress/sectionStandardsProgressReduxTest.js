import {assert, expect} from '../../../util/reconfiguredChai';
import sectionStandardsProgress, {
  setTeacherCommentForReport,
  getUnpluggedLessonsForScript,
  getNumberLessonsInScript,
  lessonsByStandard,
  getNumberLessonsCompleted,
  getPluggedLessonCompletionStatus,
  getUnpluggedLessonCompletionStatus,
  getLessonSelectionStatus
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import {
  stageId,
  scriptId,
  pluggedStage,
  stateForTeacherMarkedAndProgress,
  stateForTeacherMarkedIncompletedLesson,
  stateForTeacherMarkedCompletedLesson,
  stateForCompletedLesson,
  stateForPartiallyCompletedLesson,
  fakeState
} from '@cdo/apps/templates/sectionProgress/standards/standardsTestHelpers';

describe('sectionStandardsProgressRedux', () => {
  const initialState = sectionStandardsProgress(undefined, {});

  describe('getLessonSelectionStatus', () => {
    it('returns true if lesson is in selected list', () => {
      expect(
        getLessonSelectionStatus(stateForTeacherMarkedCompletedLesson, stageId)
      ).to.equal(true);
    });
    it('returns false if lesson is not in selected', () => {
      expect(
        getLessonSelectionStatus(
          stateForTeacherMarkedIncompletedLesson,
          stageId
        )
      ).to.equal(false);
    });
  });

  describe('setTeacherCommentForReport', () => {
    it('can set the teacher comment', () => {
      const action = setTeacherCommentForReport(
        'A lovely comment about my class'
      );
      const nextState = sectionStandardsProgress(initialState, action);
      assert.deepEqual(
        nextState.teacherComment,
        'A lovely comment about my class'
      );
    });
  });

  describe('getNumberLessonsInScript', () => {
    it('gets the correct number of lessons in the script', () => {
      assert.deepEqual(getNumberLessonsInScript(fakeState), 3);
    });
  });

  describe('lessonsByStandard', () => {
    it('gets the correct lessons and completion by standard, no progress, no scores', () => {
      assert.deepEqual(lessonsByStandard(fakeState), {
        4: [
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ]
      });
    });

    // Plugged lessons calculate completion based on progress.
    // Unplugged lessons calculate completion based on teacher score.
    it('gets the correct lessons and completion by standard, completed lesson based only on progress', () => {
      assert.deepEqual(lessonsByStandard(stateForCompletedLesson), {
        4: [
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ]
      });
    });

    it('gets the correct lessons and completion by standard, plugged lesson completion based on progress, unplugged based on teacher score', () => {
      assert.deepEqual(lessonsByStandard(stateForTeacherMarkedAndProgress), {
        4: [
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            completed: false,
            inProgress: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
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
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: true,
            inProgress: true,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ]
      });
    });
  });

  describe('getUnpluggedLessonsForScript', () => {
    it('gets the unplugged lessons for script', () => {
      assert.deepEqual(getUnpluggedLessonsForScript(fakeState), [
        {
          id: 662,
          name: 'Going Places Safely',
          number: 1,
          url: 'https://curriculum.code.org/csf-19/coursea/1',
          completed: false,
          inProgress: false
        },
        {
          id: 664,
          name: 'Happy Maps',
          number: 3,
          url: 'https://curriculum.code.org/csf-19/coursea/3',
          completed: false,
          inProgress: false
        }
      ]);
    });
  });

  describe('getUnPluggedLessonCompletionStatus', () => {
    it('incomplete when no teacher scores for stage', () => {
      expect(
        getUnpluggedLessonCompletionStatus(fakeState, scriptId, stageId)
      ).to.deep.equal({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0
      });
    });

    it('incomplete when teacher scores stage as incomplete', () => {
      expect(
        getUnpluggedLessonCompletionStatus(
          stateForTeacherMarkedIncompletedLesson,
          scriptId,
          stageId
        )
      ).to.deep.equal({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0
      });
    });

    it('complete when teacher scores stage as complete', () => {
      expect(
        getUnpluggedLessonCompletionStatus(
          stateForTeacherMarkedCompletedLesson,
          scriptId,
          stageId
        )
      ).to.deep.equal({
        completed: true,
        inProgress: false,
        numStudentsCompleted: 1
      });
    });
  });

  describe('getPluggedLessonCompletionStatus', () => {
    it('accurately calculates no progress', () => {
      expect(
        getPluggedLessonCompletionStatus(fakeState, pluggedStage)
      ).to.deep.equal({
        completed: false,
        inProgress: false,
        numStudentsCompleted: 0
      });
    });

    it('accurately calculates partial progress', () => {
      expect(
        getPluggedLessonCompletionStatus(
          stateForPartiallyCompletedLesson,
          pluggedStage
        )
      ).to.deep.equal({
        completed: false,
        inProgress: true,
        numStudentsCompleted: 2
      });
    });

    it('accurately calculates > 80% of students completed > 60% of levels', () => {
      expect(
        getPluggedLessonCompletionStatus(stateForCompletedLesson, pluggedStage)
      ).to.deep.equal({
        completed: true,
        inProgress: true,
        numStudentsCompleted: 4
      });
    });
  });

  describe('getNumberLessonsCompleted', () => {
    it('accurately calculates number of lessons completed when there is no student progress', () => {
      expect(getNumberLessonsCompleted(fakeState)).to.equal(0);
    });

    it('accurately calculates the number of lessons completed when there is student progress', () => {
      expect(getNumberLessonsCompleted(stateForCompletedLesson)).to.equal(1);
    });

    it('accurately calculates the number of lessons completed when there is student progress and teacher marked', () => {
      expect(
        getNumberLessonsCompleted(stateForTeacherMarkedAndProgress)
      ).to.equal(2);
    });
  });
});
