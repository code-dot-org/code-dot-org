import type {Meta, StoryObj} from '@storybook/react';

import {StubSection} from '../StubSection';

const meta: Meta<typeof StubSection> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/configure/#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Atoms/StubSection',
  component: StubSection,
};

export default meta;
type Story = StoryObj<typeof StubSection>;

export const Empty: Story = {
  args: {
    label: 'Hello World!',
    backgroundColor: 'white',
  },
};
