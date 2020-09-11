import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {loadScript} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import * as sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import * as progress from '@cdo/apps/code-studio/progressRedux';
import * as redux from '@cdo/apps/redux';

const serverScriptResponse = {
  csf: true,
  family_name: 'courseb',
  hasStandards: false,
  id: 123,
  path: 'test/url',
  lessons: [{levels: []}],
  title: 'Course B',
  version_year: '2020'
};

const timeInSeconds = Date.now() / 1000;
const serverProgressResponse = {
  pagination: {
    page: 1,
    per: 50,
    total_pages: 1
  },
  student_timestamps: {
    100: null,
    101: timeInSeconds,
    102: timeInSeconds + 1
  },
  students: {
    100: {},
    101: {
      2000: {status: 'locked'},
      2001: {status: 'perfect', result: 30, paired: true, time_spent: 12345}
    },
    102: {
      2000: {status: 'perfect', result: 100, time_spent: 6789}
    }
  }
};

const fullExpectedResult = {
  levelsByLessonByScript: {
    123: {
      100: {},
      101: {},
      102: {}
    }
  },
  scriptDataByScript: {
    123: {
      csf: true,
      family_name: 'courseb',
      hasStandards: false,
      id: 123,
      path: 'test/url',
      stages: [{levels: []}],
      title: 'Course B',
      version_year: '2020'
    }
  },
  studentLevelPairingByScript: {
    123: {
      100: {},
      101: {
        2000: false,
        2001: true
      },
      102: {
        2000: false
      }
    }
  },
  studentLevelProgressByScript: {
    123: {
      100: {},
      101: {
        2000: 1001,
        2001: 30
      },
      102: {
        2000: 100
      }
    }
  },
  studentLevelTimeSpentByScript: {
    123: {
      100: {},
      101: {
        2000: undefined,
        2001: 12345
      },
      102: {
        2000: 6789
      }
    }
  },
  studentTimestampsByScript: {
    123: {
      100: 0,
      101: timeInSeconds * 1000,
      102: (timeInSeconds + 1) * 1000
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

  it('returns early if it is already loading', () => {
    reduxStub.returns({
      getState: () => {
        return {
          sectionProgress: {
            isLoadingProgress: true
          },
          sectionData: {}
        };
      }
    });
    expect(loadScript(0)).to.be.undefined;
    expect(startLoadingProgressStub).to.have.not.been.called;
    expect(startRefreshingProgressStub).to.have.not.been.called;
  });

  it('returns early if it is already refreshing', () => {
    reduxStub.returns({
      getState: () => {
        return {
          sectionProgress: {
            isRefreshingProgress: true
          },
          sectionData: {}
        };
      }
    });
    expect(loadScript(0)).to.be.undefined;
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

      loadScript(0, 0);
      expect(startLoadingProgressStub).to.have.not.been.called;
      expect(startRefreshingProgressStub).to.have.been.calledOnce;
      expect(addDataByScriptStub).to.have.been.calledOnce;
      expect(finishLoadingProgressStub).to.have.been.calledOnce;
      expect(finishRefreshingProgressStub).to.have.been.calledOnce;
    });

    describe('the first time', () => {
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
                  students: ['student']
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

        loadScript(0, 0);
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
          levelsByLessonByScript: {0: {}},
          scriptDataByScript: {
            0: {
              csf: undefined,
              family_name: undefined,
              hasStandards: undefined,
              id: undefined,
              path: undefined,
              stages: [{levels: ['success']}],
              title: undefined,
              version_year: undefined
            }
          },
          studentLevelPairingByScript: {0: {}},
          studentLevelProgressByScript: {0: {}},
          studentLevelTimeSpentByScript: {0: {}},
          studentTimestampsByScript: {0: {}}
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
        loadScript(0, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(expectedResult);
        progressHelpers.processedLevel.restore();
      });

      it('transforms the data provided by the server', () => {
        sinon.stub(progressHelpers, 'processedLevel');
        sinon.stub(progress, 'levelsByLesson').returns({});
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
        loadScript(123, 0);
        expect(addDataByScriptStub).to.have.been.calledWith(fullExpectedResult);
        progressHelpers.processedLevel.restore();
        progress.levelsByLesson.restore();
      });
    });
  });
});
