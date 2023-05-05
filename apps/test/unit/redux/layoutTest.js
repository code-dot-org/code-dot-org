import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import layout, {
  getVisualizationScale,
  setVisualizationScale,
} from '@cdo/apps/redux/layout';
import {expect} from '../../util/reconfiguredChai';

describe('layout redux module', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({layout});
  });

  afterEach(() => {
    restoreRedux();
  });

  it('has expected default state', () => {
    expect(getStore().getState().layout).to.deep.equal({
      visualizationScale: null,
    });
  });

  describe('action: setVisualizationScale', () => {
    const store = getStore();

    it('changes the visualization scale', () => {
      const newState = store.dispatch(setVisualizationScale(0.5));
      expect(newState).to.deep.equal({
        payload: 0.5,
        type: 'layout/setVisualizationScale',
      });
      expect(getVisualizationScale(store.getState())).to.equal(0.5);
    });
  });
});
