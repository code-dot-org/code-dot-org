import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import experiments from '@cdo/apps/util/experiments';

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

const setCpaExperienceEnabled = enabled => {
  experiments.isEnabledAllowingQueryString.restore &&
    experiments.isEnabledAllowingQueryString.restore();

  sinon
    .stub(experiments, 'isEnabledAllowingQueryString')
    .withArgs(experiments.CPA_EXPERIENCE)
    .callsFake(() => enabled);
};

const Template = (withCpaExperience, args) => {
  setCpaExperienceEnabled(withCpaExperience);

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
