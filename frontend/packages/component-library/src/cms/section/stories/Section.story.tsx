import bgPattern from '@public/images/bg-pattern.png';
import type {Meta, StoryObj, StoryFn} from '@storybook/react';
import {within, expect} from '@storybook/test';

import {BodyOneText, Heading2} from '@/typography';

import Section, {SectionProps, sectionBackground} from '../index';

export default {
  title: 'CMS/Section',
  component: Section,
} as Meta;
type Story = StoryObj<typeof Section>;

//
// TEMPLATE
//
const MultipleTemplate: StoryFn<{components: SectionProps[]}> = args => (
  <>
    {args.components.map((component, index) => (
      <Section key={index} {...component} />
    ))}
  </>
);

//
// STORIES
//
export const DefaultSection: Story = {
  args: {
    padding: 'l',
    backgroundImageUrl: bgPattern,
    children: (
      <>
        <Heading2>This is a default section</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('This is a default section');

    // check if children content is in the section
    await expect(heading).toBeInTheDocument();
  },
};

export const SectionWithBackgroundColor: Story = {
  args: {
    background: sectionBackground.secondary,
    padding: 'l',
    children: (
      <>
        <Heading2>This is a section with a background color</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText(
      'This is a section with a background color',
    );

    // check if children content is in the section
    await expect(heading).toBeInTheDocument();
  },
};

export const SectionWithBackgroundPattern: Story = {
  args: {
    background: sectionBackground.patternPrimary,
    backgroundImageUrl: bgPattern,
    padding: 'l',
    children: (
      <>
        <Heading2>This is a section with a background pattern</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `The \`backgroundImageUrl\` prop can be set manually as seen here, or logically as seen in the CMS implementation where there are predefined options set.`,
      },
    },
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText(
      'This is a section with a background pattern',
    );

    // check if children content is in the section
    await expect(heading).toBeInTheDocument();

    // check if background image is set
    const section = heading.closest('section');
    if (section) {
      const backgroundImage = section.style.backgroundImage;
      await expect(backgroundImage).toContain('bg-pattern');
    }
  },
};

export const MultipleSections = MultipleTemplate.bind({});
MultipleSections.args = {
  components: [
    {
      background: sectionBackground.primary,
      padding: 'l',
      children: (
        <>
          <Heading2>Primary section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.secondary,
      padding: 'l',
      children: (
        <>
          <Heading2>Secondary section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.dark,
      padding: 'l',
      children: (
        <>
          <Heading2>Dark section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.brandLightPrimary,
      padding: 'l',
      children: (
        <>
          <Heading2>Brand Light Primary section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.brandLightSecondary,
      padding: 'l',
      children: (
        <>
          <Heading2>Brand Light Secondary section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.patternDark,
      backgroundImageUrl: bgPattern,
      padding: 'l',
      children: (
        <>
          <Heading2>Pattern Dark section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.patternPrimary,
      backgroundImageUrl: bgPattern,
      padding: 'l',
      children: (
        <>
          <Heading2>Pattern Primary section</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
  ],
};
MultipleSections.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const headings = [
    'Primary section',
    'Secondary section',
    'Dark section',
    'Brand Light Primary section',
    'Brand Light Secondary section',
    'Pattern Dark section',
    'Pattern Primary section',
  ];
  const sectionPrimary = canvas.getByText('Primary section').closest('section');
  const sectionSecondary = canvas
    .getByText('Secondary section')
    .closest('section');
  const sectionDark = canvas.getByText('Dark section').closest('section');
  const sectionBrandLightPrimary = canvas
    .getByText('Brand Light Primary section')
    .closest('section');
  const sectionBrandLightSecondary = canvas
    .getByText('Brand Light Secondary section')
    .closest('section');
  const sectionPatternDark = canvas
    .getByText('Pattern Dark section')
    .closest('section');
  const sectionPatternPrimary = canvas
    .getByText('Pattern Primary section')
    .closest('section');

  headings.forEach(async headingText => {
    const heading = await canvas.findByText(headingText);

    // check if children content is in each section
    await expect(heading).toBeInTheDocument();
  });

  // check if the right sections have the Light data-theme
  const sectionsWithLightTheme = [
    sectionPrimary,
    sectionSecondary,
    sectionBrandLightPrimary,
    sectionBrandLightSecondary,
  ];
  sectionsWithLightTheme.forEach(async section => {
    if (section) {
      const dataTheme = section.getAttribute('data-theme');
      await expect(dataTheme).toBe('Light');
    }
  });

  // check if the right sections have the Dark data-theme
  const sectionsWithDarkTheme = [
    sectionDark,
    sectionPatternDark,
    sectionPatternPrimary,
  ];
  sectionsWithDarkTheme.forEach(async section => {
    if (section) {
      const dataTheme = section.getAttribute('data-theme');
      await expect(dataTheme).toBe('Dark');
    }
  });

  // check if the right sections have the background image
  const sectionsWithBgPattern = [sectionPatternDark, sectionPatternPrimary];
  sectionsWithBgPattern.forEach(async section => {
    if (section) {
      const backgroundImage = section.style.backgroundImage;
      await expect(backgroundImage).toContain('bg-pattern');
    }
  });
};
