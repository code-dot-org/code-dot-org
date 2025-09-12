import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import MuiTypography from '@mui/material/Typography';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import theme from '@cdo/apps/themes/code.org';

// global styles so typography tokens apply
import '@code-dot-org/component-library-styles/colors.scss';

export default {
  title: 'DesignSystem/MUITypography', // eslint-disable-line storybook/no-title-property-in-meta
  component: MuiTypography,
  decorators: [
    Story => (
      <MuiThemeProvider theme={theme}>
        <Story />
      </MuiThemeProvider>
    ),
  ],
} as Meta;

type Story = StoryObj<typeof MuiTypography>;

//
// STORIES
//

/**
 * **Playground Story**
 */
export const Playground: Story = {
  args: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    component: 'p',
    variant: 'body2',
    children: 'This is a dynamic MuiTypography Component.',
  },
};

export const AllTypographyElements: Story = {
  render: () => (
    <>
      <MuiTypography gutterBottom component="h1" variant="h1">
        This is a Typography Component. (H1)
      </MuiTypography>
      <MuiTypography component="h2" variant="h2">
        This is a Typography Component. (H2)
      </MuiTypography>
      <MuiTypography component="h3" variant="h3">
        This is a Typography Component. (H3)
      </MuiTypography>
      <MuiTypography component="h4" variant="h4">
        This is a Typography Component. (H4)
      </MuiTypography>
      <MuiTypography component="h5" variant="h5">
        This is a Typography Component. (H5)
      </MuiTypography>
      <MuiTypography component="h6" variant="h6">
        This is a Typography Component. (H6)
      </MuiTypography>
      <MuiTypography variant="body1">
        This is a Typography Component. (body-one)
      </MuiTypography>
      <MuiTypography variant="body2">
        This is a Typography Component. (body-two)
      </MuiTypography>
      <MuiTypography variant="body3">
        This is a Typography Component. (body-three)
      </MuiTypography>
      <MuiTypography variant="body4">
        This is a Typography Component. (body-four)
      </MuiTypography>
      <MuiTypography variant="overline1">
        This is a Typography Component. (overline-one)
      </MuiTypography>
      <MuiTypography variant="overline2">
        This is a Typography Component. (overline-two)
      </MuiTypography>
      <MuiTypography variant="overline3">
        This is a Typography Component. (overline-three)
      </MuiTypography>
      <MuiTypography variant="body2">
        <em>This is a Typography Component. (em)</em>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a Typography Component. (strong)</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a Typography Component. (extra-strong)</strong>
      </MuiTypography>
      <MuiTypography component="figcaption" variant="figcaption">
        This is a Typography Component. (figcaption)
      </MuiTypography>
      <MuiTypography component="div" variant="body2">
        <p>
          This is a Typography Component that wraps text elements. (div)
          <br />
          Use this when:
        </p>
        <ul>
          <li>
            You want to apply typography styles to child html text elements
          </li>
          <li>...but you don’t have control over the child elements</li>
          <li>
            which can happen, say when using SafeMarkdown and the markdown
            contains multiple paragraphs or lists
          </li>
          <li>or when using dangerouslySetInnerHTML if you really must 😉</li>
        </ul>
      </MuiTypography>
    </>
  ),
};

export const Headings: Story = {
  render: () => (
    <>
      <MuiTypography variant="h1">
        This is a Typography Component. (H1)
      </MuiTypography>
      <MuiTypography variant="h2">
        This is a Typography Component. (H2)
      </MuiTypography>
      <MuiTypography variant="h3">
        This is a Typography Component. (H3)
      </MuiTypography>
      <MuiTypography variant="h4">
        This is a Typography Component. (H4)
      </MuiTypography>
      <MuiTypography variant="h5">
        This is a Typography Component. (H5)
      </MuiTypography>
      <MuiTypography variant="h6">
        This is a Typography Component. (H6)
      </MuiTypography>
    </>
  ),
};

