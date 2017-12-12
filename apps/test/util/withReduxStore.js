import React from 'react';
import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {Provider} from 'react-redux';

export default {
  /**
   * Wraps all stories in the current storybook in a react-redux Provider, with
   * a store configured that includes any given reducers and initial state
   * passed to this function.
   * @param {object} [reducers]
   * @param {*} preloadedState
   */
  withReduxStore(reducers = {}, preloadedState) {
    this.addDecorator(story => {
      this.store = createStore(combineReducers({
        isRtl,
        responsive,
        ...reducers,
      }), preloadedState);
      return (
        <Provider store={this.store}>
          {story()}
        </Provider>
      );
    });
    return this;
  }
};
