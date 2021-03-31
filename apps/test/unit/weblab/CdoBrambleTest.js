import sinon from 'sinon';
import {assert, expect} from '../../util/reconfiguredChai';
import CdoBramble from '@cdo/apps/weblab/CdoBramble';

describe('CdoBramble', () => {
  const brambleUrl = 'https://bramble.org/index.html';
  const projectPath = '/project/123/';
  let cdoBramble, storeState;

  beforeEach(() => {
    const api = {
      getCurrentFileEntries: () => {},
      getCurrentFilesVersionId: () => {},
      registerBeforeFirstWriteHook: () => {},
      deleteProjectFile: () => {},
      renameProjectFile: () => {},
      changeProjectFile: () => {}
    };
    storeState = {
      maxProjectCapacity: 1000,
      pageConstants: {isReadOnlyWorkspace: false}
    };
    const mockStore = {
      getStore: () => ({
        getState: () => storeState
      })
    };

    cdoBramble = new CdoBramble(
      {},
      api,
      mockStore,
      brambleUrl,
      projectPath,
      []
    );

    sinon.stub(console, 'error');
    sinon.stub(console, 'warn');
  });

  afterEach(() => {
    console.error.restore();
    console.warn.restore();
  });

  describe('initProject', () => {
    describe('with an existing project', () => {
      beforeEach(() => {
        sinon
          .stub(cdoBramble.api, 'getCurrentFileEntries')
          .returns([{name: 'index.html'}]);
        sinon
          .stub(cdoBramble.api, 'getCurrentFilesVersionId')
          .returns('a1b2c3');
      });

      it('syncs files after creating root directory', () => {
        sinon
          .stub(cdoBramble, 'createProjectRootDir')
          .callsFake(callback => callback());
        sinon.stub(cdoBramble, 'syncFiles');
        cdoBramble.initProject(() => {});
        expect(cdoBramble.createProjectRootDir).to.have.been.calledOnce;
        expect(cdoBramble.syncFiles).to.have.been.calledOnce;
      });

      it('does not sync files if root directory creation fails', () => {
        sinon
          .stub(cdoBramble, 'createProjectRootDir')
          .callsFake(callback => callback(new Error()));
        sinon.stub(cdoBramble, 'syncFiles');
        cdoBramble.initProject(() => {});
        expect(cdoBramble.createProjectRootDir).to.have.been.calledOnce;
        expect(cdoBramble.syncFiles).to.not.have.been.called;
      });
    });
  });

  describe('config', () => {
    it('sets dynamic values from state', () => {
      const actualConfig = cdoBramble.config();
      expect(actualConfig.url).to.equal(brambleUrl);
      expect(actualConfig.capacity).to.equal(storeState.maxProjectCapacity);
      expect(actualConfig.initialUIState.readOnly).to.equal(
        storeState.pageConstants.isReadOnlyWorkspace
      );
    });
  });

  describe('syncFiles', () => {
    const projectVersion = 'a1b2c3';

    describe('with an already-synced version', () => {
      beforeEach(() => {
        cdoBramble.lastSyncedVersionId = projectVersion;
        cdoBramble.recentChanges = [{operation: 'delete', file: 'old.html'}];
        sinon.stub(cdoBramble, 'recursivelySaveChangesToServer');

        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
      });

      it('resets version and local changes', () => {
        expect(cdoBramble.lastSyncedVersionId).to.equal(projectVersion);
        expect(cdoBramble.recentChanges.length).to.equal(0);
      });

      it('saves local changes to server', () => {
        expect(cdoBramble.recursivelySaveChangesToServer).to.have.been
          .calledOnce;
      });
    });

    describe('with a new version', () => {
      beforeEach(() => {
        cdoBramble.lastSyncedVersionId = 'd4e5f6';
        cdoBramble.recentChanges = [{operation: 'change', file: 'index.html'}];
        sinon.stub(cdoBramble, 'overwriteProject');
      });

      it('warns that changes will be overwritten if there are any', () => {
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(console.warn).to.have.been.calledOnceWith(
          'CdoBramble recent changes will be overwritten by server changes!'
        );
      });

      it('resets version and local changes', () => {
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(cdoBramble.lastSyncedVersionId).to.equal(projectVersion);
        expect(cdoBramble.recentChanges.length).to.equal(0);
      });

      it('clears any registered beforeFirstWrite hook', () => {
        sinon.stub(cdoBramble.api, 'registerBeforeFirstWriteHook');
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(
          cdoBramble.api.registerBeforeFirstWriteHook
        ).to.have.been.calledOnceWith(null);
      });

      it('overwrites the project with given files', () => {
        const files = [{name: 'index.html'}];
        const callbackSpy = sinon.spy();
        cdoBramble.syncFiles(files, projectVersion, callbackSpy);
        expect(cdoBramble.overwriteProject).to.have.been.calledOnceWith(
          files,
          callbackSpy
        );
      });
    });
  });

  describe('handleFileChange', () => {
    const filename = 'index.html';
    let fileChange;

    beforeEach(() => {
      fileChange = {
        operation: 'change',
        file: filename,
        fileDataPath: projectPath + filename
      };
    });

    it('adds a change operation for the file', () => {
      expect(cdoBramble.recentChanges.length).to.equal(0);
      cdoBramble.handleFileChange(projectPath + filename);
      expect(cdoBramble.recentChanges).to.deep.equal([fileChange]);
    });

    it('does not add a change operation if one already exists for the file', () => {
      cdoBramble.recentChanges = [{...fileChange}];
      cdoBramble.handleFileChange(projectPath + filename);
      expect(cdoBramble.recentChanges).to.deep.equal([fileChange]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = sinon.stub();
      const callbackSpy2 = sinon.stub();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.handleFileChange('index.html');
      expect(callbackSpy1).to.have.been.calledOnce;
      expect(callbackSpy2).to.have.been.calledOnce;
    });
  });

  describe('onFileDeleted', () => {
    it('adds a delete operation for the file', () => {
      expect(cdoBramble.recentChanges.length).to.equal(0);
      cdoBramble.onFileDeleted(projectPath + 'index.html');
      expect(cdoBramble.recentChanges).to.deep.equal([
        {operation: 'delete', file: 'index.html'}
      ]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = sinon.stub();
      const callbackSpy2 = sinon.stub();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.onFileDeleted('index.html');
      expect(callbackSpy1).to.have.been.calledOnce;
      expect(callbackSpy2).to.have.been.calledOnce;
    });
  });

  describe('onFileRenamed', () => {
    const oldPath = projectPath + 'old.html';
    const newPath = projectPath + 'new.html';

    it('updates fileDataPath for recent change if one exists', () => {
      cdoBramble.recentChanges = [
        {operation: 'change', fileDataPath: 'other.html'},
        {operation: 'change', fileDataPath: oldPath},
        {operation: 'delete', fileDataPath: 'style.css'}
      ];
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(cdoBramble.recentChanges).to.deep.equal([
        {operation: 'change', fileDataPath: 'other.html'},
        {operation: 'change', fileDataPath: newPath},
        {operation: 'delete', fileDataPath: 'style.css'},
        {operation: 'rename', file: 'old.html', newFile: 'new.html'}
      ]);
    });

    it('adds a rename operation for the file', () => {
      expect(cdoBramble.recentChanges.length).to.equal(0);
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(cdoBramble.recentChanges).to.deep.equal([
        {operation: 'rename', file: 'old.html', newFile: 'new.html'}
      ]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = sinon.stub();
      const callbackSpy2 = sinon.stub();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(callbackSpy1).to.have.been.calledOnce;
      expect(callbackSpy2).to.have.been.calledOnce;
    });
  });

  describe('uploadAllFilesToServer', () => {
    let fileEntries;

    beforeEach(() => {
      fileEntries = [{path: 'index.html'}, {path: 'style.css'}];
      sinon.stub(cdoBramble, 'shell').returns({
        ls: (path, callback) => callback(null, fileEntries)
      });
      sinon
        .stub(cdoBramble, 'getFileData')
        .callsFake((path, callback) => callback(null, 'my file data'));
      sinon
        .stub(cdoBramble.api, 'changeProjectFile')
        .callsFake((filename, fileData, callback) =>
          callback(null, 'new-version-id')
        );
    });

    it('uploads all files in Bramble file system to server', done => {
      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).to.equal(null);
        expect(wasSuccessful).to.be.true;
        expect(console.error).not.to.have.been.called;
        expect(cdoBramble.getFileData).to.have.been.calledTwice;
        expect(cdoBramble.api.changeProjectFile).to.have.been.calledTwice;
        expect(cdoBramble.lastSyncedVersionId).to.equal('new-version-id');
        done();
      });
    });

    it('exits early if request for file entries fails', done => {
      cdoBramble.shell.restore();
      sinon.stub(cdoBramble, 'shell').returns({
        ls: (path, callback) => callback(new Error(), null)
      });

      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).not.to.equal(null);
        expect(wasSuccessful).to.be.undefined;
        expect(console.error).to.have.been.calledOnce;
        expect(cdoBramble.getFileData).not.to.have.been.called;
        done();
      });
    });

    it('exits early if getFileData fails', done => {
      cdoBramble.getFileData.restore();
      sinon
        .stub(cdoBramble, 'getFileData')
        .callsFake((path, callback) => callback(new Error(), null));

      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).not.to.equal(null);
        expect(wasSuccessful).to.be.undefined;
        expect(cdoBramble.getFileData).to.have.been.calledOnce;
        done();
      });
    });

    it('exits early if file fails to save to server', done => {
      cdoBramble.api.changeProjectFile.restore();
      sinon
        .stub(cdoBramble.api, 'changeProjectFile')
        .callsFake((filename, fileData, callback) =>
          callback(new Error(), null)
        );

      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).not.to.equal(null);
        expect(wasSuccessful).to.be.undefined;
        expect(cdoBramble.getFileData).to.have.been.calledOnce;
        expect(cdoBramble.api.changeProjectFile).to.have.been.calledOnce;
        done();
      });
    });
  });

  describe('recursivelySaveChangesToServer', () => {
    beforeEach(() => {
      sinon
        .stub(cdoBramble.api, 'deleteProjectFile')
        .callsFake((filename, callback) => callback());
      sinon
        .stub(cdoBramble.api, 'renameProjectFile')
        .callsFake((oldFilename, newFilename, callback) => callback());
      sinon
        .stub(cdoBramble, 'getFileData')
        .callsFake((path, callback) => callback(null, 'my file data'));
      sinon
        .stub(cdoBramble.api, 'changeProjectFile')
        .callsFake((filename, fileData, callback) => callback());
    });

    it('saves each change to the server', done => {
      const changes = [
        {operation: 'delete', file: 'style.css'},
        {operation: 'rename', file: 'old.html', newFile: 'new.html'},
        {operation: 'change', file: 'index.html'}
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.api.deleteProjectFile).to.have.been.calledOnceWith(
          'style.css'
        );
        expect(cdoBramble.api.renameProjectFile).to.have.been.calledOnceWith(
          'old.html',
          'new.html'
        );
        expect(cdoBramble.getFileData).to.have.been.calledOnce;
        expect(cdoBramble.api.changeProjectFile).to.have.been.calledOnceWith(
          'index.html',
          'my file data'
        );
        expect(console.error).not.to.have.been.called;
        done();
      });
    });

    it('invokes the callback if there are no changes', done => {
      cdoBramble.recursivelySaveChangesToServer([], 0, () => {
        expect(cdoBramble.api.deleteProjectFile).not.to.have.been.called;
        expect(cdoBramble.api.renameProjectFile).not.to.have.been.called;
        expect(cdoBramble.getFileData).not.to.have.been.called;
        expect(cdoBramble.api.changeProjectFile).not.to.have.been.called;
        expect(console.error).not.to.have.been.called;
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelySaveChangesToServer([{}], 1, () => {
        expect(cdoBramble.api.deleteProjectFile).not.to.have.been.called;
        expect(cdoBramble.api.renameProjectFile).not.to.have.been.called;
        expect(cdoBramble.getFileData).not.to.have.been.called;
        expect(cdoBramble.api.changeProjectFile).not.to.have.been.called;
        expect(console.error).not.to.have.been.called;
        done();
      });
    });

    it('saves the next change if a change fails to save', done => {
      cdoBramble.api.deleteProjectFile.restore();
      sinon
        .stub(cdoBramble.api, 'deleteProjectFile')
        .callsFake((filename, callback) => callback(new Error(), null));

      const changes = [
        {operation: 'delete', file: 'style.css'},
        {operation: 'change', file: 'index.html'}
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.api.deleteProjectFile).to.have.been.calledOnce;
        expect(cdoBramble.getFileData).to.have.been.calledOnce;
        expect(cdoBramble.api.changeProjectFile).to.have.been.calledOnce;
        done();
      });
    });

    it('updates lastSyncedVersionId if received from the server', done => {
      cdoBramble.api.renameProjectFile.restore();
      sinon
        .stub(cdoBramble.api, 'renameProjectFile')
        .callsFake((oldFilename, newFilename, callback) =>
          callback(null, 'new-version-id')
        );

      cdoBramble.lastSyncedVersionId = null;
      const changes = [
        {operation: 'rename', file: 'old.css', newFile: 'new.css'}
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.lastSyncedVersionId).to.equal('new-version-id');
        expect(cdoBramble.api.deleteProjectFile).not.to.have.been.called;
        expect(cdoBramble.api.renameProjectFile).to.have.been.calledOnce;
        expect(cdoBramble.getFileData).not.to.have.been.called;
        expect(cdoBramble.api.changeProjectFile).not.to.have.been.called;
        expect(console.error).not.to.have.been.called;
        done();
      });
    });
  });

  describe('recursivelyWriteFiles', () => {
    beforeEach(() => {
      sinon
        .stub(cdoBramble, 'downloadFile')
        .callsFake((url, callback) => callback('my file data', null));
      sinon
        .stub(cdoBramble, 'writeFileData')
        .callsFake((path, data, callback) => callback(null));
    });

    it('downloads file data and writes it to bramble', done => {
      const files = [
        {name: 'index.html', url: '/v3/files/a1b2c3/index.html', versionId: 1},
        {name: 'style.css', url: '/v3/files/a1b2c3/style.css'}
      ];
      cdoBramble.recursivelyWriteFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).to.have.been.calledTwice;
        assert(
          cdoBramble.downloadFile
            .getCall(0)
            .calledWith('/v3/files/a1b2c3/index.html?version=1')
        );
        assert(
          cdoBramble.downloadFile
            .getCall(1)
            .calledWith('/v3/files/a1b2c3/style.css')
        );
        expect(cdoBramble.writeFileData).to.have.been.calledTwice;
        assert(
          cdoBramble.writeFileData
            .getCall(0)
            .calledWith(projectPath + 'index.html')
        );
        assert(
          cdoBramble.writeFileData
            .getCall(1)
            .calledWith(projectPath + 'style.css')
        );
        expect(console.error).not.to.have.been.called;
        done();
      });
    });

    it('invokes the callback if there are no files', done => {
      cdoBramble.recursivelyWriteFiles([], 0, () => {
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelyWriteFiles([{}], 1, () => {
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        done();
      });
    });

    it('writes the next file if a file fails to download', done => {
      cdoBramble.downloadFile.restore();
      const downloadFileStub = sinon.stub(cdoBramble, 'downloadFile');
      downloadFileStub
        .onFirstCall()
        .callsFake((url, callback) => callback(null, new Error()));
      downloadFileStub
        .onSecondCall()
        .callsFake((url, callback) => callback('my file data', null));

      const files = [
        {name: 'index.html', url: '/v3/files/abc/index.html'},
        {name: 'other.html', url: '/v3/files/abc/other.html'}
      ];
      cdoBramble.recursivelyWriteFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).to.have.been.calledTwice;
        expect(cdoBramble.writeFileData).to.have.been.calledOnce;
        done();
      });
    });
  });

  describe('recursivelyWriteSourceFiles', () => {
    beforeEach(() => {
      sinon
        .stub(cdoBramble, 'downloadFile')
        .callsFake((url, callback) => callback('my file data', null));
      sinon
        .stub(cdoBramble, 'writeFileData')
        .callsFake((path, data, callback) => callback(null));
    });

    it('invokes the callback if there are no source files', done => {
      cdoBramble.recursivelyWriteSourceFiles([], 0, () => {
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        expect(cdoBramble.writeFileData).not.to.have.been.called;
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelyWriteSourceFiles([{}], 1, () => {
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        expect(cdoBramble.writeFileData).not.to.have.been.called;
        done();
      });
    });

    it('does not write invalid source files', done => {
      const invalidFiles = [
        {data: '<div></div>'}, // no name
        {name: 'index.html'} // no URL or data
      ];
      cdoBramble.recursivelyWriteSourceFiles(invalidFiles, 0, () => {
        expect(console.error).to.have.been.calledTwice;
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        expect(cdoBramble.writeFileData).not.to.have.been.called;
        done();
      });
    });

    it('downloads file before writing if it has a url', done => {
      const file = {name: 'index.html', url: '/v3/files/1234/index.html'};
      cdoBramble.recursivelyWriteSourceFiles([file], 0, () => {
        expect(cdoBramble.downloadFile).to.have.been.calledOnce;
        expect(cdoBramble.writeFileData).to.have.been.calledOnce;
        done();
      });
    });

    it('writes file if it has data', done => {
      const file = {name: 'index.html', data: '<div></div>'};
      cdoBramble.recursivelyWriteSourceFiles([file], 0, () => {
        expect(cdoBramble.downloadFile).not.to.have.been.called;
        expect(cdoBramble.writeFileData).to.have.been.calledOnce;
        done();
      });
    });

    it('writes next file if a file fails', done => {
      cdoBramble.downloadFile.restore();
      sinon
        .stub(cdoBramble, 'downloadFile')
        .callsFake((url, callback) => callback(null, new Error()));

      const files = [
        {name: 'style.css'}, // invalid file
        {name: 'index.html', url: '/v3/files/1234/index.html'}, // will fail to download
        {name: 'other.html', data: '<div></div>'} // will succeed
      ];
      cdoBramble.recursivelyWriteSourceFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).to.have.been.calledOnce;
        expect(cdoBramble.writeFileData).to.have.been.calledOnce;
        expect(console.error).to.have.been.calledOnce;
        done();
      });
    });
  });
});
