import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';

import {PreviewControls, PreviewControlsProps} from '@lab-music/.';

export default {
  title: 'Labs/Music/PreviewControls',
  component: PreviewControls,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: Theme;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  children,
}) => {
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & PreviewControlsProps> = ({
  theme,
  ...args
}) => (
  <div style={{
    minHeight: '25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <ThemeProvider>
      <Wrapper theme={theme}>
        <PreviewControls
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Disabled = Template.bind({});
Disabled.args = {
  onClickClear: () => {},
  cancelPreviews: () => {},
  enabled: false,
  playPreview: () => {},
  isPlayingPreview: false,
};

export const DisabledDark = Template.bind({});
DisabledDark.args = {
  theme: 'Dark',
  ...Disabled.args,
};

export const Enabled = Template.bind({});
Enabled.args = {
  onClickClear: () => {},
  cancelPreviews: () => {},
  enabled: true,
  playPreview: () => {},
  isPlayingPreview: false,
};

export const EnabledDark = Template.bind({});
EnabledDark.args = {
  theme: 'Dark',
  ...Enabled.args,
};

export const IsPlaying = Template.bind({});
IsPlaying.args = {
  onClickClear: () => {},
  cancelPreviews: () => {},
  enabled: true,
  playPreview: () => {},
  isPlayingPreview: true,
};

export const IsPlayingDark = Template.bind({});
IsPlayingDark.args = {
  theme: 'Dark',
  ...IsPlaying.args,
};
