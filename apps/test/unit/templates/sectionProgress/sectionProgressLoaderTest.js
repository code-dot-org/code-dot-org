import _ from 'lodash';

import * as redux from '@cdo/apps/redux';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import * as sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';



const serverScriptResponse = {
  csf: true,
  isCsp: false,
  isCsd: false,
  family_name: 'courseb',
  name: 'courseb-2020',
  hasStandards: false,
  id: 123,
  path: 'test/url',
  lessons: [{id: 11, levels: [{id: '2000'}, {id: '2001'}]}],
  title: 'Course B',
  version_year: '2020',
};

const timeInSeconds = 321;
const serverProgressResponse = {
  pagination: {
    page: 1,
    per: 20,
    total_pages: 1,
  },
  student_last_updates: {
    100: null,
    101: timeInSeconds,
    102: timeInSeconds + 1,
  },
  student_progress: {
    100: {},
    101: {
      2000: {
        locked: true,
        status: 'not_tried',
        result: -1,
        paired: false,
        time_spent: undefined,
        teacher_feedback_review_state: undefined,
        last_progress_at: 12345,
      },
      2001: {
        status: 'perfect',
        result: 30,
        paired: true,
        time_spent: 12345,
        teacher_feedback_review_state: undefined,
        last_progress_at: 12345,
      },
    },
    102: {
      2000: {
        status: 'perfect',
        result: 100,
        paired: false,
        time_spent: 6789,
        teacher_feedback_review_state: undefined,
        last_progress_at: 6789,
      },
    },
  },
};

const firstServerProgressResponse = {
  pagination: {
    page: 1,
    per: 2,
    total_pages: 2,
  },
  student_last_updates: {
    100: null,
    101: timeInSeconds,
  },
  student_progress: {
    100: {},
    101: {
      2000: {
        status: 'not_tried',
        locked: true,
        result: -1,
        paired: false,
        time_spent: undefined,
        teacher_feedback_review_state: undefined,
        last_progress_at: 12345,
      },
      2001: {
        status: 'perfect',
        result: 30,
        paired: true,
        time_spent: 12345,
        teacher_feedback_review_state: undefined,
        last_progress_at: 12345,
      },
    },
  },
};

const secondServerProgressResponse = {
  pagination: {
    page: 2,
    per: 2,
    total_pages: 2,
  },
  student_last_updates: {
    102: timeInSeconds + 1,
  },
  student_progress: {
    102: {
      2000: {
        status: 'perfect',
        result: 100,
        paired: false,
        time_spent: 6789,
        teacher_feedback_review_state: undefined,
        last_progress_at: 6789,
      },
    },
  },
};

const fullExpectedResult = {
  unitDataByUnit: {
    123: {
      csf: true,
      isCsp: false,
      isCsd: false,
      family_name: 'courseb',
      name: 'courseb-2020',
      hasStandards: false,
      id: 123,
      path: 'test/url',
      lessons: [{id: 11, levels: [{id: '2000'}, {id: '2001'}]}],
      title: 'Course B',
      version_year: '2020',
    },
  },
  studentLevelProgressByUnit: {
    123: {
      100: {},
      101: {
        2000: {
          pages: null,
          status: 'not_tried',
          locked: true,
          result: -1,
          paired: false,
          timeSpent: undefined,
          teacherFeedbackReviewState: undefined,
          teacherFeedbackNew: false,
          teacherFeedbackCommented: false,
          lastTimestamp: 12345,
        },
        2001: {
          pages: null,
          status: 'perfect',
          locked: false,
          result: 30,
          paired: true,
          timeSpent: 12345,
          teacherFeedbackReviewState: undefined,
          teacherFeedbackNew: false,
          teacherFeedbackCommented: false,
          lastTimestamp: 12345,
        },
      },
      102: {
        2000: {
          pages: null,
          status: 'perfect',
          locked: false,
          result: 100,
          paired: false,
          timeSpent: 6789,
          teacherFeedbackReviewState: undefined,
          teacherFeedbackNew: false,
          teacherFeedbackCommented: false,
          lastTimestamp: 6789,
        },
      },
    },
  },
  studentLessonProgressByUnit: {
    123: {
      100: {
        11: null,
      },
      101: {
        11: {
          incompletePercent: 50,
          imperfectPercent: 0,
          completedPercent: 50,
          timeSpent: 12345,
          lastTimestamp: 12345,
        },
      },
      102: {
        11: {
          incompletePercent: 50,
          imperfectPercent: 0,
          completedPercent: 50,
          timeSpent: 6789,
          lastTimestamp: 6789,
        },
      },
    },
  },
  studentLastUpdateByUnit: {
    123: {
      100: null,
      101: timeInSeconds,
      102: timeInSeconds + 1,
    },
  },
};

