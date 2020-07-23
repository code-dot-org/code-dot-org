import reducer, * as layout from '@cdo/apps/redux/layout';
import {expect} from '../../util/deprecatedChai';

describe('layout redux module', () => {
  it('has expected default state', () => {
    expect(reducer(undefined, {})).to.deep.equal({
      visualizationScale: null
    });
  });

  it('returns original state on unhandled action', () => {
    const state = {};
    expect(reducer(state, {})).to.equal(state);
  });

  describe('action: setVisualizationScale', () => {
    const state = {visualizationScale: 1};
    it('changes the visualization scale', () => {
      const newState = reducer(state, layout.setVisualizationScale(0.5));
      expect(newState).to.deep.equal({
        visualizationScale: 0.5
      });
      expect(layout.getVisualizationScale({layout: newState})).to.equal(0.5);
    });

    it('produces a new object', () => {
      const newState = reducer(state, layout.setVisualizationScale(0.5));
      expect(newState).not.to.equal(state);
    });
  });
});
