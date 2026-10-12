import {ThemeProvider} from '@mui/material';
import type {Meta, StoryObj} from '@storybook/react-vite';

import {CodeaiTheme} from '@code-dot-org/component-library/themes';

import Launchpad from './Launchpad';

const meta = {
  title: 'Studio/Launchpad',
  component: Launchpad,
  decorators: [
    Story => (
      <ThemeProvider theme={CodeaiTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Launchpad>;

export default meta;
export const BrowserPreview: StoryObj<typeof meta> = {};
