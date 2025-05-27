import adminsPageTopImage from '@public/images/admins-page-top.png';
import helpPageTopImage from '@public/images/help-page-top.png';
import teachPageTopImage from '@public/images/teach-page-top.png';
import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';

import TabGroup, {TabGroupTabModel} from './../TabGroup';

export default {
  title: 'CMS/TabGroup',
  component: TabGroup,
  parameters: {
    componentSubtitle:
      'Renders a group of tabs with TabGroup or regular Tab content',
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
): TabGroupTabModel => ({
  value,
  text,
  tabContent: {
    image,
    button: defaultButton,
    title,
    description,
  },
});

export const Playground: Story = {
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
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'custom-content-tabs',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const tab = await canvas.findByRole('tab', {name: 'Tab 1'});
    await expect(tab).toBeVisible();
    const tabPanel = canvas.getByRole('tabpanel');
    await expect(
      within(tabPanel).getByText('Track Your Progress'),
    ).toBeVisible();
    await expect(
      within(tabPanel).getByText(
        'Monitor student work with real-time insights.',
      ),
    ).toBeVisible();
    await expect(within(tabPanel).getByText('Click me')).toBeVisible();
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

export const WithoutImageOrButton: Story = {
  args: {
    tabs: [
      {
        value: 'tab1',
        text: 'No Image & Button',
        tabContent: {
          title: 'Text Only',
          description: 'This tab has neither image nor button.',
        },
      },
      {
        value: 'tab2',
        text: 'No Image',
        tabContent: {
          title: 'No Image',
          description: 'This tab has no image.',
          button: defaultButton,
        },
      },
      {
        value: 'tab3',
        text: 'No Button',
        tabContent: {
          image: defaultImage3,
          title: 'Image Only',
          description: 'This tab has an image but no button.',
        },
      },
      {
        value: 'tab4',
        text: 'With Image & Button',
        tabContent: {
          image: defaultImage,
          button: defaultButton,
          title: 'Image & Button',
          description: 'This tab has both image and button.',
        },
      },
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'no-image-or-button',
  },
};

export const RegularTabModel: Story = {
  args: {
    tabs: [
      {
        value: 'tab1',
        text: 'Tab 1',
        tabContent: <div>Regular Tab Content 1</div>,
      },
      {
        value: 'tab2',
        text: 'Tab 2',
        tabContent: <div>Regular Tab Content 2</div>,
      },
    ],
    defaultSelectedTabValue: 'tab1',
    onChange: value => console.log(`Selected Tab: ${value}`),
    name: 'legacy-tabs',
  },
};

export const MixedTabTypes: Story = {
  args: {
    tabs: [
      createTab(
        'structured',
        'Structured Tab',
        defaultImage,
        'Structured Title',
        'Structured tab using TabGroupTabModel',
      ),
      {
        value: 'regular',
        text: 'Regular Tab',
        tabContent: <div>This is Regular Tab content</div>,
      },
    ],
    defaultSelectedTabValue: 'structured',
    name: 'mixed-tabs',
  },
};
