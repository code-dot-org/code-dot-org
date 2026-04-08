import {Typography} from '@mui/material';
import type {TypographyProps} from '@mui/material/Typography';
import type {Meta, StoryObj} from '@storybook/react-vite';

export default {
  title: 'DesignSystem/Typography',
  component: Typography,
} as Meta<typeof Typography>;

type Story = StoryObj<typeof Typography>;

//
// STORIES
//

/**
 * **Playground Story** - A single Typography component for dynamic prop changes in Storybook UI.
 */
export const Playground: Story = {
  args: {
    component: 'p',
    variant: 'body2',
    children: 'This is a dynamic Typography Component.',
  } as TypographyProps,
};

export const AllTypographyElements: Story = {
  render: () => (
    <>
      <Typography variant="h1" gutterBottom>
        This is a Typography Component. (H1)
      </Typography>
      <Typography variant="h2" gutterBottom>
        This is a Typography Component. (H2)
      </Typography>
      <Typography variant="h3" gutterBottom>
        This is a Typography Component. (H3)
      </Typography>
      <Typography variant="h4" gutterBottom>
        This is a Typography Component. (H4)
      </Typography>
      <Typography variant="h5" gutterBottom>
        This is a Typography Component. (H5)
      </Typography>
      <Typography variant="h6" gutterBottom>
        This is a Typography Component. (H6)
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a Typography Component. (body-one)
      </Typography>
      <Typography variant="body2" gutterBottom>
        This is a Typography Component. (body-two)
      </Typography>
      <Typography variant="body3" gutterBottom>
        This is a Typography Component. (body-three)
      </Typography>
      <Typography variant="body4" gutterBottom>
        This is a Typography Component. (body-four)
      </Typography>
      <Typography variant="overline1" gutterBottom>
        This is a Typography Component. (overline-one)
      </Typography>
      <Typography variant="overline2" gutterBottom>
        This is a Typography Component. (overline-two)
      </Typography>
      <Typography variant="overline3" gutterBottom>
        This is a Typography Component. (overline-three)
      </Typography>
      <Typography variant="em">This is a Typography Component. (em)</Typography>
      <Typography variant="strong">
        This is a Typography Component. (strong)
      </Typography>
      <Typography variant="figcaption" gutterBottom>
        This is a Typography Component. (figcaption)
      </Typography>
      <Typography component="div" variant="body2" gutterBottom>
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
      <Typography variant="h1" gutterBottom>
        This is a Typography Component. (H1)
      </Typography>
      <Typography variant="h2" gutterBottom>
        This is a Typography Component. (H2)
      </Typography>
      <Typography variant="h3" gutterBottom>
        This is a Typography Component. (H3)
      </Typography>
      <Typography variant="h4" gutterBottom>
        This is a Typography Component. (H4)
      </Typography>
      <Typography variant="h5" gutterBottom>
        This is a Typography Component. (H5)
      </Typography>
      <Typography variant="h6" gutterBottom>
        This is a Typography Component. (H6)
      </Typography>
    </>
  ),
};

export const BodyTexts: Story = {
  render: () => (
    <>
      <Typography variant="body1" gutterBottom>
        This is a Typography Component. (body-one)
      </Typography>
      <Typography variant="body2" gutterBottom>
        This is a Typography Component. (body-two)
      </Typography>
      <Typography variant="body3" gutterBottom>
        This is a Typography Component. (body-three)
      </Typography>
      <Typography variant="body4" gutterBottom>
        This is a Typography Component. (body-four)
      </Typography>
    </>
  ),
};

export const OverlineTexts: Story = {
  render: () => (
    <>
      <Typography variant="overline1" gutterBottom>
        This is a Typography Component. (overline-one)
      </Typography>
      <Typography variant="overline2" gutterBottom>
        This is a Typography Component. (overline-two)
      </Typography>
      <Typography variant="overline3" gutterBottom>
        This is a Typography Component. (overline-three)
      </Typography>
    </>
  ),
};

export const OtherTexts: Story = {
  render: () => (
    <>
      <Typography variant="em">This is a Typography Component. (em)</Typography>
      <Typography variant="strong">
        This is a Typography Component. (strong)
      </Typography>
      <Typography variant="figcaption" gutterBottom>
        This is a Typography Component. (figcaption)
      </Typography>
    </>
  ),
};

export const TextWrapper: Story = {
  render: () => (
    <>
      <Typography component="div" variant="h3" gutterBottom>
        <h1>h1 child styled as an h3</h1>
      </Typography>
      <Typography component="div" variant="body1" gutterBottom>
        <p>paragraph element child, styled as body-one</p>
        <ul>
          <li>child list items</li>
          <li>are also styled as body-one</li>
        </ul>
      </Typography>
      <Typography component="div" variant="body3" gutterBottom>
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
      <Typography component="h1" variant="h3" gutterBottom>
        (Heading1 as Heading3) This is a Typography Component. (H1 as H3)
      </Typography>
      <Typography component="h2" variant="body1" gutterBottom>
        (Heading2 as body-one) This is a Typography Component. (H2 as
        p.body-one)
      </Typography>
      <Typography component="h3" variant="h5" gutterBottom>
        (Heading3 as Heading5) This is a Typography Component. (H3 as H5)
      </Typography>
    </>
  ),
};

export const RichTextExamples: Story = {
  render: () => (
    <>
      <Typography variant="body2" gutterBottom>
        <Typography variant="em">This is a body-two em text</Typography>
      </Typography>
      <Typography variant="body2" gutterBottom>
        <Typography variant="strong">This is a body-two strong text</Typography>
      </Typography>
      <Typography variant="body2" gutterBottom>
        <Typography variant="strong">
          <Typography variant="em">
            This is a body-two strong em text
          </Typography>
        </Typography>
      </Typography>
      <Typography variant="em">This is an em text</Typography>
      <Typography variant="strong">This is a strong text</Typography>
      <Typography variant="em">
        <Typography variant="strong">This is a strong em text</Typography>
      </Typography>
    </>
  ),
};

export const ElementsWithNoMargin: Story = {
  render: () => (
    <>
      <hr />
      <Typography variant="h6">Heading without margins</Typography>
      <hr />
      <Typography variant="body2">Paragraph without margins</Typography>
      <hr />
      <Typography variant="strong">Strong text without margins</Typography>
      <hr />
      <Typography variant="em">Italic text without margins</Typography>
      <hr />
    </>
  ),
};
