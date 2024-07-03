import _ from 'lodash';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as redux from '@cdo/apps/redux';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import * as sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    fetchStub = sinon.stub(window, 'fetch');
    reduxStub = sinon.stub(redux, 'getStore');
    startLoadingProgressStub = sinon.stub(
      sectionProgress,
      'startLoadingProgress'
    );
    startRefreshingProgressStub = sinon.stub(
      sectionProgress,
      'startRefreshingProgress'
    );
  });

  afterEach(() => {
    redux.getStore.restore();
    fetchStub.restore();
    sectionProgress.startLoadingProgress.restore();
    sectionProgress.startRefreshingProgress.restore();
  });

  it('returns early if it is already refreshing', () => {
    reduxStub.returns({
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
    expect(loadUnitProgress(0)).to.be.undefined;
    expect(startLoadingProgressStub).to.have.not.been.called;
    expect(startRefreshingProgressStub).to.have.not.been.called;
  });

  describe('when loading data', () => {
    let addDataByUnitStub, finishLoadingProgressStub;
    let finishRefreshingProgressStub;
    beforeEach(() => {
      sinon.stub(Promise, 'all').returns({then: sinon.stub().callsArg(0)});
      finishLoadingProgressStub = sinon.stub(
        sectionProgress,
        'finishLoadingProgress'
      );
      finishRefreshingProgressStub = sinon.stub(
        sectionProgress,
        'finishRefreshingProgress'
      );
    });

    afterEach(() => {
      sectionProgress.finishLoadingProgress.restore();
      sectionProgress.finishRefreshingProgress.restore();
      addDataByUnitStub.restore();
      Promise.all.restore();
    });

    it('refreshes the data if data already exists', () => {
      const selectedSectionId = 5;
      addDataByUnitStub = sinon.stub(sectionProgress, 'addDataByUnit');
      reduxStub.returns({
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
      fetchStub.returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, {}),
        }),
      });

      loadUnitProgress(0, selectedSectionId);
      expect(startLoadingProgressStub).to.have.not.been.called;
      expect(startRefreshingProgressStub).to.have.been.calledOnce;
      expect(addDataByUnitStub).to.have.been.calledOnce;
      expect(finishLoadingProgressStub).to.have.been.calledOnce;
      expect(finishRefreshingProgressStub).to.have.been.calledOnce;
    });

    it('handles multiple pages of data', () => {
      const selectedSectionId = 5;
      reduxStub.returns({
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

      sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
      addDataByUnitStub = sinon.spy(sectionProgress, 'addDataByUnit');
      fetchStub.onCall(0).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, serverScriptResponse),
        }),
      });
      fetchStub.onCall(1).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, firstServerProgressResponse),
        }),
      });
      fetchStub.onCall(2).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, secondServerProgressResponse),
        }),
      });
      loadUnitProgress(123, selectedSectionId);
      expect(addDataByUnitStub).to.have.been.calledWith(fullExpectedResult);
      progressHelpers.processedLevel.restore();
    });

    describe('the first time', () => {
      const selectedSectionId = 5;
      let lessonExtras = true;
      beforeEach(() => {
        reduxStub.returns({
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
        addDataByUnitStub = sinon.stub(sectionProgress, 'addDataByUnit');
        fetchStub.returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, {}),
          }),
        });

        loadUnitProgress(0, selectedSectionId);
        expect(startLoadingProgressStub).to.have.been.calledOnce;
        expect(startRefreshingProgressStub).to.have.not.been.called;
        expect(addDataByUnitStub).to.have.been.calledOnce;
        expect(finishLoadingProgressStub).to.have.been.calledOnce;
        expect(finishRefreshingProgressStub).to.have.been.calledOnce;
      });

      it('processes levels before updating the redux store', () => {
        sinon.stub(progressHelpers, 'processedLevel').returns('success');
        addDataByUnitStub = sinon.spy(sectionProgress, 'addDataByUnit');
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

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverResponse),
          }),
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, {}),
          }),
        });
        loadUnitProgress(0, selectedSectionId);
        expect(addDataByUnitStub).to.have.been.calledWith(expectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('transforms the data provided by the server', () => {
        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByUnitStub = sinon.spy(sectionProgress, 'addDataByUnit');
        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverScriptResponse),
          }),
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse),
          }),
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).to.have.been.calledWith(fullExpectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('filters out bonus levels when section.lessonExtras is false', () => {
        lessonExtras = false;
        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push({bonus: true});

        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByUnitStub = sinon.spy(sectionProgress, 'addDataByUnit');

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, scriptResponse),
          }),
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse),
          }),
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).to.have.been.calledWith(fullExpectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('does not filter bonus levels when section.lessonExtras is true', () => {
        lessonExtras = true;
        const bonusLevel = {id: '2002', bonus: true};

        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push(bonusLevel);

        const expectedResult = _.cloneDeep(fullExpectedResult);
        expectedResult.unitDataByUnit[123].lessons[0].levels.push(bonusLevel);

        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByUnitStub = sinon.spy(sectionProgress, 'addDataByUnit');

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, scriptResponse),
          }),
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse),
          }),
        });
        loadUnitProgress(123, selectedSectionId);
        expect(addDataByUnitStub).to.have.been.calledWith(expectedResult);
        progressHelpers.processedLevel.restore();
      });
    });
  });
});
