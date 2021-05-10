import $ from 'jquery';
import clientState from '@cdo/apps/code-studio/clientState';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import loadAppOptions, {
  setupApp,
  setAppOptions
} from '@cdo/apps/code-studio/initApp/loadApp';
import {files} from '@cdo/apps/clientApi';
import * as imageUtils from '@cdo/apps/imageUtils';

const SERVER_LEVEL_ID = 5;
const SERVER_PROJECT_LEVEL_ID = 10;
const OLD_CODE = '<some><blocks with="stuff">in<them/></blocks></some>';

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, writtenLevelId, readLevelId;

  before(() => {
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
    sinon.stub($, 'ajax').callsFake(() => ({
      done: successCallback => ({
        fail: failureCallback => {
          successCallback({signedIn: false});
        }
      })
    }));
  });
  beforeEach(() => {
    writtenLevelId = undefined;
    readLevelId = undefined;
    appOptions = {
      level: {},
      report: {
        callback: 'http://bogus.url/string'
      },
      serverLevelId: SERVER_LEVEL_ID
    };
    setAppOptions(appOptions);
  });
  after(() => {
    clientState.writeSourceForLevel.restore();
    clientState.sourceForLevel.restore();
    $.ajax.restore();
    window.appOptions = oldAppOptions;
  });

  it('loads attempt stored under server level id', done => {
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

  it('loads attempt stored under project server level id for template backed level', done => {
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

  it('does not load a last attempt when viewing a solution', done => {
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);
    const queryParamsStub = sinon
      .stub(clientState, 'queryParams')
      .callsFake(param => {
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

  it('does not load a last attempt when viewing a student solution', done => {
    const appOptionsData = document.createElement('script');
    appOptionsData.setAttribute('data-appoptions', JSON.stringify(appOptions));
    document.body.appendChild(appOptionsData);
    const queryParamsStub = sinon
      .stub(clientState, 'queryParams')
      .callsFake(param => {
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

  describe('project level share images', () => {
    const BLANK_PNG_PIXEL =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    beforeEach(() => {
      sinon.spy(imageUtils, 'dataURIToFramedBlob');
      sinon.stub(files, 'putFile');
      appOptions.level.isProjectLevel = true;
      appOptions.level.edit_blocks = false;
    });

    afterEach(() => {
      files.putFile.restore();
      imageUtils.dataURIToFramedBlob.restore();
    });

    it('uploads a share image for a non-droplet project (instead of writing the level)', done => {
      files.putFile.callsFake((name, blob) => {
        expect(writtenLevelId).to.be.undefined;
        expect(name).to.equal('_share_image.png');
        expect(blob).to.have.property('type', 'image/png');
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