export const BodyTexts: Story = {
  render: () => (
    <>
      <MuiTypography variant="body1">
        This is a Typography Component. (body-one)
      </MuiTypography>
      <MuiTypography variant="body2">
        This is a Typography Component. (body-two)
      </MuiTypography>
      <MuiTypography variant="body3">
        This is a Typography Component. (body-three)
      </MuiTypography>
      <MuiTypography variant="body4">
        This is a Typography Component. (body-four)
      </MuiTypography>
    </>
  ),
};

export const OverlineTexts: Story = {
  render: () => (
    <>
      <MuiTypography variant="overline1">
        This is a Typography Component. (overline-one)
      </MuiTypography>
      <MuiTypography variant="overline2">
        This is a Typography Component. (overline-two)
      </MuiTypography>
      <MuiTypography variant="overline3">
        This is a Typography Component. (overline-three)
      </MuiTypography>
    </>
  ),
};

export const OtherTexts: Story = {
  render: () => (
    <>
      <MuiTypography variant="body2">
        <em>This is a Typography Component. (em)</em>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a Typography Component. (strong)</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a Typography Component. (extra-strong)</strong>
      </MuiTypography>
      <MuiTypography component="figcaption" variant="figcaption">
        This is a Typography Component. (figcaption)
      </MuiTypography>
    </>
  ),
};

export const TextWrapper: Story = {
  render: () => (
    <>
      <MuiTypography component="div" variant="h3">
        <h1>h1 child styled as an h3</h1>
      </MuiTypography>
      <MuiTypography component="div" variant="body1">
        <p>paragraph element child, styled as body-one</p>
        <ul>
          <li>child list items</li>
          <li>are also styled as body-one</li>
        </ul>
      </MuiTypography>
      <MuiTypography component="div" variant="subtitle1">
        <p>
          paragraph element child here containing <strong>bold</strong> and{' '}
          <em>emphasized</em> inline elements, styled as body-three
        </p>
      </MuiTypography>
    </>
  ),
};

export const CustomUsageExamples: Story = {
  render: () => (
    <>
      <MuiTypography component="h1" variant="h3">
        (Heading1 as Heading3) This is a Typography Component. (H1 as H3)
      </MuiTypography>
      <MuiTypography component="h2" variant="body1">
        (Heading2 as body-one) This is a Typography Component. (H2 as
        p.body-one)
      </MuiTypography>
      <MuiTypography component="h3" variant="h5">
        (Heading3 as Heading5) This is a Typography Component. (H3 as H5)
      </MuiTypography>
    </>
  ),
};

export const RichTextExamples: Story = {
  render: () => (
    <>
      <MuiTypography variant="body2">
        <em>This is a body-two em text</em>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a body-two strong text</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a body-two extra-strong text</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>
          <em>This is a body-two strong em text</em>
        </strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>
          <em>This is a body-two extra-strong em text</em>
        </strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <em>This is an em text</em>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is a strong text</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>This is an extra-strong text</strong>
      </MuiTypography>
      <MuiTypography variant="body2">
        <em>
          <strong>This is a strong em text</strong>
        </em>
      </MuiTypography>
      <MuiTypography variant="body2">
        <strong>
          <em>This is an extra-strong em text</em>
        </strong>
      </MuiTypography>
    </>
  ),
};

export const ElementsWithNoMargin: Story = {
  render: () => (
    <>
      <hr />
      <MuiTypography variant="h6" gutterBottom={false}>
        Heading without margins
      </MuiTypography>
      <hr />
      <MuiTypography variant="body2" gutterBottom={false}>
        Paragraph without margins
      </MuiTypography>
      <hr />
      <MuiTypography variant="body2" gutterBottom={false}>
        <strong>Strong text without margins</strong>
      </MuiTypography>
      <hr />
      <MuiTypography variant="body2" gutterBottom={false}>
        <em>Italic text without margins</em>
      </MuiTypography>
      <hr />
    </>
  ),
};
