import {expect} from '../../util/reconfiguredChai';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';
import javalab, {
  initialState,
  sourceTextUpdated
} from '@cdo/apps/javalab/javalabRedux';

describe('javalabRedux', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
  });
  afterEach(() => restoreRedux());

  it('sourceTextUpdated updates source text and retains other properties', () => {
    const fileName = Object.keys(initialState.sources)[0];
    const fileInitialSource = initialState.sources[fileName];
    const newText = 'some new text';

    expect(getStore().getState().javalab.sources[fileName]).is.equal(
      fileInitialSource
    );
    store.dispatch(sourceTextUpdated(fileName, newText));

    const updatedSources = getStore().getState().javalab.sources;
    expect(updatedSources[fileName].text).is.equal(newText);
    expect(updatedSources[fileName].isVisible).is.equal(
      fileInitialSource.isVisible
    );
    expect(updatedSources[fileName].isValidation).is.equal(
      fileInitialSource.isValidation
    );
  });
});
