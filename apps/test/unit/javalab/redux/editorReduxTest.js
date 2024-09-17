import javalabEditor, {
  initialState,
  sourceTextUpdated,
} from '@cdo/apps/javalab/redux/editorRedux';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';

describe('javalabRedux', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({javalabEditor});
    store = getStore();
  });
  afterEach(() => restoreRedux());

  it('sourceTextUpdated updates source text and retains other properties', () => {
    const fileName = Object.keys(initialState.sources)[0];
    const fileInitialSource = initialState.sources[fileName];
    const newText = 'some new text';

    expect(getStore().getState().javalabEditor.sources[fileName]).toBe(
      fileInitialSource
    );
    store.dispatch(sourceTextUpdated(fileName, newText));

    const updatedSources = getStore().getState().javalabEditor.sources;
    expect(updatedSources[fileName].text).toBe(newText);
    expect(updatedSources[fileName].isVisible).toBe(
      fileInitialSource.isVisible
    );
    expect(updatedSources[fileName].isValidation).toBe(
      fileInitialSource.isValidation
    );
  });
});
