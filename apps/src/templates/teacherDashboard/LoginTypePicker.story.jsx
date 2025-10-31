import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';

import {UnconnectedLoginTypePicker as LoginTypePicker} from './LoginTypePicker';

export default {
  component: LoginTypePicker,
};

const store = getStore();
registerReducers({currentUser});
store.dispatch(
  setInitialData({
    id: 1,
    user_type: 'teacher',
    us_state_code: 'CO',
  })
);

const Template = (withCpaExperience, args) => {
  return (
    <Provider store={store}>
      <LoginTypePicker
        title="New section"
        handleImportOpen={action('handleImportOpen')}
        setLoginType={action('setLoginType')}
        handleCancel={action('handleCancel')}
        {...args}
      />
    </Provider>
  );
};

export const Basic = Template.bind({}, false);

export const BasicWithCPAWarning = Template.bind({}, true);

export const Google = Template.bind({}, false);
Google.args = {
  providers: ['google_classroom'],
};

export const Clever = Template.bind({}, false);
Clever.args = {
  providers: ['clever'],
};

export const Microsoft = Template.bind({}, false);
Microsoft.args = {
  providers: ['microsoft_classroom'],
};

export const Multiple = Template.bind({}, false);
Multiple.args = {
  providers: ['google_classroom', 'clever'],
};
