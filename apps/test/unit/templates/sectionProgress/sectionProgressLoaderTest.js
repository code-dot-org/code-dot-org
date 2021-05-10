import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import _ from 'lodash';
import {loadScriptProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import * as sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import * as redux from '@cdo/apps/redux';

const serverScriptResponse = {
  csf: true,
  family_name: 'courseb',
  name: 'courseb-2020',
  hasStandards: false,
  id: 123,
  path: 'test/url',
  lessons: [{id: 11, levels: [{id: '2000'}, {id: '2001'}]}],
  title: 'Course B',
  version_year: '2020'
};

const timeInSeconds = 321;
const serverProgressResponse = {
  pagination: {
    page: 1,
    per: 50,
    total_pages: 1
  },
  student_last_updates: {
    100: null,
    101: timeInSeconds,
    102: timeInSeconds + 1
  },
  student_progress: {
    100: {},
    101: {
      '2000': {
        locked: true,
        status: 'not_tried',
        result: -1,
        paired: false,
        time_spent: undefined,
        last_progress_at: 12345
      },
      '2001': {
        status: 'perfect',
        result: 30,
        paired: true,
        time_spent: 12345,
        last_progress_at: 12345
      }
    },
    102: {
      '2000': {
        status: 'perfect',
        result: 100,
        paired: false,
        time_spent: 6789,
        last_progress_at: 6789
      }
    }
  }
};

const firstServerProgressResponse = {
  pagination: {
    page: 1,
    per: 2,
    total_pages: 2
  },
  student_last_updates: {
    100: null,
    101: timeInSeconds
  },
  student_progress: {
    100: {},
    101: {
      '2000': {
        status: 'not_tried',
        locked: true,
        result: -1,
        paired: false,
        time_spent: undefined,
        last_progress_at: 12345
      },
      '2001': {
        status: 'perfect',
        result: 30,
        paired: true,
        time_spent: 12345,
        last_progress_at: 12345
      }
    }
  }
};

const secondServerProgressResponse = {
  pagination: {
    page: 2,
    per: 2,
    total_pages: 2
  },
  student_last_updates: {
    102: timeInSeconds + 1
  },
  student_progress: {
    102: {
      '2000': {
        status: 'perfect',
        result: 100,
        paired: false,
        time_spent: 6789,
        last_progress_at: 6789
      }
    }
  }
};

const fullExpectedResult = {
  scriptDataByScript: {
    123: {
      csf: true,
      family_name: 'courseb',
      name: 'courseb-2020',
      hasStandards: false,
      id: 123,
      path: 'test/url',
      stages: [{id: 11, levels: [{id: '2000'}, {id: '2001'}]}],
      title: 'Course B',
      version_year: '2020'
    }
  },
  studentLevelProgressByScript: {
    123: {
      100: {},
      101: {
        '2000': {
          pages: null,
          status: 'not_tried',
          locked: true,
          result: -1,
          paired: false,
          timeSpent: undefined,
          lastTimestamp: 12345
        },
        '2001': {
          pages: null,
          status: 'perfect',
          locked: false,
          result: 30,
          paired: true,
          timeSpent: 12345,
          lastTimestamp: 12345
        }
      },
      102: {
        '2000': {
          pages: null,
          status: 'perfect',
          locked: false,
          result: 100,
          paired: false,
          timeSpent: 6789,
          lastTimestamp: 6789
        }
      }
    }
  },
  studentLessonProgressByScript: {
    123: {
      100: {
        11: null
      },
      101: {
        11: {
          incompletePercent: 50,
          imperfectPercent: 0,
          completedPercent: 50,
          timeSpent: 12345,
          lastTimestamp: 12345
        }
      },
      102: {
        11: {
          incompletePercent: 50,
          imperfectPercent: 0,
          completedPercent: 50,
          timeSpent: 6789,
          lastTimestamp: 6789
        }
      }
    }
  },
  studentLastUpdateByScript: {
    123: {
      '100': null,
      '101': timeInSeconds,
      '102': timeInSeconds + 1
    }
  }
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
            studentLevelProgressByScript: [true],
            scriptDataByScript: [true],
            currentView: 0
          },
          sectionData: {}
        };
      }
    });
    expect(loadScriptProgress(0)).to.be.undefined;
    expect(startLoadingProgressStub).to.have.not.been.called;
    expect(startRefreshingProgressStub).to.have.not.been.called;
  });

  describe('when loading data', () => {
    let addDataByScriptStub, finishLoadingProgressStub;
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
      addDataByScriptStub.restore();
      Promise.all.restore();
    });

    it('refreshes the data if data already exists', () => {
      addDataByScriptStub = sinon.stub(sectionProgress, 'addDataByScript');
      reduxStub.returns({
        getState: () => {
          return {
            sectionProgress: {
              studentLevelProgressByScript: [true],
              scriptDataByScript: [true],
              currentView: 0
            },
            sectionData: {
              section: {
                students: ['student']
              }
            }
          };
        },
        dispatch: () => {}
      });
      fetchStub.returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, {})
        })
      });

      loadScriptProgress(0, 0);
      expect(startLoadingProgressStub).to.have.not.been.called;
      expect(startRefreshingProgressStub).to.have.been.calledOnce;
      expect(addDataByScriptStub).to.have.been.calledOnce;
      expect(finishLoadingProgressStub).to.have.been.calledOnce;
      expect(finishRefreshingProgressStub).to.have.been.calledOnce;
    });

    it('handles multiple pages of data', () => {
      reduxStub.returns({
        getState: () => {
          return {
            sectionProgress: {
              studentLevelProgressByScript: [],
              studentLessonProgressByScript: [],
              scriptDataByScript: [],
              currentView: 0
            },
            sectionData: {
              section: {
                students: new Array(60)
              }
            }
          };
        },
        dispatch: () => {}
      });

      sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
      addDataByScriptStub = sinon.spy(sectionProgress, 'addDataByScript');
      fetchStub.onCall(0).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, serverScriptResponse)
        })
      });
      fetchStub.onCall(1).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, firstServerProgressResponse)
        })
      });
      fetchStub.onCall(2).returns({
        then: sinon.stub().returns({
          then: sinon.stub().callsArgWith(0, secondServerProgressResponse)
        })
      });
      loadScriptProgress(123, 0);
      expect(addDataByScriptStub).to.have.been.calledWith(fullExpectedResult);
      progressHelpers.processedLevel.restore();
    });

    describe('the first time', () => {
      let stageExtras = true;
      beforeEach(() => {
        reduxStub.returns({
          getState: () => {
            return {
              sectionProgress: {
                studentLevelProgressByScript: [],
                scriptDataByScript: [],
                currentView: 0
              },
              sectionData: {
                section: {
                  students: ['student'],
                  stageExtras: stageExtras
                }
              }
            };
          },
          dispatch: () => {}
        });
      });

      it('starts and finishes loading progress', () => {
        addDataByScriptStub = sinon.stub(sectionProgress, 'addDataByScript');
        fetchStub.returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, {})
          })
        });

        loadScriptProgress(0, 0);
        expect(startLoadingProgressStub).to.have.been.calledOnce;
        expect(startRefreshingProgressStub).to.have.not.been.called;
        expect(addDataByScriptStub).to.have.been.calledOnce;
        expect(finishLoadingProgressStub).to.have.been.calledOnce;
        expect(finishRefreshingProgressStub).to.have.been.calledOnce;
      });

      it('processes levels before updating the redux store', () => {
        sinon.stub(progressHelpers, 'processedLevel').returns('success');
        addDataByScriptStub = sinon.spy(sectionProgress, 'addDataByScript');
        const serverResponse = {
          lessons: [{levels: ['fail']}]
        };
        const expectedResult = {
          scriptDataByScript: {
            '0': {
              csf: undefined,
              family_name: undefined,
              name: undefined,
              hasStandards: undefined,
              id: undefined,
              path: undefined,
              stages: [{levels: ['success']}],
              title: undefined,
              version_year: undefined
            }
          },
          studentLevelProgressByScript: {'0': {}},
          studentLessonProgressByScript: {'0': {}},
          studentLastUpdateByScript: {'0': {}}
        };

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverResponse)
          })
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, {})
          })
        });
        loadScriptProgress(0, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(expectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('transforms the data provided by the server', () => {
        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByScriptStub = sinon.spy(sectionProgress, 'addDataByScript');
        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverScriptResponse)
          })
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse)
          })
        });
        loadScriptProgress(123, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(fullExpectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('filters out bonus levels when section.stageExtras is false', () => {
        stageExtras = false;
        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push({bonus: true});

        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByScriptStub = sinon.spy(sectionProgress, 'addDataByScript');

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, scriptResponse)
          })
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse)
          })
        });
        loadScriptProgress(123, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(fullExpectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('does not filter bonus levels when section.stageExtras is true', () => {
        stageExtras = true;
        const bonusLevel = {id: '2002', bonus: true};

        const scriptResponse = _.cloneDeep(serverScriptResponse);
        scriptResponse.lessons[0].levels.push(bonusLevel);

        const expectedResult = _.cloneDeep(fullExpectedResult);
        expectedResult.scriptDataByScript[123].stages[0].levels.push(
          bonusLevel
        );

        sinon.stub(progressHelpers, 'processedLevel').returnsArg(0);
        addDataByScriptStub = sinon.spy(sectionProgress, 'addDataByScript');

        fetchStub.onCall(0).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, scriptResponse)
          })
        });
        fetchStub.onCall(1).returns({
          then: sinon.stub().returns({
            then: sinon.stub().callsArgWith(0, serverProgressResponse)
          })
        });
        loadScriptProgress(123, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(expectedResult);
        progressHelpers.processedLevel.restore();
      });
    });
  });
});
