import $ from 'jquery';
import clientState from '@cdo/apps/code-studio/clientState';
import {expect} from '../../../util/configuredChai';
import loadAppOptions, {setupApp, setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';

const SERVER_LEVEL_ID = 5;
const SERVER_PROJECT_LEVEL_ID = 10;

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, oldWriteSource, oldSourceForLevel, oldAjax, writtenLevelId, readLevelId;

  before(() => {
    oldAppOptions = window.appOptions;
    oldWriteSource = clientState.writeSourceForLevel;
    clientState.writeSourceForLevel = (scriptName, levelId, date, program) => {
      writtenLevelId = levelId;
    };
    oldSourceForLevel = clientState.sourceForLevel;
    clientState.sourceForLevel = (scriptName, levelId, timestamp) => {
      readLevelId = levelId;
    };
    oldAjax = $.ajax;
    $.ajax = () => {
      return {
        done() {
          return {
            fail(callback) {
              callback();
            },
          };
        },
      };
    };
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
    clientState.writeSourceForLevel = oldWriteSource;
    clientState.sourceForLevel = oldSourceForLevel;
    $.ajax = oldAjax;
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

      document.body.removeChild(appOptionsData);
      done();
    });
  });
});
