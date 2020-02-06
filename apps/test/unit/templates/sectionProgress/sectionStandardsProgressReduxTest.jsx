import {expect} from 'chai';
import {getLessonCompletionStatus} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';

// A lesson is completed by a section if 80% of the students in the section
// have completed 60% of levels.

// To calculate lesson completion we pull across multiple pieces of state and
// combine across multiple ids, here's a little key for the ids used in this
// fake data:

// studentId1 = 100001;
// studentId2 = 100002;
// studentId3 = 100003;
// studentId4 = 100004;
// levelId1 = 10001;
// levelId2 = 10002;
// levelId3 = 10003;
// scriptId = 101;
// passingLevelStatus = 20;
// sectionId = 11;

const stageId = 1001;

const teacherSections = {
  sections: {11: {studentCount: 4}},
  selectedSectionId: 11
};

const scriptDataByScript = {
  101: {
    stages: [
      {
        id: 1001,
        levels: [{activeId: 10001}, {activeId: 10002}, {activeId: 10003}]
      }
    ]
  }
};

const sectionCompletedLesson = {
  101: {
    100001: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100002: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100003: {
      10001: 20,
      10002: 20
    },
    100004: {
      10001: 20,
      10002: 20
    }
  }
};

const sectionPartialCompletedLesson = {
  101: {
    100001: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100002: {
      10001: 20,
      10002: 20,
      10003: 20
    }
  }
};

const stateNoProgress = {
  scriptSelection: {scriptId: 101},
  teacherSections: teacherSections,
  sectionProgress: {
    studentLevelProgressByScript: {101: {}},
    scriptDataByScript: scriptDataByScript
  }
};

const stateForPartiallyCompletedLesson = {
  scriptSelection: {scriptId: 101},
  teacherSections: teacherSections,
  sectionProgress: {
    studentLevelProgressByScript: sectionPartialCompletedLesson,
    scriptDataByScript: scriptDataByScript
  }
};

const stateForCompletedLesson = {
  scriptSelection: {scriptId: 101},
  teacherSections: teacherSections,
  sectionProgress: {
    studentLevelProgressByScript: sectionCompletedLesson,
    scriptDataByScript: scriptDataByScript
  }
};

describe('sectionStandardsProgressRedux', () => {
  describe('getLessonCompletionStatus', () => {
    it('accurately calculates no progress', () => {
      expect(getLessonCompletionStatus(stateNoProgress, stageId)).to.deep.equal(
        {
          completed: false,
          numStudentsCompleted: 0
        }
      );
    });

    it('accurately calculates partial progress', () => {
      expect(
        getLessonCompletionStatus(stateForPartiallyCompletedLesson, stageId)
      ).to.deep.equal({
        completed: false,
        numStudentsCompleted: 2
      });
    });

    it('accurately calculates > 80% of students completed > 60% of levels', () => {
      expect(
        getLessonCompletionStatus(stateForCompletedLesson, stageId)
      ).to.deep.equal({
        completed: true,
        numStudentsCompleted: 4
      });
    });
  });
});
