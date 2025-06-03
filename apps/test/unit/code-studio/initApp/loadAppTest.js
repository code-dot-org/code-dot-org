import $ from 'jquery';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {files} from '@cdo/apps/clientApi';
import clientState from '@cdo/apps/code-studio/clientState';
import {setupApp, setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import project from '@cdo/apps/code-studio/initApp/project';
import * as imageUtils from '@cdo/apps/imageUtils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const OLD_CODE = '<some><blocks with="stuff">in<them/></blocks></some>';

jest.unmock('@cdo/apps/imageUtils');

describe('loadApp.js', () => {
  let oldAppOptions, appOptions, writtenLevelId;

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
