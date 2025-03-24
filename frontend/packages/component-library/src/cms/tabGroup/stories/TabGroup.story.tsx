import adminsPageTopImage from '@public/images/admins-page-top.png';
import helpPageTopImage from '@public/images/help-page-top.png';
import teachPageTopImage from '@public/images/teach-page-top.png';
import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/cms/image';

import TabGroup, {TabGroupTabModel} from './../TabGroup';

export default {
  title: 'CMS/TabGroup',
  component: TabGroup,
  parameters: {
    componentSubtitle: 'Renders a group of tabs with optional content',
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for segmented button.
            // SegmentedButtons component has one a11y issue, and it's related to selected button color.
            // Explanation from Design team: Since to indicate active/selected state, means that the user has
            // already made the decision to interact with that element, we are not worried about it.
            // This check only starts to pass when made very dark, which causes other issues, so we’ll leave it for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
} as Meta<typeof TabGroup>;

type Story = StoryObj<typeof TabGroup>;

const defaultButton: LinkButtonProps = {
  children: 'Click Me',
  href: 'https://code.org',
  text: 'Click me',
};

const defaultImage: ImageProps = {
  src: teachPageTopImage,
  alt: 'Teach computer science & ignite possibilities',
};

const defaultImage2: ImageProps = {
  src: adminsPageTopImage,
  alt: 'Expand computer science in your district',
};

const defaultImage3: ImageProps = {
  src: helpPageTopImage,
  alt: 'Students learning computer science',
};

const createTab = (
  value: string,
  text: string,
  image: ImageProps,
  title: string,
  description: string,
) =>
  ({
    value,
    text,
    tabContent: {
      image,
      button: defaultButton,
      title,
      description,
    },
  }) as TabGroupTabModel;

export const Playground: Story = {
  args: {
    tabs: [
      {
        value: 'tab1',
        text: 'Tab 1',
        tabContent: {
          image: defaultImage,
          button: defaultButton,
          title: 'Track Your Progress',
          description: 'Monitor student work with real-time insights.',
        },
      },
      {
        value: 'tab2',
        text: 'Tab 2',
        tabContent: {
          image: defaultImage2,
          button: defaultButton,
          title: 'Engage Students',
          description: 'Make learning more interactive and fun!',
        },
      },
    ] as TabGroupTabModel[],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'custom-content-tabs',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const tab = await canvas.findByRole('tab', {name: 'Tab 1'});
    await expect(tab).toBeVisible();

    // Test the content rendering inside the tab
    const tabPanel = canvas.getByRole('tabpanel');
    const title = await within(tabPanel).findByText('Track Your Progress');
    const description = await within(tabPanel).findByText(
      'Monitor student work with real-time insights.',
    );
    await expect(title).toBeVisible();
    await expect(description).toBeVisible();

    // Test if the button works
    const button = await within(tabPanel).findByText('Click me');
    await expect(button).toBeVisible();
  },
};

export const ThreeTabs: Story = {
  args: {
    tabs: [
      createTab(
        'tab1',
        'Tab 1',
        defaultImage,
        'Track Your Progress',
        'Monitor student work with real-time insights.',
      ),
      createTab(
        'tab2',
        'Tab 2',
        defaultImage2,
        'Engage Students',
        'Make learning more interactive and fun!',
      ),
      createTab(
        'tab3',
        'Tab 3',
        defaultImage3,
        'Enhance Skills',
        'Develop problem-solving and critical thinking skills.',
      ),
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'three-tabs',
  },
};

export const FourTabs: Story = {
  args: {
    tabs: [
      createTab(
        'tab1',
        'Tab 1',
        defaultImage,
        'Track Your Progress',
        'Monitor student work with real-time insights.',
      ),
      createTab(
        'tab2',
        'Tab 2',
        defaultImage2,
        'Engage Students',
        'Make learning more interactive and fun!',
      ),
      createTab(
        'tab3',
        'Tab 3',
        defaultImage3,
        'Enhance Skills',
        'Develop problem-solving and critical thinking skills.',
      ),
      createTab(
        'tab4',
        'Tab 4',
        defaultImage,
        'Support Teachers',
        'Provide teachers with real-time feedback and data.',
      ),
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'four-tabs',
  },
};

export const FiveTabs: Story = {
  args: {
    tabs: [
      createTab(
        'tab1',
        'Tab 1',
        defaultImage,
        'Track Your Progress',
        'Monitor student work with real-time insights.',
      ),
      createTab(
        'tab2',
        'Tab 2',
        defaultImage2,
        'Engage Students',
        'Make learning more interactive and fun!',
      ),
      createTab(
        'tab3',
        'Very Long Tab 3 Tab Title Text That Needs To Be Trimmed',
        defaultImage3,
        'Enhance Skills',
        'Develop problem-solving and critical thinking skills.',
      ),
      createTab(
        'tab4',
        'Tab 4',
        defaultImage,
        'Support Teachers',
        'Provide teachers with real-time feedback and data.',
      ),
      createTab(
        'tab5',
        'Tab 5',
        defaultImage2,
        'Build Confidence',
        'Empower students to succeed in coding and beyond.',
      ),
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'five-tabs',
  },
};

export const WithCustomContent: Story = {
  args: {
    tabs: [
      {value: 'tab1', text: 'Tab 1', tabContent: <div>Content for Tab 1</div>},
      {value: 'tab2', text: 'Tab 2', tabContent: <div>Content for Tab 2</div>},
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'basic-tabs',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const tab = await canvas.getByRole('tab', {name: 'Tab 1'});

    // Check if tab is visible
    await expect(tab).toBeVisible();

    // Click on the tab and check if it's selected
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected');
  },
};
