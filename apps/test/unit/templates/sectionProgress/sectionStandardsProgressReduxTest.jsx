import {assert} from 'chai';
import {getLessonCompletionStatus} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';

// const studentId1 = 100001;
// const studentId2 = 100002;
// const studentId3 = 100003;
// const studentId4 = 100004;
// const levelId1 = 10001;
// const levelId2 = 10002;
// const levelId3 = 10003;
// const scriptId = 101;
// const passingLevelStatus = 20;
// const sectionId = 11;

const stageId = 1001;

const stateWithProgress = {
  scriptSelection: {scriptId: 101},
  teacherSections: {
    sections: {11: {studentCount: 4}},
    selectedSectionId: 11
  },
  sectionProgress: {
    studentLevelProgressByScript: {
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
    },
    scriptDataByScript: {
      101: {
        stages: [
          {
            id: 1001,
            levels: [{activeId: 10001}, {activeId: 10002}, {activeId: 10003}]
          }
        ]
      }
    }
  }
};

describe('sectionStandardsProgressRedux', () => {
  describe('getLessonCompletionStatus', () => {
    console.log(
      'getLessonCompletionStatus: ',
      getLessonCompletionStatus(stateWithProgress, stageId)
    );
  });
});
