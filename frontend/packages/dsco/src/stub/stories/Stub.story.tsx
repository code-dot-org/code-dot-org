import type { Meta, StoryObj } from '@storybook/react';
 
import { Stub } from '../Stub';
 
const meta: Meta<typeof Stub> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/configure/#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Atoms/Stub',
  component: Stub,
};
 

export default meta;
type Story = StoryObj<typeof Stub>;

export const Empty: Story = {
  args: {
    label: 'Hello World!',
    backgroundColor: 'white'
  }
};