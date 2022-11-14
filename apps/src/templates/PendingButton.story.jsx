import React from 'react';
import PendingButton from './PendingButton';
import dataStyles from '../storage/dataBrowser/data-styles.module.scss';
import classNames from 'classnames';
import {reduxStore} from '../../.storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'PendingButton',
  component: PendingButton
};

const Template = args => (
  <Provider store={reduxStore()}>
    <PendingButton
      onClick={() => console.log('click')}
      pendingText="Adding"
      className={classNames(dataStyles.button, dataStyles.buttonBlue)}
      text="Add pair"
      {...args}
    />
  </Provider>
);
export const PendingButtonNotPending = Template.bind({});
PendingButton.args = {
  isPending: false
};

export const PendingButtonPending = Template.bind({});
PendingButtonPending.args = {
  isPending: true
};
