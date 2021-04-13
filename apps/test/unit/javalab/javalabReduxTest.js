import {expect} from '../../util/reconfiguredChai';
import javalab, {
  setFileName,
  setEditorText,
  getProjectFileInfo
} from '@cdo/apps/javalab/javalabRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';

describe('javalabRedux', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
  });

  afterEach(() => {
    restoreRedux();
  });

  describe('getProjectFileInfo', () => {
    it('creates start_sources json', () => {
      getStore().dispatch(setFileName('File.java'));
      getStore().dispatch(setEditorText('code'));
      expect(getProjectFileInfo(getStore().getState())).to.deep.equal({
        'File.java': {
          text: 'code',
          visible: true
        }
      });
    });
  });
});
