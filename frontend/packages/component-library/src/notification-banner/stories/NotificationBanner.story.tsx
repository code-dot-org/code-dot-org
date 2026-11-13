import {Button} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import NotificationBanner, {
  NotificationBannerProps,
} from '../NotificationBanner';
import {NotificationBannerFillStyle} from '../types';

type StoryArgs = NotificationBannerProps & {
  showActions?: boolean;
};

const actionsFor = (fillStyle: NotificationBannerFillStyle) =>
  fillStyle === 'color' ? (
    <>
      <Button variant="outlined" color="primary" size="small">
        Button
      </Button>
      <Button variant="contained" color="secondary" size="small">
        Button
      </Button>
    </>
  ) : (
    <>
      <Button variant="outlined" color="secondary" size="small">
        Button
      </Button>
      <Button variant="contained" color="primary" size="small">
        Button
      </Button>
    </>
  );

export default {
  title: 'DesignSystem/NotificationBanner',
  component: NotificationBanner,
  parameters: {
    docs: {
      description: {
        component:
          'Inline banner for persistent page-level messaging. Sentiment and fill follow the CADS Notification Banner component set.',
      },
    },
  },
  argTypes: {
    sentiment: {
      control: 'select',
      options: [
        'brand',
        'pink',
        'neutral',
        'success',
        'error',
        'warning',
        'info',
      ],
    },
    fillStyle: {
      control: 'select',
      options: ['none', 'color'],
    },
    title: {control: 'text'},
    description: {control: 'text'},
    icon: {control: false},
    actions: {control: false},
    showActions: {control: 'boolean'},
    role: {
      control: 'select',
      options: ['status', 'alert'],
    },
    fullWidth: {control: 'boolean'},
  },
} as Meta<StoryArgs>;

const Template: StoryFn<StoryArgs> = ({
  showActions = true,
  fillStyle = 'none',
  ...args
}) => (
  <div style={{width: 800}}>
    <NotificationBanner
      {...args}
      fillStyle={fillStyle}
      actions={showActions ? actionsFor(fillStyle) : undefined}
    />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  sentiment: 'brand',
  fillStyle: 'none',
  showActions: true,
  title: 'This is a title',
  description: 'This is additional descriptive text.',
  icon: {iconName: 'smile', iconStyle: 'solid'},
};

export const NoActions = Template.bind({});
NoActions.args = {
  ...Default.args,
  showActions: false,
};

export const Dismissible = Template.bind({});
Dismissible.args = {
  ...Default.args,
  onClose: () => undefined,
};

export const AllSentiments = () => {
  const sentiments: Array<{
    sentiment: NotificationBannerProps['sentiment'];
    icon: FontAwesomeV6IconProps;
  }> = [
    {sentiment: 'brand', icon: {iconName: 'smile', iconStyle: 'solid'}},
    {sentiment: 'pink', icon: {iconName: 'heart', iconStyle: 'solid'}},
    {
      sentiment: 'success',
      icon: {iconName: 'circle-check', iconStyle: 'solid'},
    },
    {sentiment: 'error', icon: {iconName: 'circle-xmark', iconStyle: 'solid'}},
    {
      sentiment: 'warning',
      icon: {iconName: 'triangle-exclamation', iconStyle: 'solid'},
    },
    {sentiment: 'info', icon: {iconName: 'circle-info', iconStyle: 'solid'}},
    {sentiment: 'neutral', icon: {iconName: 'smile', iconStyle: 'solid'}},
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
      {(['none', 'color'] as const).map(fillStyle => (
        <div key={fillStyle}>
          <h3 style={{marginBottom: '1rem'}}>
            {fillStyle === 'none' ? 'No fill' : 'Color fill'}
          </h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {sentiments.map(({sentiment, icon}) => (
              <NotificationBanner
                key={`${fillStyle}-${sentiment}`}
                sentiment={sentiment}
                fillStyle={fillStyle}
                title="This is a title"
                description="This is additional descriptive text."
                icon={icon}
                actions={actionsFor(fillStyle)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
