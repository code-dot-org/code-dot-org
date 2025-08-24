import {Meta, StoryFn} from '@storybook/react';
import type {PropsWithChildren} from 'react';

import {ThemeProvider, Theme, useTheme} from '@code-dot-org/component-library/common/contexts';

import {LoadingOverlay, LoadingOverlayProps} from '@lab-music/.';

export default {
  title: 'Labs/Music/LoadingOverlay',
  component: LoadingOverlay,
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
const Template: StoryFn<WrapperProps & LoadingOverlayProps> = ({
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
        <LoadingOverlay
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Shown = Template.bind({});
Shown.args = {
  show: true,
};

export const ShownDark = Template.bind({});
ShownDark.args = {
  theme: 'Dark',
  ...Shown.args,
};

export const ShownAndDelayed = Template.bind({});
ShownAndDelayed.args = {
  show: true,
  delayAppearance: true,
};

export const ShownAndDelayedDark = Template.bind({});
ShownAndDelayedDark.args = {
  theme: 'Dark',
  ...Shown.args,
};

export const Hidden = Template.bind({});
Hidden.args = {
  show: false,
};

export const HiddenDark = Template.bind({});
HiddenDark.args = {
  theme: 'Dark',
  ...Hidden.args,
};
