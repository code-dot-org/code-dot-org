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
    text: 'Click here',
  },
  onClose: () => console.log('close'),
};

export const AlertWithIcon = SingleTemplate.bind({});
AlertWithIcon.args = {
  text: 'This is an alert with an icon',
  type: 'success',
  size: 'm',
  icon: {iconName: 'house'},
};

export const AlertWithLinkAndIcon = SingleTemplate.bind({});
AlertWithLinkAndIcon.args = {
  text: 'This is an alert with a link and an icon',
  type: 'warning',
  size: 'm',
  link: {
    href: '#',
    text: 'Learn more',
  },
};

export const AlertAlertVsStatusRole = MultipleTemplate.bind({});
AlertAlertVsStatusRole.args = {
  components: [
    {
      text: "Alert 'Alert' role",
    },
    {
      text: "Alert 'Status' role",
      isImmediateImportance: false,
    },
  ],
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
      icon: {iconName: 'circle-check'},
      link: {
        href: '#',
        text: 'This is a link',
      },
      onClose: () => console.log('close'),
    },
    {
      text: 'Alert S',
      type: 'primary',
      size: 's',
      icon: {iconName: 'circle-check'},
      link: {
        href: '#',
        children: 'This is a link',
      },
      onClose: () => console.log('close'),
    },
    {
      text: 'Alert M',
      type: 'primary',
      size: 'm',
      icon: {iconName: 'circle-check'},
      link: {
        href: '#',
        children: 'This is a link',
      },
      onClose: () => console.log('close'),
    },
    {
      text: 'Alert L',
      type: 'primary',
      size: 'l',
      icon: {iconName: 'circle-check'},
      link: {
        href: '#',
        children: 'This is a link',
      },
      onClose: () => console.log('close'),
    },
  ],
};
