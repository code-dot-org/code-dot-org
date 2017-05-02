import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import project from '@cdo/apps/code-studio/initApp/project';
import {files as filesApi} from '@cdo/apps/clientApi';
import header from '@cdo/apps/code-studio/header';

describe('project.js', () => {

  describe('project.getProjectUrl', function () {

    let stubUrl;
    let url;

    beforeEach(function () {
      stubUrl = sinon.stub(project, 'getUrl').callsFake(() => url);
    });

    afterEach(function () {
      stubUrl.restore();
    });

    it('typical url', function () {
      url = 'http://url';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes', function () {
      url = 'http://url//';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with query string', function () {
      url = 'http://url?query';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });

    it('with hash', function () {
      url = 'http://url#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes, query, and hash', function () {
      url = 'http://url/?query#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });
  });

  describe('toggleMakerEnabled()', () => {
    let sourceHandler;

    beforeEach(() => {
      sourceHandler = createStubSourceHandler();
      replaceOnWindow('appOptions', {
        level: {
          isProjectLevel: true,
        },
      });
      sinon.stub(window.location, 'reload');
      sinon.stub(project, 'save').callsFake((source, callback) => {
        callback();
      });
    });

    afterEach(() => {
      project.save.restore();
      window.location.reload.restore();
      restoreOnWindow('appOptions');
    });

    it('performs a save with maker enabled if it was disabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(false);
      project.init(sourceHandler);
      return project.toggleMakerEnabled().then(() => {
        expect(project.save).to.have.been.called;
        expect(project.save.getCall(0).args[0].makerAPIsEnabled).to.be.true;
      });
    });

    it('performs a save with maker disabled if it was enabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(true);
      project.init(sourceHandler);
      return project.toggleMakerEnabled().then(() => {
        expect(project.save).to.have.been.called;
        expect(project.save.getCall(0).args[0].makerAPIsEnabled).to.be.false;
      });
    });

    it('always results in a page reload', () => {
      project.init(sourceHandler);
      expect(window.location.reload).not.to.have.been.called;
      return project.toggleMakerEnabled().then(() => {
        expect(window.location.reload).to.have.been.called;
      });
    });
  });
});

describe('project.saveThumbnail', () => {
  const STUB_CHANNEL_ID = 'STUB-CHANNEL-ID';
  const STUB_BLOB = 'stub-binary-data';

  beforeEach(() => {
    sinon.stub(header, 'updateTimestamp');
    sinon.stub(filesApi, 'putFile');

    const projectData = {
      id: STUB_CHANNEL_ID,
      isOwner: true
    };
    project.updateCurrentData_(null, projectData);
  });

  afterEach(() => {
    project.updateCurrentData_(null, undefined);

    filesApi.putFile.restore();
    header.updateTimestamp.restore();
  });

  it('calls filesApi.putFile with correct parameters', () => {
    project.saveThumbnail(STUB_BLOB);

    expect(filesApi.putFile).to.have.been.calledOnce;
    const call = filesApi.putFile.getCall(0);
    expect(call.args[0]).to.equal('.metadata/thumbnail.png');
    expect(call.args[1]).to.equal(STUB_BLOB);
  });

  it('succeeds if filesApi.putFile succeeds', done => {
    filesApi.putFile.callsFake((path, blob, success, error) => success());

    project.saveThumbnail(STUB_BLOB).then(done);
  });

  it('fails if project is not initialized', done => {
    project.__TestInterface.setCurrentData(undefined);

    const promise = project.saveThumbnail(STUB_BLOB);
    promise.catch(e => {
      expect(e).to.contain('Project not initialized');
      expect(filesApi.putFile).not.to.have.been.called;
      done();
    });
  });

  it('fails if project is not owned by the current user', done => {
    project.__TestInterface.setCurrentData({});

    project.saveThumbnail(STUB_BLOB).catch(e => {
      expect(e).to.contain('Project not owned by current user');
      expect(filesApi.putFile).not.to.have.been.called;
      done();
    });
  });

  it('fails if filesApi.putFile fails', done => {
    filesApi.putFile.callsFake((path, blob, success, error) => error('foo'));

    project.saveThumbnail(STUB_BLOB).catch(e => {
      expect(e).to.contain('foo');
      done();
    });
  });
});

function createStubSourceHandler() {
  return {
    setInitialLevelHtml: sinon.stub(),
    getLevelHtml: sinon.stub(),
    setInitialLevelSource: sinon.stub(),
    getLevelSource: sinon.stub().resolves(),
    setInitialAnimationList: sinon.stub(),
    getAnimationList: sinon.stub().callsFake(cb => cb({})),
    setMakerAPIsEnabled: sinon.stub(),
    getMakerAPIsEnabled: sinon.stub(),
  };
}
