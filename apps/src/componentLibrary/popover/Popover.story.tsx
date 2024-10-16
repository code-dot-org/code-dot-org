import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Popover, {PopoverProps, WithPopover} from './index';

export default {
  title: 'DesignSystem/Popover', // eslint-disable-line storybook/no-title-property-in-meta
  component: Popover,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<PopoverProps> = args => {
  return <Popover {...args} />;
};

const MultipleTemplate: StoryFn<{
  components: PopoverProps[];
}> = args => {
  const [showPopoverMap, setShowPopoverMap] = useState<{
    [key: string]: boolean;
  }>({});
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'wrap',
        alignItems: 'flex-start',
        gap: '20px',
        marginTop: 300,
      }}
    >
      {args.components?.map(componentArg => {
        return (
          <WithPopover
            key={componentArg.title}
            showPopover={showPopoverMap[componentArg.title]}
            popoverProps={{
              ...componentArg,
              onClose: () =>
                setShowPopoverMap({
                  ...showPopoverMap,
                  [componentArg.title]: !showPopoverMap[componentArg.title],
                }),
            }}
          >
            <Button
              text={componentArg.title}
              onClick={() =>
                setShowPopoverMap({
                  ...showPopoverMap,
                  [componentArg.title]: !showPopoverMap[componentArg.title],
                })
              }
            />
          </WithPopover>
        );
      })}
    </div>
  );
};

export const DefaultPopover = SingleTemplate.bind({});
DefaultPopover.args = {
  title: 'Title',
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  onClose: () => console.log('onClose'),
  buttons: (
    <>
      <Button
        type="secondary"
        color="black"
        text="Cancel"
        onClick={() => console.log('Cancel Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const WithImagePopover = SingleTemplate.bind({});
WithImagePopover.args = {
  title: 'Title',
  image: {
    src: 'https://variety.com/wp-content/uploads/2023/05/spider-2.jpg?w=1000',
    alt: 'Spider-Man Miles Morales Image',
  },
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  onClose: () => console.log('onClose'),
  buttons: (
    <>
      <Button
        type="secondary"
        color="black"
        text="Cancel"
        onClick={() => console.log('Cancel Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const WithIconPopover = SingleTemplate.bind({});
WithIconPopover.args = {
  title: 'Title',
  icon: {iconName: 'smile'},
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  onClose: () => console.log('onClose'),
  buttons: (
    <>
      <Button
        type="secondary"
        color="black"
        text="Cancel"
        onClick={() => console.log('Cancel Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const NoneDirectionPopover = SingleTemplate.bind({});
NoneDirectionPopover.args = {
  title: 'Title (Right Bottom Corner aligned)',
  direction: 'none',
  style: {right: 0, bottom: 0},
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  onClose: () => console.log('onClose'),
  buttons: (
    <>
      <Button
        type="secondary"
        color="black"
        text="Cancel"
        onClick={() => console.log('Cancel Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const GroupOfPositionedPopovers = MultipleTemplate.bind({});
GroupOfPositionedPopovers.args = {
  components: [
    {
      title: 'Right Popover',
      direction: 'onRight',
      content: 'This is a popover positioned on the right.',
      onClose: () => console.log('Right Popover Closed'),
    },
    {
      title: 'Top Popover',
      direction: 'onTop',
      content: 'This is a popover positioned on top.',
      onClose: () => console.log('Top Popover Closed'),
    },
    {
      title: 'Bottom Popover',
      direction: 'onBottom',
      content: 'This is a popover positioned at the bottom.',
      onClose: () => console.log('Bottom Popover Closed'),
    },
    {
      title: 'Left Popover',
      direction: 'onLeft',
      content: 'This is a popover positioned on the left.',
      onClose: () => console.log('Left Popover Closed'),
    },
  ],
};
