import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Alert, {AlertProps} from './index';

export default {
  title: 'DesignSystem/Alert', // eslint-disable-line storybook/no-title-property-in-meta
  component: Alert,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<AlertProps> = args => <Alert {...args} />;

const MultipleTemplate: StoryFn<{
  components: AlertProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple Alerts:</p>
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <Alert key={index} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultAlert = SingleTemplate.bind({});
DefaultAlert.args = {
  text: 'This is a default alert',
  type: 'primary',
  size: 'm',
};

export const AlertWithLink = SingleTemplate.bind({});
AlertWithLink.args = {
  text: 'This is an alert with a link',
  type: 'info',
  size: 'm',
  link: {
    href: '#',
    children: 'Click here',
    // text: 'Click here',
  },
};

export const AlertWithIcon = SingleTemplate.bind({});
AlertWithIcon.args = {
  text: 'This is an alert with an icon',
  type: 'success',
  size: 'm',
  icon: {
    iconName: 'check-circle',
  },
};

export const AlertWithLinkAndIcon = SingleTemplate.bind({});
AlertWithLinkAndIcon.args = {
  text: 'This is an alert with a link and an icon',
  type: 'warning',
  size: 'm',
  icon: {
    iconName: 'exclamation-circle',
  },
  link: {
    href: '#',
    children: 'Learn more',
  },
};

export const GroupOfTypesOfAlerts = MultipleTemplate.bind({});
GroupOfTypesOfAlerts.args = {
  components: [
    {
      text: 'Primary Alert',
      type: 'primary',
      size: 'm',
    },
    {
      text: 'Success Alert',
      type: 'success',
      size: 'm',
    },
    {
      text: 'Danger Alert',
      type: 'danger',
      size: 'm',
    },
    {
      text: 'Warning Alert',
      type: 'warning',
      size: 'm',
    },
    {
      text: 'Info Alert',
      type: 'info',
      size: 'm',
    },
    {
      text: 'Gray Alert',
      type: 'gray',
      size: 'm',
    },
  ],
};

export const GroupOfSizesOfAlerts = MultipleTemplate.bind({});
GroupOfSizesOfAlerts.args = {
  components: [
    {
      text: 'Alert XS',
      type: 'primary',
      size: 'xs',
    },
    {
      text: 'Alert S',
      type: 'primary',
      size: 's',
    },
    {
      text: 'Alert M',
      type: 'primary',
      size: 'm',
    },
    {
      text: 'Alert L',
      type: 'primary',
      size: 'l',
    },
  ],
};
