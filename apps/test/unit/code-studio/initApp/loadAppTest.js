import $ from 'jquery';
import clientState from '@cdo/apps/code-studio/clientState';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import loadAppOptions, {setupApp, setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';

const SERVER_LEVEL_ID = 5;
const SERVER_PROJECT_LEVEL_ID = 10;
const OLD_CODE = '<some><blocks with="stuff">in<them/></blocks></some>';

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, writtenLevelId, readLevelId;

  before(() => {
    oldAppOptions = window.appOptions;
    sinon.stub(clientState, 'writeSourceForLevel').callsFake(
        (scriptName, levelId, date, program) => {
      writtenLevelId = levelId;
    });
    sinon.stub(clientState, 'sourceForLevel').callsFake(
        (scriptName, levelId, timestamp) => {
      readLevelId = levelId;
      return OLD_CODE;
    });
    sinon.stub($, 'ajax').callsFake(() => {
      return {
        done() {
          return {
            fail(callback) {
              callback();
            },
          };
        },
      };
    });
  });
  beforeEach(() => {
    writtenLevelId = undefined;
    readLevelId = undefined;
    appOptions = {
      level: {},
      report: {
        callback: 'http://bogus.url/string',
      },
      serverLevelId: SERVER_LEVEL_ID,
    };
    setAppOptions(appOptions);
  });
  after(() => {
    clientState.writeSourceForLevel.restore();
    clientState.sourceForLevel.restore();
    $.ajax.restore();
    window.appOptions = oldAppOptions;
  });

  it('stores attempts for logged-out users against the server level id', () => {
    setupApp(appOptions);
    appOptions.onAttempt({});

    expect(writtenLevelId).to.equal(SERVER_LEVEL_ID);
  });

  it('stores attempts for logged-out users against the server project level id for template backed level', () => {
    appOptions.serverProjectLevelId = SERVER_PROJECT_LEVEL_ID;
    setupApp(appOptions);
    appOptions.onAttempt({});

    expect(writtenLevelId).to.equal(SERVER_PROJECT_LEVEL_ID);
  });

  it('stores completed attempts for logged-out users against the server level id', () => {
    setupApp(appOptions);
    appOptions.onComplete({});

    expect(writtenLevelId).to.equal(SERVER_LEVEL_ID);
  });

  it('stores completed attempts for logged-out users against the server project level for template backed level', () => {
    appOptions.serverProjectLevelId = SERVER_PROJECT_LEVEL_ID;
    setupApp(appOptions);
    appOptions.onComplete({});

    expect(writtenLevelId).to.equal(SERVER_PROJECT_LEVEL_ID);
  });

  it('loads attempt stored under server level id', (done) => {
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);

    loadAppOptions().then(() => {
      expect(readLevelId).to.equal(SERVER_LEVEL_ID);
      expect(window.appOptions.level.lastAttempt).to.equal(OLD_CODE);

      document.body.removeChild(appOptionsData);
      done();
    });
  });

  it('loads attempt stored under project server level id for template backed level', (done) => {
    appOptions.serverProjectLevelId = SERVER_PROJECT_LEVEL_ID;
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);

    loadAppOptions().then(() => {
      expect(readLevelId).to.equal(SERVER_PROJECT_LEVEL_ID);
      expect(window.appOptions.level.lastAttempt).to.equal(OLD_CODE);

      document.body.removeChild(appOptionsData);
      done();
    });
  });

  it('does not load a last attempt when viewing a solution', (done) => {
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);
    const queryParamsStub = sinon.stub(clientState, 'queryParams').callsFake((param) => {
      if (param === 'solution') {
        return 'true';
      }
      return undefined;
    });

    loadAppOptions().then(() => {
      expect(window.appOptions.level.lastAttempt).to.be.undefined;
      expect(readLevelId).to.be.undefined;

      document.body.removeChild(appOptionsData);
      queryParamsStub.restore();
      done();
    });
  });

  it('does not load a last attempt when viewing a student solution', (done) => {
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);
    const queryParamsStub = sinon.stub(clientState, 'queryParams').callsFake((param) => {
      if (param === 'user_id') {
        return 'true';
      }
      return undefined;
    });

    loadAppOptions().then(() => {
      expect(window.appOptions.level.lastAttempt).to.be.undefined;
      expect(readLevelId).to.be.undefined;

      document.body.removeChild(appOptionsData);
      queryParamsStub.restore();
      done();
    });
  });
});
