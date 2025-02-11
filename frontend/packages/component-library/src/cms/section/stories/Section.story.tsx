import type {Meta, StoryObj, StoryFn} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Section, {SectionProps, sectionBackground} from '../index';
import {BodyOneText, Heading2} from '@/typography';

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
    children: (
      <>
        <Heading2>This is a default section</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('This is a default section');

    // check if children content is in the section
    expect(heading).toBeInTheDocument();
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
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText(
      'This is a section with a background color',
    );

    // check if children content is in the section
    expect(heading).toBeInTheDocument();
  },
};

export const SectionWithBackgroundPattern: Story = {
  args: {
    background: sectionBackground.patternPrimary,
    backgroundImageUrl:
      'https://code.org/images/banners/banner-bg-lines-neutral-light.png',
    padding: 'l',
    children: (
      <>
        <Heading2 style={{color: 'white'}}>
          This is a section with a background pattern
        </Heading2>
        <BodyOneText style={{color: 'white'}}>I'm just a sentence.</BodyOneText>
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
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText(
      'This is a section with a background pattern',
    );

    // check if children content is in the section
    expect(heading).toBeInTheDocument();

    // check if background image is set
    const section = heading.closest('section');
    if (section) {
      const backgroundImage = section.style.backgroundImage;
      expect(backgroundImage).toContain('banner-bg-lines-neutral-light.png');
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
          <Heading2>This is section one</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.secondary,
      padding: 'l',
      children: (
        <>
          <Heading2>This is section two</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.brandLightPrimary,
      padding: 'l',
      children: (
        <>
          <Heading2>This is section three</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      background: sectionBackground.patternDark,
      backgroundImageUrl:
        'https://code.org/images/banners/banner-bg-lines-neutral-light.png',
      padding: 'l',
      children: (
        <>
          <Heading2 style={{color: 'white'}}>This is section four</Heading2>
          <BodyOneText style={{color: 'white'}}>
            I'm just a sentence.
          </BodyOneText>
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
    'This is section one',
    'This is section two',
    'This is section three',
    'This is section four',
  ];

  headings.forEach(async headingText => {
    const heading = await canvas.findByText(headingText);

    // check if children content is in each section
    expect(heading).toBeInTheDocument();
  });
};
