import CdoBramble from '@cdo/apps/weblab/CdoBramble';

import {assert} from '../../util/reconfiguredChai';

const DISALLOWED_HTML_TAGS = ['script', 'a'];
const VALID_HTML = `<!DOCTYPE html>
<html>
  <head>
    
  </head>
  <body>
    <p>Important paragraph.</p>
  </body>
</html>`;
const INVALID_HTML = `<!DOCTYPE html>
<html>
  <body>
    <script src="index.js">
    </script>
    Content outside diallowed tag <a href="/some.url">I will be deleted!</a>
    <div>divs are allowed</div>
  </body>
</html>`;
const FIXED_INVALID_HTML = `<!DOCTYPE html>
<html>
  <head>
    
  </head>
  <body>
    Content outside diallowed tag 
    <div>divs are allowed</div>
  </body>
</html>`;

describe('CdoBramble', () => {
  const brambleUrl = 'https://bramble.org/index.html';
  const projectPath = '/project/123/';
  let cdoBramble, storeState;

  beforeEach(() => {
    const api = {
      getCurrentFileEntries: () => {},
      getCurrentFilesVersionId: () => {},
      getStartSources: () => {},
      registerBeforeFirstWriteHook: () => {},
      deleteProjectFile: () => {},
      renameProjectFile: () => {},
      changeProjectFile: () => {},
      openDisallowedHtmlDialog: () => {},
    };
    storeState = {
      maxProjectCapacity: 1000,
      pageConstants: {isReadOnlyWorkspace: false},
    };
    const mockStore = {
      getStore: () => ({
        getState: () => storeState,
      }),
    };

    cdoBramble = new CdoBramble(
      {},
      api,
      mockStore,
      brambleUrl,
      projectPath,
      []
    );

    jest.spyOn(console, 'error').mockClear().mockImplementation();
    jest.spyOn(console, 'warn').mockClear().mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initProject', () => {
    describe('with an existing project', () => {
      beforeEach(() => {
        jest.spyOn(cdoBramble.api, 'getCurrentFileEntries').mockClear()
          .mockReturnValue([{name: 'index.html'}]);
        jest.spyOn(cdoBramble.api, 'getCurrentFilesVersionId').mockClear()
          .mockReturnValue('a1b2c3');
      });
      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('syncs files after creating root directory', () => {
        jest.spyOn(cdoBramble, 'createProjectRootDir').mockClear()
          .mockImplementation(callback => callback());
        jest.spyOn(cdoBramble, 'syncFiles').mockClear().mockImplementation();
        cdoBramble.initProject(() => {});
        expect(cdoBramble.createProjectRootDir).toHaveBeenCalledTimes(1);
        expect(cdoBramble.syncFiles).toHaveBeenCalledTimes(1);
      });

      it('does not sync files if root directory creation fails', () => {
        jest.spyOn(cdoBramble, 'createProjectRootDir').mockClear()
          .mockImplementation(callback => callback(new Error()));
        jest.spyOn(cdoBramble, 'syncFiles').mockClear().mockImplementation();
        cdoBramble.initProject(() => {});
        expect(cdoBramble.createProjectRootDir).toHaveBeenCalledTimes(1);
        expect(cdoBramble.syncFiles).not.toHaveBeenCalled();
      });
    });
  });

  describe('config', () => {
    it('sets dynamic values from state', () => {
      const actualConfig = cdoBramble.config();
      expect(actualConfig.url).toBe(brambleUrl);
      expect(actualConfig.capacity).toBe(storeState.maxProjectCapacity);
      expect(actualConfig.initialUIState.readOnly).toBe(storeState.pageConstants.isReadOnlyWorkspace);
    });
  });

  describe('syncFiles', () => {
    const projectVersion = 'a1b2c3';

    describe('with an already-synced version', () => {
      beforeEach(() => {
        cdoBramble.lastSyncedVersionId = projectVersion;
        cdoBramble.recentChanges = [{operation: 'delete', file: 'old.html'}];
        jest.spyOn(cdoBramble, 'recursivelySaveChangesToServer').mockClear().mockImplementation();

        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
      });
      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('resets version and local changes', () => {
        expect(cdoBramble.lastSyncedVersionId).toBe(projectVersion);
        expect(cdoBramble.recentChanges.length).toBe(0);
      });

      it('saves local changes to server', () => {
        expect(cdoBramble.recursivelySaveChangesToServer).toHaveBeenCalledTimes(1);
      });
    });

    describe('with a new version', () => {
      beforeEach(() => {
        cdoBramble.lastSyncedVersionId = 'd4e5f6';
        cdoBramble.recentChanges = [{operation: 'change', file: 'index.html'}];
        jest.spyOn(cdoBramble, 'overwriteProject').mockClear().mockImplementation();
      });
      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('warns that changes will be overwritten if there are any', () => {
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(console.warn).to.have.been.calledOnceWith(
          'CdoBramble recent changes will be overwritten by server changes!'
        );
      });

      it('resets version and local changes', () => {
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(cdoBramble.lastSyncedVersionId).toBe(projectVersion);
        expect(cdoBramble.recentChanges.length).toBe(0);
      });

      it('clears any registered beforeFirstWrite hook', () => {
        jest.spyOn(cdoBramble.api, 'registerBeforeFirstWriteHook').mockClear().mockImplementation();
        cdoBramble.syncFiles([{name: 'index.html'}], projectVersion, () => {});
        expect(
          cdoBramble.api.registerBeforeFirstWriteHook
        ).to.have.been.calledOnceWith(null);
      });

      it('overwrites the project with given files', () => {
        const files = [{name: 'index.html'}];
        const callbackSpy = jest.fn();
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
        fileDataPath: projectPath + filename,
      };
    });

    it('adds a change operation for the file', () => {
      expect(cdoBramble.recentChanges.length).toBe(0);
      cdoBramble.handleFileChange(projectPath + filename);
      expect(cdoBramble.recentChanges).toEqual([fileChange]);
    });

    it('does not add a change operation if one already exists for the file', () => {
      cdoBramble.recentChanges = [{...fileChange}];
      cdoBramble.handleFileChange(projectPath + filename);
      expect(cdoBramble.recentChanges).toEqual([fileChange]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = jest.fn();
      const callbackSpy2 = jest.fn();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.handleFileChange('index.html');
      expect(callbackSpy1).toHaveBeenCalledTimes(1);
      expect(callbackSpy2).toHaveBeenCalledTimes(1);
    });
  });

  describe('detectDisallowedHtml', () => {
    beforeEach(() => {
      cdoBramble.disallowedHtmlTags = DISALLOWED_HTML_TAGS;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('no-ops if reading file errored', () => {
      const error = new Error('oh no');
      jest.spyOn(cdoBramble, 'getFileData').mockClear()
        .mockImplementation((path, callback) => callback(error, null));
      jest.spyOn(cdoBramble, 'domFromString').mockClear().mockImplementation();
      const callbackSpy = jest.fn();

      cdoBramble.detectDisallowedHtml('/index.html', callbackSpy);

      expect(callbackSpy).to.have.been.calledOnceWith(error);
      expect(cdoBramble.domFromString).not.toHaveBeenCalled();
    });

    it('invokes callback with disallowed content', () => {
      jest.spyOn(cdoBramble, 'getFileData').mockClear()
        .mockImplementation((path, callback) => callback(null, INVALID_HTML));
      const callbackSpy = jest.fn();

      cdoBramble.detectDisallowedHtml('/index.html', callbackSpy);

      expect(callbackSpy).to.have.been.calledOnceWith(null, {
        newDom: FIXED_INVALID_HTML,
        tags: DISALLOWED_HTML_TAGS,
      });
    });

    it('invokes callback with empty tags if no disallowed content is found', () => {
      jest.spyOn(cdoBramble, 'getFileData').mockClear()
        .mockImplementation((path, callback) => callback(null, VALID_HTML));
      const callbackSpy = jest.fn();

      cdoBramble.detectDisallowedHtml('/index.html', callbackSpy);

      expect(callbackSpy).to.have.been.calledOnceWith(null, {
        newDom: VALID_HTML,
        tags: [],
      });
    });
  });

  describe('preprocessHtml', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('no-ops if detecting disallowed content errored', () => {
      jest.spyOn(cdoBramble, 'detectDisallowedHtml').mockClear()
        .mockImplementation((path, callback) => callback(new Error(), {}));
      jest.spyOn(cdoBramble.api, 'openDisallowedHtmlDialog').mockClear().mockImplementation();
      const callbackSpy = jest.fn();

      cdoBramble.preprocessHtml('/index.html', callbackSpy);

      expect(callbackSpy).toHaveBeenCalledTimes(1);
      expect(cdoBramble.api.openDisallowedHtmlDialog).not.toHaveBeenCalled();
    });

    it('no-ops if no disallowed tags are detected', () => {
      jest.spyOn(cdoBramble, 'detectDisallowedHtml').mockClear()
        .mockImplementation((path, callback) => callback(null, {tags: []}));
      jest.spyOn(cdoBramble.api, 'openDisallowedHtmlDialog').mockClear().mockImplementation();
      const callbackSpy = jest.fn();

      cdoBramble.preprocessHtml('/index.html', callbackSpy);

      expect(callbackSpy).toHaveBeenCalledTimes(1);
      expect(cdoBramble.api.openDisallowedHtmlDialog).not.toHaveBeenCalled();
    });

    it('writes HTML file without disallowed content when dialog is closed', () => {
      const disallowedTags = ['script'];
      const newDom = '<html></html>';
      const fullPath = projectPath + 'index.html';

      cdoBramble.brambleProxy = {
        enableReadOnly: jest.fn(),
        disableReadOnly: jest.fn(),
      };
      jest.spyOn(cdoBramble, 'detectDisallowedHtml').mockClear()
        .mockImplementation((path, callback) =>
          callback(null, {tags: disallowedTags, newDom})
        );
      jest.spyOn(cdoBramble.api, 'openDisallowedHtmlDialog').mockClear()
        .mockImplementation((filename, tags, onClose) => onClose());
      jest.spyOn(cdoBramble, 'writeFileData').mockClear()
        .mockImplementation((path, data, callback) => callback());
      const callbackSpy = jest.fn();

      cdoBramble.preprocessHtml(fullPath, callbackSpy);

      expect(cdoBramble.brambleProxy.enableReadOnly).toHaveBeenCalledTimes(1);
      expect(
        cdoBramble.api.openDisallowedHtmlDialog
      ).to.have.been.calledOnceWith('index.html', disallowedTags);
      expect(cdoBramble.writeFileData).to.have.been.calledOnceWith(
        fullPath,
        newDom
      );
      expect(cdoBramble.brambleProxy.disableReadOnly).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onFileDeleted', () => {
    it('adds a delete operation for the file', () => {
      expect(cdoBramble.recentChanges.length).toBe(0);
      cdoBramble.onFileDeleted(projectPath + 'index.html');
      expect(cdoBramble.recentChanges).toEqual([
        {operation: 'delete', file: 'index.html'},
      ]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = jest.fn();
      const callbackSpy2 = jest.fn();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.onFileDeleted('index.html');
      expect(callbackSpy1).toHaveBeenCalledTimes(1);
      expect(callbackSpy2).toHaveBeenCalledTimes(1);
    });
  });

  describe('onFileRenamed', () => {
    const oldPath = projectPath + 'old.html';
    const newPath = projectPath + 'new.html';

    it('updates fileDataPath for recent change if one exists', () => {
      cdoBramble.recentChanges = [
        {operation: 'change', fileDataPath: 'other.html'},
        {operation: 'change', fileDataPath: oldPath},
        {operation: 'delete', fileDataPath: 'style.css'},
      ];
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(cdoBramble.recentChanges).toEqual([
        {operation: 'change', fileDataPath: 'other.html'},
        {operation: 'change', fileDataPath: newPath},
        {operation: 'delete', fileDataPath: 'style.css'},
        {operation: 'rename', file: 'old.html', newFile: 'new.html'},
      ]);
    });

    it('adds a rename operation for the file', () => {
      expect(cdoBramble.recentChanges.length).toBe(0);
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(cdoBramble.recentChanges).toEqual([
        {operation: 'rename', file: 'old.html', newFile: 'new.html'},
      ]);
    });

    it('invokes onProjectChangedCallbacks', () => {
      const callbackSpy1 = jest.fn();
      const callbackSpy2 = jest.fn();
      cdoBramble.onProjectChangedCallbacks = [callbackSpy1, callbackSpy2];
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(callbackSpy1).toHaveBeenCalledTimes(1);
      expect(callbackSpy2).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadAllFilesToServer', () => {
    let fileData;

    beforeEach(() => {
      fileData = [
        {name: 'index.html', data: '<div></div>'},
        {name: 'style.css', data: '* {margin: 0;}'},
      ];
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, fileData));
      jest.spyOn(cdoBramble.api, 'changeProjectFile').mockClear()
        .mockImplementation((filename, fileData, callback) =>
          callback(null, 'new-version-id')
        );
    });

    it('uploads all files in Bramble file system to server', done => {
      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).toBeNull();
        expect(wasSuccessful).toBe(true);
        expect(cdoBramble.getAllFileData).toHaveBeenCalledTimes(1);
        expect(cdoBramble.api.changeProjectFile).toHaveBeenCalledTimes(2);
        expect(cdoBramble.lastSyncedVersionId).toBe('new-version-id');
        done();
      });
    });

    it('exits early if files cannot be read', done => {
      cdoBramble.getAllFileData.mockRestore();
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(new Error(), null));

      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).not.toBeNull();
        expect(wasSuccessful).toBeUndefined();
        expect(cdoBramble.getAllFileData).toHaveBeenCalledTimes(1);
        expect(cdoBramble.api.changeProjectFile).not.toHaveBeenCalled();
        done();
      });
    });

    it('exits early if file fails to save to server', done => {
      cdoBramble.api.changeProjectFile.mockRestore();
      jest.spyOn(cdoBramble.api, 'changeProjectFile').mockClear()
        .mockImplementation((filename, fileData, callback) =>
          callback(new Error(), null)
        );

      cdoBramble.uploadAllFilesToServer((error, wasSuccessful) => {
        expect(error).not.toBeNull();
        expect(wasSuccessful).toBeUndefined();
        expect(cdoBramble.getAllFileData).toHaveBeenCalledTimes(1);
        expect(cdoBramble.api.changeProjectFile).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('recursivelySaveChangesToServer', () => {
    beforeEach(() => {
      jest.spyOn(cdoBramble.api, 'deleteProjectFile').mockClear()
        .mockImplementation((filename, callback) => callback());
      jest.spyOn(cdoBramble.api, 'renameProjectFile').mockClear()
        .mockImplementation((oldFilename, newFilename, callback) => callback());
      jest.spyOn(cdoBramble, 'getFileData').mockClear()
        .mockImplementation((path, callback) => callback(null, 'my file data'));
      jest.spyOn(cdoBramble.api, 'changeProjectFile').mockClear()
        .mockImplementation((filename, fileData, callback) => callback());
    });

    it('saves each change to the server', done => {
      const changes = [
        {operation: 'delete', file: 'style.css'},
        {operation: 'rename', file: 'old.html', newFile: 'new.html'},
        {operation: 'change', file: 'index.html'},
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.api.deleteProjectFile).to.have.been.calledOnceWith(
          'style.css'
        );
        expect(cdoBramble.api.renameProjectFile).to.have.been.calledOnceWith(
          'old.html',
          'new.html'
        );
        expect(cdoBramble.getFileData).toHaveBeenCalledTimes(1);
        expect(cdoBramble.api.changeProjectFile).to.have.been.calledOnceWith(
          'index.html',
          'my file data'
        );
        expect(console.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('invokes the callback if there are no changes', done => {
      cdoBramble.recursivelySaveChangesToServer([], 0, () => {
        expect(cdoBramble.api.deleteProjectFile).not.toHaveBeenCalled();
        expect(cdoBramble.api.renameProjectFile).not.toHaveBeenCalled();
        expect(cdoBramble.getFileData).not.toHaveBeenCalled();
        expect(cdoBramble.api.changeProjectFile).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelySaveChangesToServer([{}], 1, () => {
        expect(cdoBramble.api.deleteProjectFile).not.toHaveBeenCalled();
        expect(cdoBramble.api.renameProjectFile).not.toHaveBeenCalled();
        expect(cdoBramble.getFileData).not.toHaveBeenCalled();
        expect(cdoBramble.api.changeProjectFile).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('saves the next change if a change fails to save', done => {
      cdoBramble.api.deleteProjectFile.mockRestore();
      jest.spyOn(cdoBramble.api, 'deleteProjectFile').mockClear()
        .mockImplementation((filename, callback) => callback(new Error(), null));

      const changes = [
        {operation: 'delete', file: 'style.css'},
        {operation: 'change', file: 'index.html'},
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.api.deleteProjectFile).toHaveBeenCalledTimes(1);
        expect(cdoBramble.getFileData).toHaveBeenCalledTimes(1);
        expect(cdoBramble.api.changeProjectFile).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('updates lastSyncedVersionId if received from the server', done => {
      cdoBramble.api.renameProjectFile.mockRestore();
      jest.spyOn(cdoBramble.api, 'renameProjectFile').mockClear()
        .mockImplementation((oldFilename, newFilename, callback) =>
          callback(null, 'new-version-id')
        );

      cdoBramble.lastSyncedVersionId = null;
      const changes = [
        {operation: 'rename', file: 'old.css', newFile: 'new.css'},
      ];
      cdoBramble.recursivelySaveChangesToServer(changes, 0, () => {
        expect(cdoBramble.lastSyncedVersionId).toBe('new-version-id');
        expect(cdoBramble.api.deleteProjectFile).not.toHaveBeenCalled();
        expect(cdoBramble.api.renameProjectFile).toHaveBeenCalledTimes(1);
        expect(cdoBramble.getFileData).not.toHaveBeenCalled();
        expect(cdoBramble.api.changeProjectFile).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('recursivelyWriteFiles', () => {
    beforeEach(() => {
      jest.spyOn(cdoBramble, 'downloadFile').mockClear()
        .mockImplementation((url, callback) => callback('my file data', null));
      jest.spyOn(cdoBramble, 'writeFileData').mockClear()
        .mockImplementation((path, data, callback) => callback(null));
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('downloads file data and writes it to bramble', done => {
      const files = [
        {name: 'index.html', url: '/v3/files/a1b2c3/index.html', versionId: 1},
        {name: 'style.css', url: '/v3/files/a1b2c3/style.css'},
      ];
      cdoBramble.recursivelyWriteFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).toHaveBeenCalledTimes(2);
        assert(
          cdoBramble.downloadFile.mock.calls[0]
            .calledWith('/v3/files/a1b2c3/index.html?version=1')
        );
        assert(
          cdoBramble.downloadFile.mock.calls[1]
            .calledWith('/v3/files/a1b2c3/style.css')
        );
        expect(cdoBramble.writeFileData).toHaveBeenCalledTimes(2);
        assert(
          cdoBramble.writeFileData.mock.calls[0]
            .calledWith(projectPath + 'index.html')
        );
        assert(
          cdoBramble.writeFileData.mock.calls[1]
            .calledWith(projectPath + 'style.css')
        );
        expect(console.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('invokes the callback if there are no files', done => {
      cdoBramble.recursivelyWriteFiles([], 0, () => {
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelyWriteFiles([{}], 1, () => {
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        done();
      });
    });

    it('writes the next file if a file fails to download', done => {
      cdoBramble.downloadFile.mockRestore();
      const downloadFileStub = jest.spyOn(cdoBramble, 'downloadFile').mockClear().mockImplementation();
      downloadFileStub
        .onFirstCall()
        .callsFake((url, callback) => callback(null, new Error()));
      downloadFileStub
        .onSecondCall()
        .callsFake((url, callback) => callback('my file data', null));

      const files = [
        {name: 'index.html', url: '/v3/files/abc/index.html'},
        {name: 'other.html', url: '/v3/files/abc/other.html'},
      ];
      cdoBramble.recursivelyWriteFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).toHaveBeenCalledTimes(2);
        expect(cdoBramble.writeFileData).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('recursivelyWriteSourceFiles', () => {
    beforeEach(() => {
      jest.spyOn(cdoBramble, 'downloadFile').mockClear()
        .mockImplementation((url, callback) => callback('my file data', null));
      jest.spyOn(cdoBramble, 'writeFileData').mockClear()
        .mockImplementation((path, data, callback) => callback(null));
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('invokes the callback if there are no source files', done => {
      cdoBramble.recursivelyWriteSourceFiles([], 0, () => {
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        expect(cdoBramble.writeFileData).not.toHaveBeenCalled();
        done();
      });
    });

    it('invokes the callback if currentIndex is invalid', done => {
      cdoBramble.recursivelyWriteSourceFiles([{}], 1, () => {
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        expect(cdoBramble.writeFileData).not.toHaveBeenCalled();
        done();
      });
    });

    it('does not write invalid source files', done => {
      const invalidFiles = [
        {data: '<div></div>'}, // no name
        {name: 'index.html'}, // no URL or data
      ];
      cdoBramble.recursivelyWriteSourceFiles(invalidFiles, 0, () => {
        expect(console.error).toHaveBeenCalledTimes(2);
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        expect(cdoBramble.writeFileData).not.toHaveBeenCalled();
        done();
      });
    });

    it('downloads file before writing if it has a url', done => {
      const file = {name: 'index.html', url: '/v3/files/1234/index.html'};
      cdoBramble.recursivelyWriteSourceFiles([file], 0, () => {
        expect(cdoBramble.downloadFile).toHaveBeenCalledTimes(1);
        expect(cdoBramble.writeFileData).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('writes file if it has data', done => {
      const file = {name: 'index.html', data: '<div></div>'};
      cdoBramble.recursivelyWriteSourceFiles([file], 0, () => {
        expect(cdoBramble.downloadFile).not.toHaveBeenCalled();
        expect(cdoBramble.writeFileData).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('writes next file if a file fails', done => {
      cdoBramble.downloadFile.mockRestore();
      jest.spyOn(cdoBramble, 'downloadFile').mockClear()
        .mockImplementation((url, callback) => callback(null, new Error()));

      const files = [
        {name: 'style.css'}, // invalid file
        {name: 'index.html', url: '/v3/files/1234/index.html'}, // will fail to download
        {name: 'other.html', data: '<div></div>'}, // will succeed
      ];
      cdoBramble.recursivelyWriteSourceFiles(files, 0, () => {
        expect(cdoBramble.downloadFile).toHaveBeenCalledTimes(1);
        expect(cdoBramble.writeFileData).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('validateProjectChanged', () => {
    beforeEach(() => {
      const startSources = {files: [{name: 'index.html', data: '<div></div>'}]};
      jest.spyOn(cdoBramble.api, 'getStartSources').mockClear().mockReturnValue(startSources);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('is true if source files and user files have different lengths', done => {
      const userFiles = [{name: 'index.html'}, {name: 'style.css'}];
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, userFiles));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(true);
        done();
      });
    });

    it('is true if user files are missing a file in source files', done => {
      const userFiles = [{name: 'style.css'}];
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, userFiles));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(true);
        done();
      });
    });

    it('is true if file data is different between source and user files', done => {
      const userFiles = [{name: 'index.html', data: '<p></p>'}];
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, userFiles));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(true);
        done();
      });
    });

    it('is true if only one of multiple source files has changed', done => {
      const startSources = {
        files: [
          {name: 'index.html', data: '<div></div>'},
          {name: 'other.html', data: '<p></p>'},
        ],
      };
      const userFiles = [
        {name: 'index.html', data: '<span></span>'},
        {name: 'other.html', data: '<p></p>'},
      ];
      cdoBramble.api.getStartSources.mockRestore();
      jest.spyOn(cdoBramble.api, 'getStartSources').mockClear().mockReturnValue(startSources);
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, userFiles));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(true);
        done();
      });
    });

    it('is false if no files have changed', done => {
      const files = [
        {name: 'index.html', data: '<div></div>'},
        {name: 'other.html', data: '<p></p>'},
      ];
      cdoBramble.api.getStartSources.mockRestore();
      jest.spyOn(cdoBramble.api, 'getStartSources').mockClear()
        .mockReturnValue({files: [...files]});
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, [...files]));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(false);
        done();
      });
    });

    it('is false if source file has no data', done => {
      const startSources = {
        files: [{name: 'img.png', url: '/v3/files/img.png'}],
      };
      const userFiles = [{name: 'img.png', data: 'stringified-image-data'}];
      cdoBramble.api.getStartSources.mockRestore();
      jest.spyOn(cdoBramble.api, 'getStartSources').mockClear().mockReturnValue(startSources);
      jest.spyOn(cdoBramble, 'getAllFileData').mockClear()
        .mockImplementation(callback => callback(null, userFiles));

      cdoBramble.validateProjectChanged(projectChanged => {
        expect(projectChanged).toBe(false);
        done();
      });
    });
  });
});
