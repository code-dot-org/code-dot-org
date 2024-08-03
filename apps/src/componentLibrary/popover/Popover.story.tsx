import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Popover, {PopoverProps} from './index';

export default {
  title: 'DesignSystem/Popover', // eslint-disable-line storybook/no-title-property-in-meta
  component: Popover,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<PopoverProps> = args => {
  return <Popover {...args} />;
};

// const MultipleTemplate: StoryFn<{
//   components: PopoverProps[];
// }> = args => {
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexFlow: 'wrap',
//         alignItems: 'flex-start',
//         gap: '20px',
//         marginTop: 300,
//       }}
//     >
//       {args.components?.map(componentArg => (
//         <Popover key={componentArg.title} {...componentArg} />
//       ))}
//     </div>
//   );
// };

export const DefaultPopover = SingleTemplate.bind({});
DefaultPopover.args = {
  title: 'Title',
  // direction: 'onTop' | 'onRight' | 'onBottom' | 'onLeft' | 'none';
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  onClose: () => console.log('onClose'),
  buttons: (
    <>
      <Button
        type="secondary"
        color="black"
        text="Cancel"
        onClick={() => console.log('Canceled Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const WithImagePopover = SingleTemplate.bind({});
WithImagePopover.args = {
  title: 'Title',
  // direction: 'onTop' | 'onRight' | 'onBottom' | 'onLeft' | 'none';
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
        onClick={() => console.log('Canceled Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};

export const WithIconPopover = SingleTemplate.bind({});
WithIconPopover.args = {
  title: 'Title',
  // direction: 'onTop' | 'onRight' | 'onBottom' | 'onLeft' | 'none';
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
        onClick={() => console.log('Canceled Clicked')}
      />
      <Button text="Ok" onClick={() => console.log('Ok Clicked')} />
    </>
  ),
};
//
// export const DefaultPopoverWithDisabledTab = SingleTemplate.bind({});
// DefaultPopoverWithDisabledTab.args = {
//   name: 'default_tabs_with_disabled_tab',
//   tabs: [
//     {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
//     {
//       value: 'tab2',
//       text: 'Tab 2',
//       tabContent: <div>Tab 2 Content</div>,
//       disabled: true,
//     },
//     {
//       value: 'tab3',
//       text: 'Tab 3',
//       tabContent: <div>Tab 3 Content</div>,
//     },
//   ],
//   defaultSelectedTabValue: 'tab1',
//   onChange: () => null,
// };
//
// export const GroupOfTypesOfPopover = MultipleTemplate.bind({});
// GroupOfTypesOfPopover.args = {
//   components: [
//     {
//       name: 'primary_tabs',
//       tabs: [
//         {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'primary',
//     },
//     {
//       name: 'secondary_tabs',
//       tabs: [
//         {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'secondary',
//     },
//   ],
// };
//
// export const GroupOfPopoverWithIcons = MultipleTemplate.bind({});
// GroupOfPopoverWithIcons.args = {
//   components: [
//     {
//       name: 'primary_tabs_with_icons',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1',
//           iconRight: {iconName: 'check', iconStyle: 'solid'},
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           iconLeft: {iconName: 'check', iconStyle: 'solid'},
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           iconLeft: {iconName: 'smile', iconStyle: 'solid'},
//           iconRight: {iconName: 'smile', iconStyle: 'solid'},
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'primary',
//     },
//     {
//       name: 'primary_tabs_icon_only',
//       tabs: [
//         {
//           value: 'tab1',
//           icon: {iconName: 'check', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           icon: {iconName: 'check', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           icon: {iconName: 'smile', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'primary',
//     },
//     {
//       name: 'secondary_tabs_with_icons',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1',
//           iconRight: {iconName: 'check', iconStyle: 'solid'},
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           iconLeft: {iconName: 'check', iconStyle: 'solid'},
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           iconLeft: {iconName: 'smile', iconStyle: 'solid'},
//           iconRight: {iconName: 'smile', iconStyle: 'solid'},
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'secondary',
//     },
//     {
//       name: 'secondary_tabs_icon_only',
//       tabs: [
//         {
//           value: 'tab1',
//           icon: {iconName: 'check', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           icon: {iconName: 'check', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           icon: {iconName: 'smile', iconStyle: 'solid'},
//           isIconOnly: true,
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       type: 'secondary',
//     },
//   ],
// };
//
// export const GroupOfSizesOfPopover = MultipleTemplate.bind({});
// GroupOfSizesOfPopover.args = {
//   components: [
//     {
//       name: 'tabs_xs_primary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 XS Primary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       size: 'xs',
//     },
//     {
//       name: 'tabs_s_primary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 S Primary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       size: 's',
//     },
//     {
//       name: 'tabs_m_primary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 M Primary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       size: 'm',
//     },
//     {
//       name: 'tabs_l_primary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 L Primary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       onChange: () => null,
//       size: 'l',
//     },
//     {
//       name: 'tabs_xs_secondary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 XS Secondary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       type: 'secondary',
//       onChange: () => null,
//       size: 'xs',
//     },
//     {
//       name: 'tabs_s_secondary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 S Secondary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab1',
//       type: 'secondary',
//       onChange: () => null,
//       size: 's',
//     },
//     {
//       name: 'tabs_m_secondary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 M Secondary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab2',
//       type: 'secondary',
//       onChange: () => null,
//       size: 'm',
//     },
//     {
//       name: 'tabs_l_secondary',
//       tabs: [
//         {
//           value: 'tab1',
//           text: 'Tab 1 L Secondary',
//           tabContent: <div>Tab 1 Content</div>,
//         },
//         {
//           value: 'tab2',
//           text: 'Tab 2',
//           tabContent: <div>Tab 2 Content</div>,
//         },
//         {
//           value: 'tab3',
//           text: 'Tab 3',
//           tabContent: <div>Tab 3 Content</div>,
//         },
//       ],
//       defaultSelectedTabValue: 'tab3',
//       type: 'secondary',
//       onChange: () => null,
//       size: 'l',
//     },
//   ],
// };
