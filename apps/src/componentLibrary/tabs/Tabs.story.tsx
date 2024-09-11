import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Tabs, {TabsProps} from './index';

export default {
  title: 'DesignSystem/Tabs', // eslint-disable-line storybook/no-title-property-in-meta
  component: Tabs,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<TabsProps> = args => {
  return <Tabs {...args} />;
};

const MultipleTemplate: StoryFn<{
  components: TabsProps[];
}> = args => {
  return (
    <>
      {args.components?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </>
  );
};

export const DefaultTabs = SingleTemplate.bind({});
DefaultTabs.args = {
  name: 'default_tabs',
  tabs: [
    {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
    {
      value: 'tab2',
      text: 'Tab 2',
      tabContent: <div>Tab 2 Content</div>,
    },
    {
      value: 'tab3',
      text: 'Tab 3',
      tabContent: <div>Tab 3 Content</div>,
    },
  ],
  defaultSelectedTabValue: 'tab1',
  onChange: () => null,
};

export const DefaultTabsWithDisabledTab = SingleTemplate.bind({});
DefaultTabsWithDisabledTab.args = {
  name: 'default_tabs_with_disabled_tab',
  tabs: [
    {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
    {
      value: 'tab2',
      text: 'Tab 2',
      tabContent: <div>Tab 2 Content</div>,
      disabled: true,
    },
    {
      value: 'tab3',
      text: 'Tab 3',
      tabContent: <div>Tab 3 Content</div>,
    },
  ],
  defaultSelectedTabValue: 'tab1',
  onChange: () => null,
};

export const TabsWithTooltips = SingleTemplate.bind({});
TabsWithTooltips.args = {
  name: 'tabs_with_tooltips',
  tabs: [
    {
      value: 'tab1',
      text: 'Tab 1',
      tabContent: <div>Tab 1 Content</div>,
      tooltip: {
        text: 'Tooltip for Tab 1',
        tooltipId: 'tooltip1',
        direction: 'onBottom',
      },
    },
    {
      value: 'tab2',
      text: 'Tab 2',
      tabContent: <div>Tab 2 Content</div>,
      tooltip: {
        text: 'Tooltip for Tab 2',
        tooltipId: 'tooltip2',
        direction: 'onBottom',
      },
    },
    {
      value: 'tab3',
      text: 'Tab 3',
      tabContent: <div>Tab 3 Content</div>,
      tooltip: {
        text: 'Tooltip for Tab 3',
        tooltipId: 'tooltip3',
        direction: 'onBottom',
      },
    },
  ],
  defaultSelectedTabValue: 'tab1',
  onChange: () => null,
};

export const GroupOfTypesOfTabs = MultipleTemplate.bind({});
GroupOfTypesOfTabs.args = {
  components: [
    {
      name: 'primary_tabs',
      tabs: [
        {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'primary',
    },
    {
      name: 'secondary_tabs',
      tabs: [
        {value: 'tab1', text: 'Tab 1', tabContent: <div>Tab 1 Content</div>},
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
  ],
};

export const GroupOfModesOfTabs = MultipleTemplate.bind({});
GroupOfModesOfTabs.args = {
  components: [
    {
      name: 'primary_light_tabs',
      mode: 'light',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          tabContent: <div>Tab 1 Content(Primary Light)</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'primary',
    },
    {
      name: 'primary_dark_tabs',
      mode: 'dark',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          tabContent: <div>Tab 1 Content(Primary Dark)</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'primary',
    },

    {
      name: 'secondary_light_tabs',
      mode: 'light',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          tabContent: <div>Tab 1 Content (Secondary Light)</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
    {
      name: 'secondary_dark_tabs',
      mode: 'dark',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          tabContent: <div>Tab 1 Content (Secondary Dark)</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
  ],
};

export const GroupOfTabsWithIcons = MultipleTemplate.bind({});
GroupOfTabsWithIcons.args = {
  components: [
    {
      name: 'primary_tabs_with_icons',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          iconRight: {iconName: 'check', iconStyle: 'solid'},
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          iconLeft: {iconName: 'check', iconStyle: 'solid'},
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          iconLeft: {iconName: 'smile', iconStyle: 'solid'},
          iconRight: {iconName: 'smile', iconStyle: 'solid'},
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'primary',
    },
    {
      name: 'primary_tabs_icon_only',
      tabs: [
        {
          value: 'tab1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          icon: {iconName: 'check', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          icon: {iconName: 'smile', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'primary',
    },
    {
      name: 'secondary_tabs_with_icons',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1',
          iconRight: {iconName: 'check', iconStyle: 'solid'},
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          iconLeft: {iconName: 'check', iconStyle: 'solid'},
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          iconLeft: {iconName: 'smile', iconStyle: 'solid'},
          iconRight: {iconName: 'smile', iconStyle: 'solid'},
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
    {
      name: 'secondary_tabs_icon_only',
      tabs: [
        {
          value: 'tab1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          icon: {iconName: 'check', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          icon: {iconName: 'smile', iconStyle: 'solid'},
          isIconOnly: true,
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
  ],
};

export const GroupOfSizesOfTabs = MultipleTemplate.bind({});
GroupOfSizesOfTabs.args = {
  components: [
    {
      name: 'tabs_xs_primary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 XS Primary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      size: 'xs',
    },
    {
      name: 'tabs_s_primary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 S Primary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      size: 's',
    },
    {
      name: 'tabs_m_primary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 M Primary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      size: 'm',
    },
    {
      name: 'tabs_l_primary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 L Primary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      onChange: () => null,
      size: 'l',
    },
    {
      name: 'tabs_xs_secondary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 XS Secondary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      type: 'secondary',
      onChange: () => null,
      size: 'xs',
    },
    {
      name: 'tabs_s_secondary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 S Secondary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab1',
      type: 'secondary',
      onChange: () => null,
      size: 's',
    },
    {
      name: 'tabs_m_secondary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 M Secondary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab2',
      type: 'secondary',
      onChange: () => null,
      size: 'm',
    },
    {
      name: 'tabs_l_secondary',
      tabs: [
        {
          value: 'tab1',
          text: 'Tab 1 L Secondary',
          tabContent: <div>Tab 1 Content</div>,
        },
        {
          value: 'tab2',
          text: 'Tab 2',
          tabContent: <div>Tab 2 Content</div>,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      defaultSelectedTabValue: 'tab3',
      type: 'secondary',
      onChange: () => null,
      size: 'l',
    },
  ],
};
