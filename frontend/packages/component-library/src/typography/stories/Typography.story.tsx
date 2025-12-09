import type {Meta, StoryObj} from '@storybook/react-webpack5';

import Typography, {
  StrongText,
  EmText,
  BodyOneText,
  BodyTwoText,
  BodyThreeText,
  BodyFourText,
  OverlineOneText,
  OverlineTwoText,
  OverlineThreeText,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Figcaption,
} from '../index';

export default {
  title: 'DesignSystem/Typography',
  component: Typography,
} as Meta;

type Story = StoryObj<typeof Typography>;

//
// STORIES
//

/**
 * **Playground Story** - A single Typography component for dynamic prop changes in Storybook UI.
 */
export const Playground: Story = {
  args: {
    semanticTag: 'p',
    visualAppearance: 'body-two',
    children: 'This is a dynamic Typography Component.',
  },
};

export const AllTypographyElements: Story = {
  render: () => (
    <>
      <Typography semanticTag="h1" visualAppearance="heading-xxl">
        This is a Typography Component. (H1)
      </Typography>
      <Typography semanticTag="h2" visualAppearance="heading-xl">
        This is a Typography Component. (H2)
      </Typography>
      <Typography semanticTag="h3" visualAppearance="heading-lg">
        This is a Typography Component. (H3)
      </Typography>
      <Typography semanticTag="h4" visualAppearance="heading-md">
        This is a Typography Component. (H4)
      </Typography>
      <Typography semanticTag="h5" visualAppearance="heading-sm">
        This is a Typography Component. (H5)
      </Typography>
      <Typography semanticTag="h6" visualAppearance="heading-xs">
        This is a Typography Component. (H6)
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-one">
        This is a Typography Component. (body-one)
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        This is a Typography Component. (body-two)
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-three">
        This is a Typography Component. (body-three)
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-four">
        This is a Typography Component. (body-four)
      </Typography>
      <Typography semanticTag="p" visualAppearance="overline-one">
        This is a Typography Component. (overline-one)
      </Typography>
      <Typography semanticTag="p" visualAppearance="overline-two">
        This is a Typography Component. (overline-two)
      </Typography>
      <Typography semanticTag="p" visualAppearance="overline-three">
        This is a Typography Component. (overline-three)
      </Typography>
      <Typography semanticTag="em" visualAppearance="em">
        This is a Typography Component. (em)
      </Typography>
      <Typography semanticTag="strong" visualAppearance="strong">
        This is a Typography Component. (strong)
      </Typography>
      <Typography semanticTag="figcaption" visualAppearance="figcaption">
        This is a Typography Component. (figcaption)
      </Typography>
      <Typography semanticTag="div" visualAppearance="body-two">
        <p>
          This is a Typography Component that wraps text elements. (div)
          <br />
          Use this when:
        </p>
        <ul>
          <li>
            You want to apply typography styles to child html text elements
          </li>
          <li>...but you don't have control over the child elements</li>
          <li>
            which can happen, say when using SafeMarkdown and the markdown
            contains multiple paragraphs or lists
          </li>
          <li>or when using dangerouslySetInnerHTML if you really must 😉</li>
        </ul>
      </Typography>
    </>
  ),
};

export const Headings: Story = {
  render: () => (
    <>
      <Heading1>This is a Typography Component. (H1)</Heading1>
      <Heading2>This is a Typography Component. (H2)</Heading2>
      <Heading3>This is a Typography Component. (H3)</Heading3>
      <Heading4>This is a Typography Component. (H4)</Heading4>
      <Heading5>This is a Typography Component. (H5)</Heading5>
      <Heading6>This is a Typography Component. (H6)</Heading6>
    </>
  ),
};

export const BodyTexts: Story = {
  render: () => (
    <>
      <BodyOneText>This is a Typography Component. (body-one)</BodyOneText>
      <BodyTwoText>This is a Typography Component. (body-two)</BodyTwoText>
      <BodyThreeText>
        This is a Typography Component. (body-three)
      </BodyThreeText>
      <BodyFourText>This is a Typography Component. (body-four)</BodyFourText>
    </>
  ),
};

export const OverlineTexts: Story = {
  render: () => (
    <>
      <OverlineOneText>
        This is a Typography Component. (overline-one)
      </OverlineOneText>
      <OverlineTwoText>
        This is a Typography Component. (overline-two)
      </OverlineTwoText>
      <OverlineThreeText>
        This is a Typography Component. (overline-three)
      </OverlineThreeText>
    </>
  ),
};

export const OtherTexts: Story = {
  render: () => (
    <>
      <EmText>This is a Typography Component. (em)</EmText>
      <StrongText>This is a Typography Component. (strong)</StrongText>
      <Figcaption>This is a Typography Component. (figcaption)</Figcaption>
    </>
  ),
};

export const TextWrapper: Story = {
  render: () => (
    <>
      <Typography semanticTag="div" visualAppearance="heading-lg">
        <h1>h1 child styled as an h3</h1>
      </Typography>
      <Typography semanticTag="div" visualAppearance="body-one">
        <p>paragraph element child, styled as body-one</p>
        <ul>
          <li>child list items</li>
          <li>are also styled as body-one</li>
        </ul>
      </Typography>
      <Typography semanticTag="div" visualAppearance="body-three">
        <p>
          paragraph element child here containing <strong>bold</strong> and{' '}
          <em>emphasized</em> inline elements, styled as body-three
        </p>
      </Typography>
    </>
  ),
};

export const CustomUsageExamples: Story = {
  render: () => (
    <>
      <Heading1 visualAppearance="heading-lg">
        (Heading1 as Heading3) This is a Typography Component. (H1 as H3)
      </Heading1>
      <Typography semanticTag="h2" visualAppearance="body-one">
        (Heading2 as body-one) This is a Typography Component. (H2 as
        p.body-one)
      </Typography>
      <Typography semanticTag="h3" visualAppearance="heading-sm">
        (Heading3 as Heading5) This is a Typography Component. (H3 as H5)
      </Typography>
    </>
  ),
};

export const RichTextExamples: Story = {
  render: () => (
    <>
      <BodyTwoText>
        <EmText>This is a body-two em text</EmText>
      </BodyTwoText>
      <BodyTwoText>
        <StrongText>This is a body-two strong text</StrongText>
      </BodyTwoText>
      <BodyTwoText>
        <StrongText>
          <EmText>This is a body-two strong em text</EmText>
        </StrongText>
      </BodyTwoText>
      <EmText>This is an em text</EmText>
      <StrongText>This is a strong text</StrongText>
      <EmText>
        <StrongText>This is a strong em text</StrongText>
      </EmText>
    </>
  ),
};

export const ElementsWithNoMargin: Story = {
  render: () => (
    <>
      <hr />
      <Heading6 noMargin>Heading without margins</Heading6>
      <hr />
      <BodyTwoText noMargin>Paragraph without margins</BodyTwoText>
      <hr />
      <StrongText noMargin>Strong text without margins</StrongText>
      <hr />
      <EmText noMargin>Italic text without margins</EmText>
      <hr />
    </>
  ),
};
