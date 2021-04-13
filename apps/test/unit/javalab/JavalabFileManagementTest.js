import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import javalab, {
  setFileName,
  setEditorText
} from '@cdo/apps/javalab/javalabRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {populateFiles} from '@cdo/apps/javalab/JavalabFileManagement';

describe('JavalabFileManagement', () => {
  let appOptions;
  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
    sinon.stub(getStore(), 'dispatch');
  });

  afterEach(() => {
    restoreRedux();
    window.appOptions = appOptions;
  });

  describe('populateFiles', () => {
    it('populates start_sources if there are any and there are no file entries', () => {
      window.appOptions.level = {
        startSources: {
          'File.java': {
            text: 'Some code',
            visible: true
          }
        }
      };
      const successStub = sinon.stub();
      populateFiles([], successStub, () => {});
      expect(successStub).to.have.been.calledOnce;
      expect(getStore().dispatch).to.have.been.calledWith(
        setFileName('File.java')
      );
      expect(getStore().dispatch).to.have.been.calledWith(
        setEditorText('Some code')
      );
    });

    it('succeeds if there are no file entries and no start sources', () => {
      window.appOptions.level = {};
      const successStub = sinon.stub();
      populateFiles([], successStub, () => {});
      expect(successStub).to.have.been.calledOnce;
    });
  });
});
