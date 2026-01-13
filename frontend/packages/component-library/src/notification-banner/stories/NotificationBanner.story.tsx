import {Button} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-webpack5';

import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import NotificationBanner, {
  NotificationBannerProps,
} from '../NotificationBanner';

export default {
  title: 'DesignSystem/NotificationBanner',
  component: NotificationBanner,
  parameters: {
    useMui: true,
    docs: {
      description: {
        component:
          'Notification Banner component for displaying inline notifications with variant colors, optional actions, and accessibility support.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'brand',
        'info',
        'success',
        'warning',
        'error',
        'aqua',
        'gray',
      ],
      description: 'Variant color/sentiment',
    },
    style: {
      control: 'select',
      options: ['subtle', 'filled'],
      description: 'Style option: subtle (white bg) or filled (tinted bg)',
    },
    title: {
      control: 'text',
      description: 'Banner title',
    },
    description: {
      control: 'text',
      description: 'Banner description/body content',
    },
    icon: {
      control: false,
      description: 'FontAwesome icon props',
    },
    actions: {
      control: false,
      description: 'Action buttons',
    },
    onClose: {
      action: 'closed',
      description: 'Close handler',
    },
    role: {
      control: 'select',
      options: ['status', 'alert'],
      description: 'ARIA role',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width container',
    },
  },
} as Meta<NotificationBannerProps>;

const Template: StoryFn<NotificationBannerProps> = args => (
  <NotificationBanner {...args} />
);

export const Default = Template.bind({});
Default.args = {
  variant: 'info',
  style: 'subtle',
  title: 'This is a title',
  description: 'This is additional descriptive text.',
  icon: {iconName: 'circle-info', iconStyle: 'solid'},
};

export const AllVariants = () => {
  const variants: Array<{
    variant: NotificationBannerProps['variant'];
    icon: FontAwesomeV6IconProps;
    title: string;
  }> = [
    {
      variant: 'primary',
      icon: {iconName: 'circle-info', iconStyle: 'solid'},
      title: 'Primary (Purple)',
    },
    {
      variant: 'brand',
      icon: {iconName: 'circle-info', iconStyle: 'solid'},
      title: 'Brand (Teal)',
    },
    {
      variant: 'info',
      icon: {iconName: 'circle-info', iconStyle: 'solid'},
      title: 'Info',
    },
    {
      variant: 'success',
      icon: {iconName: 'circle-check', iconStyle: 'solid'},
      title: 'Success',
    },
    {
      variant: 'warning',
      icon: {iconName: 'triangle-exclamation', iconStyle: 'solid'},
      title: 'Warning',
    },
    {
      variant: 'error',
      icon: {iconName: 'circle-xmark', iconStyle: 'solid'},
      title: 'Error',
    },
    {
      variant: 'aqua',
      icon: {iconName: 'robot', iconStyle: 'solid'},
      title: 'Aqua (AI)',
    },
    {
      variant: 'gray',
      icon: {iconName: 'circle-info', iconStyle: 'solid'},
      title: 'Gray',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        alignItems: 'start',
      }}
    >
      <div>
        <h3 style={{marginBottom: '1rem'}}>Subtle Style</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {variants.map(({variant, icon, title}) => (
            <NotificationBanner
              key={`subtle-${variant}`}
              variant={variant}
              style="subtle"
              title={title}
              description="This is additional descriptive text."
              icon={icon}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 style={{marginBottom: '1rem'}}>Filled Style</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {variants.map(({variant, icon, title}) => (
            <NotificationBanner
              key={`filled-${variant}`}
              variant={variant}
              style="filled"
              title={title}
              description="This is additional descriptive text."
              icon={icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const WithActions = Template.bind({});
WithActions.args = {
  variant: 'info',
  style: 'subtle',
  title: 'More Opportunities for Feedback',
  description:
    'Each lesson now includes a quick 2-question survey to give insights to the curriculum team on how the lesson went in your classroom.',
  icon: {iconName: 'envelope', iconStyle: 'solid'},
  actions: (
    <>
      <Button variant="outlined" color="tertiary" size="small">
        Button
      </Button>
      <Button variant="contained" color="primary" size="small">
        Button
      </Button>
    </>
  ),
};

export const WithClose = Template.bind({});
WithClose.args = {
  variant: 'warning',
  style: 'subtle',
  title: "You're in a newer version of this course",
  description:
    'We noticed you have progress in an older version of this course. You can go back to that version any time by using the dropdown below to select the version of the course you want.',
  icon: {iconName: 'triangle-exclamation', iconStyle: 'solid'},
  onClose: () => console.log('Close clicked'),
};
