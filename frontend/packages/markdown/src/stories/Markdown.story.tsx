import {Meta, StoryFn} from '@storybook/react';

// Used for overrides
import {
  Heading1,
} from '@code-dot-org/component-library/typography';
import Markdown, {MarkdownProps} from '@code-dot-org/markdown';


export default {
  title: 'Platform/Markdown',
  component: Markdown,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<MarkdownProps> = args => (
  <Markdown
    {...args}
  />
);

export const SimpleMarkdown = SingleTemplate.bind({});
SimpleMarkdown.args = {
  content: "Hello world",
};

export const InlineMarkdown = SingleTemplate.bind({});
InlineMarkdown.args = {
  content: "Hello world",
  inline: true,
};

export const ComplexMarkdown = SingleTemplate.bind({});
ComplexMarkdown.args = {
  content: "# Header\n\n## Subheader\n\n### Subsubheader\n\n####Subsubsubheader\n\nHello **world**\n\nThis is another paragraph.\n\n**Bold** *Italic* ~~Strikethru~~ <u>underlined</u> ***Bold Italic*** ~~***Bold Italic Strikethru***~~ <u>~~***Bold Italic Strikethru Underlined***~~</u>.\n\nThis is [a link](#)!\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
};

export const OverrideParagraphSize = SingleTemplate.bind({});
OverrideParagraphSize.args = {
  content: "This is a paragraph. It should be very large, like a header",
  overrides: {
    p: {
      component: Heading1,
    },
  },
};