describe('sectionProgressLoader.loadScript', () => {
  let fetchStub, reduxStub, startLoadingProgressStub;
  let startRefreshingProgressStub;

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    reduxStub = jest.spyOn(redux, 'getStore').mockClear().mockImplementation();
    startLoadingProgressStub = jest.spyOn(sectionProgress, 'startLoadingProgress').mockClear().mockImplementation();
    startRefreshingProgressStub = jest.spyOn(sectionProgress, 'startRefreshingProgress').mockClear().mockImplementation();
  });

  afterEach(() => {
    redux.getStore.mockRestore();
    fetchStub.mockRestore();
    sectionProgress.startLoadingProgress.mockRestore();
    sectionProgress.startRefreshingProgress.mockRestore();
  });

  it('returns early if it is already refreshing', () => {
    reduxStub.mockReturnValue({
      getState: () => {
        return {
          sectionProgress: {
            isRefreshingProgress: true,
            studentLevelProgressByUnit: [true],
            unitDataByUnit: [true],
            currentView: 0,
          },
          teacherSections: {
            sections: {},
          },
        };
      },
    });
    expect(loadUnitProgress(0)).toBeUndefined();
    expect(startLoadingProgressStub).not.toHaveBeenCalled();
    expect(startRefreshingProgressStub).not.toHaveBeenCalled();
  });

  describe('when loading data', () => {
    let addDataByUnitStub, finishLoadingProgressStub;
    let finishRefreshingProgressStub;
    beforeEach(() => {
      jest.spyOn(Promise, 'all').mockClear().mockReturnValue({then: jest.fn().mockImplementation((...args) => args[0]())});
      finishLoadingProgressStub = jest.spyOn(sectionProgress, 'finishLoadingProgress').mockClear().mockImplementation();
      finishRefreshingProgressStub = jest.spyOn(sectionProgress, 'finishRefreshingProgress').mockClear().mockImplementation();
    });

    afterEach(() => {
      sectionProgress.finishLoadingProgress.mockRestore();
      sectionProgress.finishRefreshingProgress.mockRestore();
      addDataByUnitStub.mockRestore();
      Promise.all.mockRestore();
    });

    it('refreshes the data if data already exists', () => {
      const selectedSectionId = 5;
      addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear().mockImplementation();
      reduxStub.mockReturnValue({
        getState: () => {
          return {
            sectionProgress: {
              studentLevelProgressByUnit: [true],
              unitDataByUnit: [true],
              currentView: 0,
            },
            teacherSections: {
              selectedSectionId: selectedSectionId,
              sections: {
                [selectedSectionId]: {},
              },
              selectedStudents: [{id: 1}],
            },
          };
        },
        dispatch: () => {},
      });
      fetchStub.mockReturnValue({
        then: jest.fn().mockReturnValue({
          then: jest.fn().mockImplementation((...args) => args[0]({})),
        }),
      });

      loadUnitProgress(0, selectedSectionId);
      expect(startLoadingProgressStub).not.toHaveBeenCalled();
      expect(startRefreshingProgressStub).toHaveBeenCalledTimes(1);
      expect(addDataByUnitStub).toHaveBeenCalledTimes(1);
      expect(finishLoadingProgressStub).toHaveBeenCalledTimes(1);
      expect(finishRefreshingProgressStub).toHaveBeenCalledTimes(1);
    });

    it('handles multiple pages of data', () => {
      const selectedSectionId = 5;
      reduxStub.mockReturnValue({
        getState: () => {
          return {
            sectionProgress: {
              studentLevelProgressByUnit: [],
              studentLessonProgressByUnit: [],
              unitDataByUnit: [],
              currentView: 0,
            },
            teacherSections: {
              selectedSectionId: selectedSectionId,
              sections: {
                [selectedSectionId]: {},
              },
              selectedStudents: new Array(30), // this is 1.5 * NUM_STUDENTS_PER_PAGE in sectionProgressLoaders
            },
          };
        },
        dispatch: () => {},
      });

      jest.spyOn(progressHelpers, 'processedLevel').mockClear().mockImplementation((...args) => args[0]);
      addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear();
      fetchStub.mockImplementation(() => {
        if (fetchStub.mock.calls.length === 0) {
          return {
            then: jest.fn().mockReturnValue({
              then: jest.fn().mockImplementation((...args) => args[0](serverScriptResponse)),
            }),
          };
        }
      });
      fetchStub.mockImplementation(() => {
        if (fetchStub.mock.calls.length === 1) {
          return {
            then: jest.fn().mockReturnValue({
              then: jest.fn().mockImplementation((...args) => args[0](firstServerProgressResponse)),
            }),
          };
        }
      });
      fetchStub.mockImplementation(() => {
        if (fetchStub.mock.calls.length === 2) {
          return {
            then: jest.fn().mockReturnValue({
              then: jest.fn().mockImplementation((...args) => args[0](secondServerProgressResponse)),
            }),
          };
        }
      });
      loadUnitProgress(123, selectedSectionId);
      expect(addDataByUnitStub).toHaveBeenCalledWith(fullExpectedResult);
      progressHelpers.processedLevel.mockRestore();
    });

    describe('the first time', () => {
      const selectedSectionId = 5;
      let lessonExtras = true;
      beforeEach(() => {
        reduxStub.mockReturnValue({
          getState: () => {
            return {
              sectionProgress: {
                studentLevelProgressByUnit: [],
                unitDataByUnit: [],
                currentView: 0,
              },
              teacherSections: {
                selectedSectionId: selectedSectionId,
                sections: {
                  [selectedSectionId]: {
                    lessonExtras: lessonExtras,
                  },
                },
                selectedStudents: [{id: 1}],
              },
            };
          },
          dispatch: () => {},
        });
      });

      it('starts and finishes loading progress', () => {
        addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear().mockImplementation();
        fetchStub.mockReturnValue({
          then: jest.fn().mockReturnValue({
            then: jest.fn().mockImplementation((...args) => args[0]({})),
          }),
        });

        loadUnitProgress(0, selectedSectionId);
        expect(startLoadingProgressStub).toHaveBeenCalledTimes(1);
        expect(startRefreshingProgressStub).not.toHaveBeenCalled();
        expect(addDataByUnitStub).toHaveBeenCalledTimes(1);
        expect(finishLoadingProgressStub).toHaveBeenCalledTimes(1);
        expect(finishRefreshingProgressStub).toHaveBeenCalledTimes(1);
      });

      it('processes levels before updating the redux store', () => {
        jest.spyOn(progressHelpers, 'processedLevel').mockClear().mockReturnValue('success');
        addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear();
        const serverResponse = {
          lessons: [{levels: ['fail']}],
        };
        const expectedResult = {
          unitDataByUnit: {
            0: {
              csf: false,
              isCsd: undefined,
              isCsp: undefined,
              family_name: undefined,
              name: undefined,
              hasStandards: undefined,
              id: undefined,
              path: undefined,
              lessons: [{levels: ['success']}],
              title: undefined,
              version_year: undefined,
            },
          },
          studentLevelProgressByUnit: {0: {}},
          studentLessonProgressByUnit: {0: {}},
          studentLastUpdateByUnit: {0: {}},
        };

        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 0) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](serverResponse)),
              }),
            };
          }
        });
        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 1) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0]({})),
              }),
            };
          }
        });
        loadUnitProgress(0, selectedSectionId);
        expect(addDataByUnitStub).toHaveBeenCalledWith(expectedResult);
        progressHelpers.processedLevel.mockRestore();
      });

      it('transforms the data provided by the server', () => {
        jest.spyOn(progressHelpers, 'processedLevel').mockClear().mockImplementation((...args) => args[0]);
        addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear();
        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 0) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](serverScriptResponse)),
              }),
            };
          }
        });
        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 1) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](serverProgressResponse)),
              }),
            };
          }
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).toHaveBeenCalledWith(fullExpectedResult);
        progressHelpers.processedLevel.mockRestore();
      });

      it('filters out bonus levels when section.lessonExtras is false', () => {
        lessonExtras = false;
        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push({bonus: true});

        jest.spyOn(progressHelpers, 'processedLevel').mockClear().mockImplementation((...args) => args[0]);
        addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear();

        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 0) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](scriptResponse)),
              }),
            };
          }
        });
        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 1) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](serverProgressResponse)),
              }),
            };
          }
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).toHaveBeenCalledWith(fullExpectedResult);
        progressHelpers.processedLevel.mockRestore();
      });

      it('does not filter bonus levels when section.lessonExtras is true', () => {
        lessonExtras = true;
        const bonusLevel = {id: '2002', bonus: true};

        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push(bonusLevel);

        const expectedResult = _.cloneDeep(fullExpectedResult);
        expectedResult.unitDataByUnit[123].lessons[0].levels.push(bonusLevel);

        jest.spyOn(progressHelpers, 'processedLevel').mockClear().mockImplementation((...args) => args[0]);
        addDataByUnitStub = jest.spyOn(sectionProgress, 'addDataByUnit').mockClear();

        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 0) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](scriptResponse)),
              }),
            };
          }
        });
        fetchStub.mockImplementation(() => {
          if (fetchStub.mock.calls.length === 1) {
            return {
              then: jest.fn().mockReturnValue({
                then: jest.fn().mockImplementation((...args) => args[0](serverProgressResponse)),
              }),
            };
          }
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).toHaveBeenCalledWith(expectedResult);
        progressHelpers.processedLevel.mockRestore();
      });
    });
  });
});
