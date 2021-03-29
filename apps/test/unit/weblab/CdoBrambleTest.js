import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import CdoBramble from '@cdo/apps/weblab/CdoBramble';

describe('CdoBramble', () => {
  const brambleUrl = 'https://bramble.org/index.html';
  const projectPath = '/project/123/';
  let cdoBramble, storeState;

  beforeEach(() => {
    storeState = {
      maxProjectCapacity: 1000,
      pageConstants: {isReadOnlyWorkspace: false}
    };
    const mockStore = {
      getStore: () => ({
        getState: () => storeState
      })
    };

    cdoBramble = new CdoBramble({}, mockStore, brambleUrl, projectPath, []);
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

  describe('handleFileChange', () => {
    const filename = 'index.html';
    let fileChange;

    beforeEach(() => {
      fileChange = {
        operation: 'change',
        file: filename,
        fileDataPath: filename
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
    const oldPath = 'old.html';
    const newPath = 'new.html';

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
        {operation: 'rename', file: oldPath, newFile: newPath}
      ]);
    });

    it('adds a rename operation for the file', () => {
      expect(cdoBramble.recentChanges.length).to.equal(0);
      cdoBramble.onFileRenamed(oldPath, newPath);
      expect(cdoBramble.recentChanges).to.deep.equal([
        {operation: 'rename', file: oldPath, newFile: newPath}
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
});
