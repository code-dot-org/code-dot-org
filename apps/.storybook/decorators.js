import {merge} from 'lodash';
import {Provider} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import reduxThunk from 'redux-thunk';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import * as globalEdition from '@cdo/apps/util/globalEdition';

export const reduxStore = (reducers = {}, state = {}) => {
  return createStore(
    combineReducers({isRtl, responsive, ...reducers}),
    state,
    applyMiddleware(reduxThunk)
  );
};

export const reduxStoreDecorator = function (Story, context) {
  const state = merge({}, this.initialState, context.parameters.store);
  return Provider({
    children: Story(),
    store: reduxStore(this.reducers, state),
  });
};

export const withGlobalEdition = (storyFn, context) => {
  let globalRegionsStub = null;

  const {region} = context.args;

  beforeEach(() => {
    globalRegionsStub = jest.spyOn(globalEdition, 'getGlobalEditionRegion');
    globalRegionsStub.mockImplementation(() => region || 'root');
  });

  afterEach(() => {
    globalRegionsStub?.mockClear();
    globalRegionsStub = null;
  });

  return storyFn();
};
