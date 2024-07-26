import $ from 'jquery';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {files} from '@cdo/apps/clientApi';
import clientState from '@cdo/apps/code-studio/clientState';
import loadAppOptions, {
  setupApp,
  setAppOptions,
} from '@cdo/apps/code-studio/initApp/loadApp';
import project from '@cdo/apps/code-studio/initApp/project';
import * as imageUtils from '@cdo/apps/imageUtils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const SERVER_LEVEL_ID = 5;
const SERVER_PROJECT_LEVEL_ID = 10;
const OLD_CODE = '<some><blocks with="stuff">in<them/></blocks></some>';

jest.unmock('@cdo/apps/imageUtils');

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, writtenLevelId, readLevelId;

  beforeAll(() => {
    oldAppOptions = window.appOptions;
    sinon
      .stub(clientState, 'writeSourceForLevel')
      .callsFake((scriptName, levelId, date, program) => {
        writtenLevelId = levelId;
      });
    sinon
      .stub(clientState, 'sourceForLevel')
      .callsFake((scriptName, levelId, timestamp) => {
        readLevelId = levelId;
        return OLD_CODE;
      });
    sinon.stub(project, 'load').callsFake(() => ({
      then: successCallback => successCallback(),
    }));
    sinon.stub(project, 'hideBecauseAbusive').returns(false);
    sinon.stub(project, 'hideBecausePrivacyViolationOrProfane').returns(false);
    sinon.stub(project, 'getSharingDisabled').returns(false);
  });
  beforeEach(() => {
    sinon.stub(clientState, 'queryParams').returns(undefined);
    sinon.stub($, 'ajax').callsFake(() => ({
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
    clientState.writeSourceForLevel.restore();
    clientState.sourceForLevel.restore();
    project.load.restore();
    project.hideBecauseAbusive.restore();
    project.hideBecausePrivacyViolationOrProfane.restore();
    project.getSharingDisabled.restore();
    window.appOptions = oldAppOptions;
  });
  afterEach(() => {
    clientState.queryParams.restore();
    $.ajax.restore();
  });

  const stubQueryParams = (paramName, paramValue) => {
    clientState.queryParams.restore(); // restore the default stub
    sinon
      .stub(clientState, 'queryParams')
      .callsFake(param => (param === paramName ? paramValue : undefined));
  };

  const stubAppOptionsRequests = (
    appOptions,
    userAppOptionsResponse = {signedIn: false},
    exampleSolutionsResponse = []
  ) => {
    $.ajax.restore();
    const ajaxStub = sinon.stub($, 'ajax');
    ajaxStub.onCall(0).returns(exampleSolutionsResponse);
    ajaxStub.onCall(1).returns(userAppOptionsResponse);
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
          expect(readLevelId).to.equal(SERVER_LEVEL_ID);
          expect(window.appOptions.level.lastAttempt).to.equal(OLD_CODE);

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
          expect(readLevelId).to.equal(SERVER_PROJECT_LEVEL_ID);
          expect(window.appOptions.level.lastAttempt).to.equal(OLD_CODE);

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
          expect(window.appOptions.level.lastAttempt).to.be.undefined;
          expect(readLevelId).to.be.undefined;

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
          expect(window.appOptions.channel).to.equal(responseChannel);
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
          expect(window.appOptions.exampleSolutions).to.equal(exampleSolutions);
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
      sinon.stub(imageUtils, 'dataURIToFramedBlob');
      sinon.stub(files, 'putFile');
      appOptions.level.isProjectLevel = true;
      appOptions.level.edit_blocks = false;
    });

    afterEach(() => {
      files.putFile.restore();
      imageUtils.dataURIToFramedBlob.restore();
    });

    it('uploads a share image for a non-droplet project (instead of writing the level)', done => {
      imageUtils.dataURIToFramedBlob.callsFake((dataURI, callback) =>
        callback()
      );

      files.putFile.callsFake((name, blob) => {
        expect(writtenLevelId).to.be.undefined;
        expect(name).to.equal('_share_image.png');
        done();
      });

      setupApp(appOptions);
      appOptions.onAttempt({image: BLANK_PNG_PIXEL});

      // dataURIToFramedBlob gets called synchronously, eventually calls putFile.
      expect(imageUtils.dataURIToFramedBlob).to.have.been.calledOnce;
    });

    // Make sure we can prevent sharing of certain level types
    it('does nothing if the level has disabled sharing', () => {
      appOptions.level.disableSharing = true;
      setupApp(appOptions);
      appOptions.onAttempt({image: BLANK_PNG_PIXEL});
      expect(writtenLevelId).to.be.undefined;
      expect(imageUtils.dataURIToFramedBlob).not.to.have.been.called;
      expect(files.putFile).not.to.have.been.called;
    });

    // Catch the edge case with calc and eval projects, which don't generate
    // an image for sharing.
    it('does nothing if the provided report has no image', () => {
      setupApp(appOptions);
      appOptions.onAttempt({
        /* No image in report */
      });
      expect(writtenLevelId).to.be.undefined;
      expect(imageUtils.dataURIToFramedBlob).not.to.have.been.called;
      expect(files.putFile).not.to.have.been.called;
    });
  });
});
