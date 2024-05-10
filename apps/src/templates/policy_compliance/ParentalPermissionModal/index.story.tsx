import React from 'react';
import sinon from 'sinon';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {Meta, StoryFn} from '@storybook/react';
import {Provider} from 'react-redux';
import ParentalPermissionModal from '.';

const store = getStore();
registerReducers({currentUser});
store.dispatch(
  setInitialData({
    id: 1,
    childAccountComplianceState: 's',
  })
);

export default {
  component: ParentalPermissionModal,
  decorators: [
    (Story: StoryFn) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
} as Meta;

const spy = sinon.spy();
const Template = (state: object = {}) => {
  // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
  React.useReducer.restore && React.useReducer.restore();

  sinon.stub(React, 'useReducer').returns([state, spy]);

  return <ParentalPermissionModal lockoutDate={new Date().toISOString()} />;
};

export const NewRequestForm = () => {
  const state = {
    parentalPermissionRequest: null,
  };

  return Template(state);
};

export const UpdateRequestForm = () => {
  const state = {
    parentalPermissionRequest: {
      parent_email: 'parent@email.com',
      requested_at: new Date().toISOString(),
    },
  };

  return Template(state);
};
