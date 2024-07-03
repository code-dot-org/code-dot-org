import $ from 'jquery';

import {files} from '@cdo/apps/clientApi';
import clientState from '@cdo/apps/code-studio/clientState';
import loadAppOptions, {
  setupApp,
  setAppOptions,
} from '@cdo/apps/code-studio/initApp/loadApp';
import project from '@cdo/apps/code-studio/initApp/project';
import * as imageUtils from '@cdo/apps/imageUtils';



const SERVER_LEVEL_ID = 5;
const SERVER_PROJECT_LEVEL_ID = 10;
const OLD_CODE = '<some><blocks with="stuff">in<them/></blocks></some>';

jest.unmock('@cdo/apps/imageUtils');

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, writtenLevelId, readLevelId;

  beforeAll(() => {
    oldAppOptions = window.appOptions;
    jest.spyOn(clientState, 'writeSourceForLevel').mockClear()
      .mockImplementation((scriptName, levelId, date, program) => {
        writtenLevelId = levelId;
      });
    jest.spyOn(clientState, 'sourceForLevel').mockClear()
      .mockImplementation((scriptName, levelId, timestamp) => {
        readLevelId = levelId;
        return OLD_CODE;
      });
    jest.spyOn(project, 'load').mockClear().mockImplementation(() => ({
      then: successCallback => successCallback(),
    }));
    jest.spyOn(project, 'hideBecauseAbusive').mockClear().mockReturnValue(false);
    jest.spyOn(project, 'hideBecausePrivacyViolationOrProfane').mockClear().mockReturnValue(false);
    jest.spyOn(project, 'getSharingDisabled').mockClear().mockReturnValue(false);
  });
  beforeEach(() => {
    jest.spyOn(clientState, 'queryParams').mockClear().mockReturnValue(undefined);
    jest.spyOn($, 'ajax').mockClear().mockImplementation(() => ({
      done: successCallback => ({
        fail: failureCallback => {
          successCallback({signedIn: false});
        },
      }),
    }));
    writtenLevelId = undefined;
    readLevelId = undefined;
    appOptions = {
      level: {},
    };
    setAppOptions(appOptions);
  });
  afterAll(() => {
    clientState.writeSourceForLevel.mockRestore();
    clientState.sourceForLevel.mockRestore();
    project.load.mockRestore();
    project.hideBecauseAbusive.mockRestore();
    project.hideBecausePrivacyViolationOrProfane.mockRestore();
    project.getSharingDisabled.mockRestore();
    window.appOptions = oldAppOptions;
  });
  afterEach(() => {
    clientState.queryParams.mockRestore();
    $.ajax.mockRestore();
  });

  const stubQueryParams = (paramName, paramValue) => {
    clientState.queryParams.mockRestore(); // restore the default stub
    jest.spyOn(clientState, 'queryParams').mockClear()
      .mockImplementation(param => (param === paramName ? paramValue : undefined));
  };

  const stubAppOptionsRequests = (
    appOptions,
    userAppOptionsResponse = {signedIn: false},
    exampleSolutionsResponse = []
  ) => {
    $.ajax.mockRestore();
    const ajaxStub = jest.spyOn($, 'ajax').mockClear().mockImplementation();
    ajaxStub.mockImplementation(() => {
      if (ajaxStub.mock.calls.length === 0) {
        return exampleSolutionsResponse;
      }
    });
    ajaxStub.mockImplementation(() => {
      if (ajaxStub.mock.calls.length === 1) {
        return userAppOptionsResponse;
      }
    });
  };

  describe('loadAppAsync for cached levels', () => {
    beforeEach(() => {
      appOptions = {
        ...appOptions,
        publicCaching: true,
        scriptName: 'test-script',
        lessonPosition: '1',
        levelPosition: '2',
        serverLevelId: SERVER_LEVEL_ID,
      };
    });

    it('loads attempt stored under server level id', done => {
      const appOptionsData = document.createElement('script');
      appOptionsData.setAttribute(
        'data-appoptions',
        JSON.stringify(appOptions)
      );
      document.body.appendChild(appOptionsData);

      loadAppOptions()
        .then(() => {
          expect(readLevelId).toBe(SERVER_LEVEL_ID);
          expect(window.appOptions.level.lastAttempt).toBe(OLD_CODE);

          document.body.removeChild(appOptionsData);
          done();
        })
        .catch(err => done(err));
    });

    it('loads attempt stored under project server level id for template backed level', done => {
      appOptions.serverProjectLevelId = SERVER_PROJECT_LEVEL_ID;
      const appOptionsData = document.createElement('script');
      appOptionsData.setAttribute(
        'data-appoptions',
        JSON.stringify(appOptions)
      );
      document.body.appendChild(appOptionsData);

      loadAppOptions()
        .then(() => {
          expect(readLevelId).toBe(SERVER_PROJECT_LEVEL_ID);
          expect(window.appOptions.level.lastAttempt).toBe(OLD_CODE);

          document.body.removeChild(appOptionsData);
          done();
        })
        .catch(err => done(err));
    });

    it('does not load a last attempt when viewing a solution', done => {
      const appOptionsData = document.createElement('script');
      appOptionsData.setAttribute(
        'data-appoptions',
        JSON.stringify(appOptions)
      );
      document.body.appendChild(appOptionsData);
      stubQueryParams('solution', 'true');

      loadAppOptions()
        .then(() => {
          expect(window.appOptions.level.lastAttempt).toBeUndefined();
          expect(readLevelId).toBeUndefined();

          document.body.removeChild(appOptionsData);
          done();
        })
        .catch(err => done(err));
    });

    it('gets channel if appOptions has levelRequiresChannel true and no channel', done => {
      appOptions = {
        ...appOptions,
        levelRequiresChannel: true,
      };

      const responseChannel = 'fakeChannelId';
      stubAppOptionsRequests(appOptions, {
        signedIn: false,
        channel: responseChannel,
      });

      const appOptionsData = document.createElement('script');
      appOptionsData.setAttribute(
        'data-appoptions',
        JSON.stringify(appOptions)
      );
      document.body.appendChild(appOptionsData);

      loadAppOptions()
        .then(() => {
          expect(window.appOptions.channel).toBe(responseChannel);
          document.body.removeChild(appOptionsData);
          done();
        })
        .catch(err => done(err));
    });

    it('calls example_solutions endpoint and sets example solutions to appOptions', done => {
      appOptions = {
        ...appOptions,
        serverScriptLevelId: '5',
      };

      const exampleSolutions = ['/example-solution'];
      stubAppOptionsRequests(
        appOptions,
        {
          signedIn: false,
        },
        exampleSolutions
      );

      const appOptionsData = document.createElement('script');
      appOptionsData.setAttribute(
        'data-appoptions',
        JSON.stringify(appOptions)
      );
      document.body.appendChild(appOptionsData);

      loadAppOptions()
        .then(() => {
          expect(window.appOptions.exampleSolutions).toBe(exampleSolutions);
          document.body.removeChild(appOptionsData);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('project level share images', () => {
    const BLANK_PNG_PIXEL =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    beforeEach(() => {
      jest.spyOn(imageUtils, 'dataURIToFramedBlob').mockClear().mockImplementation();
      jest.spyOn(files, 'putFile').mockClear().mockImplementation();
      appOptions.level.isProjectLevel = true;
      appOptions.level.edit_blocks = false;
    });

    afterEach(() => {
      files.putFile.mockRestore();
      imageUtils.dataURIToFramedBlob.mockRestore();
    });

    it('uploads a share image for a non-droplet project (instead of writing the level)', done => {
      imageUtils.dataURIToFramedBlob.callsFake((dataURI, callback) =>
        callback()
      );

      files.putFile.callsFake((name, blob) => {
        expect(writtenLevelId).toBeUndefined();
        expect(name).toBe('_share_image.png');
        done();
      });

      setupApp(appOptions);
      appOptions.onAttempt({image: BLANK_PNG_PIXEL});

      // dataURIToFramedBlob gets called synchronously, eventually calls putFile.
      expect(imageUtils.dataURIToFramedBlob).toHaveBeenCalledTimes(1);
    });

    // Make sure we can prevent sharing of certain level types
    it('does nothing if the level has disabled sharing', () => {
      appOptions.level.disableSharing = true;
      setupApp(appOptions);
      appOptions.onAttempt({image: BLANK_PNG_PIXEL});
      expect(writtenLevelId).toBeUndefined();
      expect(imageUtils.dataURIToFramedBlob).not.toHaveBeenCalled();
      expect(files.putFile).not.toHaveBeenCalled();
    });

    // Catch the edge case with calc and eval projects, which don't generate
    // an image for sharing.
    it('does nothing if the provided report has no image', () => {
      setupApp(appOptions);
      appOptions.onAttempt({
        /* No image in report */
      });
      expect(writtenLevelId).toBeUndefined();
      expect(imageUtils.dataURIToFramedBlob).not.toHaveBeenCalled();
      expect(files.putFile).not.toHaveBeenCalled();
    });
  });
});
