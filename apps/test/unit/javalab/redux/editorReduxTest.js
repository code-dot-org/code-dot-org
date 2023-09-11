import {expect} from '../../../util/reconfiguredChai';
import {
  __testing_stubRedux,
  __testing_restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import javalabEditor, {
  initialState,
  sourceTextUpdated,
} from '@cdo/apps/javalab/redux/editorRedux';

describe('javalabRedux', () => {
  let store;
  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({javalabEditor});
    store = getStore();
  });
  afterEach(() => __testing_restoreRedux());

  it('sourceTextUpdated updates source text and retains other properties', () => {
    const fileName = Object.keys(initialState.sources)[0];
    const fileInitialSource = initialState.sources[fileName];
    const newText = 'some new text';

    expect(getStore().getState().javalabEditor.sources[fileName]).is.equal(
      fileInitialSource
    );
    store.dispatch(sourceTextUpdated(fileName, newText));

    const updatedSources = getStore().getState().javalabEditor.sources;
    expect(updatedSources[fileName].text).is.equal(newText);
    expect(updatedSources[fileName].isVisible).is.equal(
      fileInitialSource.isVisible
    );
    expect(updatedSources[fileName].isValidation).is.equal(
      fileInitialSource.isValidation
    );
  });
});
