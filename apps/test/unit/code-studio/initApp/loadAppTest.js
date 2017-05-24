import clientState from '@cdo/apps/code-studio/clientState';
import {expect} from '../../../util/configuredChai';
import loadAppOptions, {setupApp, setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';


describe('loadApp.js', () => {
  let oldAppOptions, appOptions, oldWriteSource, writtenLevelId;

  before(() => {
    oldAppOptions = window.appOptions;
    oldWriteSource = clientState.writeSourceForLevel;
    clientState.writeSourceForLevel = (scriptName, levelId, date, program) => {
      writtenLevelId = levelId;
    };
  });
  beforeEach(() => {
    writtenLevelId = undefined;
    appOptions = {
      level: {},
      report: {
        callback: 'http://bogus.url/string',
      },
      serverLevelId: 5,
    };
    setAppOptions(appOptions);
  });
  after(() => {
    clientState.writeSourceForLevel = oldWriteSource;
    window.appOptions = oldAppOptions;
  });

  it('stores attempts for logged-out users against the server level id', () => {
    setupApp(appOptions);
    appOptions.onAttempt({});

    expect(writtenLevelId).to.equal(5);
  });

  it('stores attempts for logged-out users against the server project level id if present', () => {
    appOptions.serverProjectLevelId = 10;
    setupApp(appOptions);
    appOptions.onAttempt({});

    expect(writtenLevelId).to.equal(10);
  });

  it('stores completed attempts for logged-out users against the server level id', () => {
    setupApp(appOptions);
    appOptions.onComplete({});

    expect(writtenLevelId).to.equal(5);
  });

  it('stores completed attempts for logged-out users against the server project level id if present', () => {
    appOptions.serverProjectLevelId = 10;
    setupApp(appOptions);
    appOptions.onComplete({});

    expect(writtenLevelId).to.equal(10);
  });

  it('loads attempt stored under server level id', () => {
    loadAppOptions();
  });
});
