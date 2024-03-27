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
const SingleTemplate: StoryFn<TabsProps> = args => <Tabs {...args} />;

const MultipleTemplate: StoryFn<{
  components: TabsProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Tabs key={componentArg.name} {...componentArg} />
    ))}
  </>
);

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
  selectedTabValue: 'tab1',
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
  selectedTabValue: 'tab1',
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
          disabled: true,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      selectedTabValue: 'tab1',
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
          disabled: true,
        },
        {
          value: 'tab3',
          text: 'Tab 3',
          tabContent: <div>Tab 3 Content</div>,
        },
      ],
      selectedTabValue: 'tab1',
      onChange: () => null,
      type: 'secondary',
    },
  ],
};

export const GroupOfSizesOfTabs = MultipleTemplate.bind({});
GroupOfSizesOfTabs.args = {
  components: [
    {
      name: 'tabs_xs',
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
      selectedTabValue: 'tab1',
      onChange: () => null,
      size: 'xs',
    },
    {
      name: 'tabs_s',
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
      selectedTabValue: 'tab1',
      onChange: () => null,
      size: 's',
    },
    {
      name: 'tabs_m',
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
      selectedTabValue: 'tab1',
      onChange: () => null,
      size: 'm',
    },
    {
      name: 'tabs_l',
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
      selectedTabValue: 'tab1',
      onChange: () => null,
      size: 'l',
    },
  ],
};
