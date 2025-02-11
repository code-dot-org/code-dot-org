import type {Meta, StoryObj, StoryFn} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Section, {SectionProps, sectionBackgroundColors} from '../index';
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

const createPlayFunction =
  (headingText: string) =>
  async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByText(headingText);

    // check if children content is in the document
    headings.forEach(heading => {
      expect(heading).toBeInTheDocument();
    });
  };

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
  play: createPlayFunction('This is a default section'),
};

export const SectionWithBackgroundColor: Story = {
  args: {
    backgroundColor: sectionBackgroundColors.secondary,
    padding: 'l',
    children: (
      <>
        <Heading2>This is a section with a background color</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: createPlayFunction('This is a section with a background color'),
};

export const MultipleSections = MultipleTemplate.bind({});
MultipleSections.args = {
  components: [
    {
      backgroundColor: sectionBackgroundColors.primary,
      padding: 'l',
      children: (
        <>
          <Heading2>This is section one</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      backgroundColor: sectionBackgroundColors.secondary,
      padding: 'l',
      children: (
        <>
          <Heading2>This is section two</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      backgroundColor: sectionBackgroundColors.brandLightPrimary,
      padding: 'l',
      children: (
        <>
          <Heading2>This is section three</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
  ],
};
MultipleSections.play = createPlayFunction('This is section one');
MultipleSections.play = createPlayFunction('This is section two');
MultipleSections.play = createPlayFunction('This is section three');
