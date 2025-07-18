import {Meta, StoryFn} from '@storybook/react';

// Used for overrides
import {
  Heading1,
} from '@code-dot-org/component-library/typography';

import Markdown, {MarkdownProps} from '@/components/Markdown';


export default {
  title: 'Markdown',
  component: Markdown,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<MArkdownProps> = args => (
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
  content: "Hello **world**\n\nThis is another paragraph.\n\n**Bold** *Italic* ~Strikethru~.\n\nThis is [a link](#)!",
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
