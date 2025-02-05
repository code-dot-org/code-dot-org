import type {Meta, StoryObj, StoryFn} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Section, {SectionProps} from '../index';
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
    const sections = await canvas.findAllByTestId('section');
    const containers = await canvas.findAllByTestId('container');
    const headings = canvas.getAllByText(headingText);

    // check if sections are in the document
    sections.forEach(section => {
      expect(section).toBeInTheDocument();
    });

    // check if containers are in the document
    containers.forEach(container => {
      expect(container).toBeInTheDocument();
    });

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
    alignment: 'left',
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
    backgroundColor: 'secondary',
    padding: 'l',
    alignment: 'left',
    children: (
      <>
        <Heading2>This is a section with a background color</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: createPlayFunction('This is a section with a background color'),
};

export const SectionWithCenteredContent: Story = {
  args: {
    backgroundColor: 'brand-light-primary',
    padding: 'l',
    alignment: 'center',
    children: (
      <>
        <Heading2>This is a section with centered content</Heading2>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  play: createPlayFunction('This is a section with centered content'),
};

export const SectionWithBackgroundImage: Story = {
  args: {
    backgroundColor: 'dark',
    backgroundImage: 'https://code.org/images/banners/banner-bg-music.png',
    backgroundImageRepeat: false,
    backgroundSize: 'cover',
    padding: 'l',
    alignment: 'left',
    children: (
      <>
        <Heading2 style={{color: 'white'}}>
          This is a section with a background image
        </Heading2>
        <BodyOneText style={{color: 'white'}}>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Show a solid `backgroundImage`. Can be used alone or on top of `backgroundColor` if a transparent png is used. Set `backgroundImageRepeat` to `false` and `backgroundSize` to `cover` for best results.',
      },
    },
  },
  play: createPlayFunction('This is a section with a background image'),
};

export const SectionWithAPatternedBackgroundImage: Story = {
  args: {
    backgroundColor: 'dark',
    backgroundImage:
      'https://code.org/images/banners/banner-bg-lines-neutral-dark.png',
    backgroundImageRepeat: true,
    backgroundSize: 'contain',
    padding: 'l',
    alignment: 'left',
    children: (
      <>
        <Heading2 style={{color: 'white'}}>
          This is a section with a patterned background image
        </Heading2>
        <BodyOneText style={{color: 'white'}}>I'm just a sentence.</BodyOneText>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Show a patterned `backgroundImage` over `backgroundColor`. Use a transparent png and set `backgroundImageRepeat` to `true` and `backgroundSize` to `contain` for best results.',
      },
    },
  },
  play: createPlayFunction(
    'This is a section with a patterned background image',
  ),
};

export const MultipleSections = MultipleTemplate.bind({});
MultipleSections.args = {
  components: [
    {
      backgroundColor: 'primary',
      padding: 'l',
      alignment: 'left',
      children: (
        <>
          <Heading2>This is section one</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      backgroundColor: 'secondary',
      padding: 'l',
      alignment: 'center',
      children: (
        <>
          <Heading2>This is section two</Heading2>
          <BodyOneText>I'm just a sentence.</BodyOneText>
        </>
      ),
    },
    {
      backgroundColor: 'dark',
      backgroundImage:
        'https://code.org/images/banners/banner-bg-lines-neutral-dark.png',
      backgroundImageRepeat: true,
      backgroundSize: 'contain',
      padding: 'l',
      alignment: 'left',
      children: (
        <>
          <Heading2 style={{color: 'white'}}>This is section three</Heading2>
          <BodyOneText style={{color: 'white'}}>
            I'm just a sentence.
          </BodyOneText>
        </>
      ),
    },
  ],
};
MultipleSections.play = createPlayFunction('This is section one');
MultipleSections.play = createPlayFunction('This is section two');
MultipleSections.play = createPlayFunction('This is section three');
