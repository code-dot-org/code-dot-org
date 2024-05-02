import React from 'react';
import sinon from 'sinon';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {Meta, StoryFn} from '@storybook/react';
import {Provider} from 'react-redux';
import ParentalPermissionBanner from '.';

const store = getStore();
registerReducers({currentUser});
store.dispatch(
  setInitialData({
    id: 1,
    childAccountComplianceState: 's',
  })
);

export default {
  component: ParentalPermissionBanner,
  decorators: [
    (Story: StoryFn) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
} as Meta;

const spy = sinon.spy();
const useReducerStub = sinon.stub(React, 'useReducer');
export const Default = () => {
  const state = {
    parentalPermissionRequest: null,
  };

  useReducerStub.returns([state, spy]);

  return <ParentalPermissionBanner lockoutDate={Date()} />;
};
