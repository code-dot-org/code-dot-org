import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {loadScript} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import * as sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
// import * as sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
// import * as progress from '@cdo/apps/code-studio/progressRedux';
import * as redux from '@cdo/apps/redux';

describe('sectionProgressLoader.loadScript', () => {
  let fetchStub, reduxStub, startLoadingProgressStub;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    reduxStub = sinon.stub(redux, 'getStore');
    startLoadingProgressStub = sinon.stub(
      sectionProgress,
      'startLoadingProgress'
    );
  });

  afterEach(() => {
    redux.getStore.restore();
    window.fetch.restore();
    sectionProgress.startLoadingProgress.restore();
  });

  it('returns early if the given section script has already been loaded', () => {
    reduxStub.returns({
      getState: () => {
        return {
          sectionProgress: {
            studentLevelProgressByScript: [true],
            scriptDataByScript: [true],
            currentView: 0
          },
          sectionData: {
            section: 0
          }
        };
      }
    });
    expect(loadScript(0)).to.be.undefined;
    expect(startLoadingProgressStub).to.have.not.been.called;
  });

  describe('when loading data', () => {
    let addDataByScriptStub, finishLoadingProgressStub;
    beforeEach(() => {
      sinon.stub(Promise, 'all').returns({then: sinon.stub().callsArg(0)});
      finishLoadingProgressStub = sinon.stub(
        sectionProgress,
        'finishLoadingProgress'
      );
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

    afterEach(() => {
      sectionProgress.addDataByScript.restore();
      sectionProgress.finishLoadingProgress.restore();
      Promise.all.restore();
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
      expect(addDataByScriptStub).to.have.been.calledOnce;
      expect(finishLoadingProgressStub).to.have.been.calledOnce;
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
  });
});
