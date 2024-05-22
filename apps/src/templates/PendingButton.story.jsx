import classNames from 'classnames';
import React from 'react';

import PendingButton from './PendingButton';

import dataStyles from '../storage/dataBrowser/data-styles.module.scss';

export default {
  component: PendingButton,
};

const Template = args => (
  <PendingButton
    onClick={() => console.log('click')}
    pendingText="Adding"
    className={classNames(dataStyles.button, dataStyles.buttonBlue)}
    text="Add pair"
    isPending={false}
    {...args}
  />
);
export const PendingButtonNotPending = Template.bind({});

export const PendingButtonPending = Template.bind({});
PendingButtonPending.args = {
  isPending: true,
};
