import {Meta, StoryFn} from '@storybook/react';
import React, {PropsWithChildren} from 'react';

import {AppProvider, useApp} from '@code-dot-org/lab-base/contexts';
import {StartOverDialog, StartOverDialogProps} from '@code-dot-org/lab-base/dialogs';
import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';

export default {
  title: 'Labs/Base/Dialogs/StartOverDialog',
  component: StartOverDialog,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: string;
  /** The level data */
  lab: LabProps;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  lab,
  children,
}) => {
  useTheme().setTheme(theme || 'Light');
  useApp().setLab(lab);
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & StartOverDialogProps> = ({
  theme,
  lab,
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
      <AppProvider>
        <Wrapper theme={theme} lab={lab}>
          <StartOverDialog
            {...args}
          />
        </Wrapper>
      </AppProvider>
    </ThemeProvider>
  </div>
);

/**
 * This shows the default dialog for a level whose app name is unknown.
 */
export const UnknownLevel = Template.bind({});
UnknownLevel.args = {
  lab: {
    levelProperties: {
      id: 1,
      name: 'My Lab',
      appName: 'foo',
    },
  },
};

/**
 * This shows the default dialog for a level whose app name is 'pythonlab'.
 */
export const PythonLabLevel = Template.bind({});
PythonLabLevel.args = {
  lab: {
    levelProperties: {
      id: 2,
      name: 'My Python Lab',
      appName: 'pythonlab',
    },
  },
};

/**
 * This shows the default dialog for a level whose app name is unknown.
 */
export const UnknownLevelDark = Template.bind({});
UnknownLevelDark.args = {
  theme: 'Dark',
  ...UnknownLevel.args,
};

/**
 * This shows the default dialog for a level whose app name is 'pythonlab'.
 */
export const PythonLabLevelDark = Template.bind({});
PythonLabLevelDark.args = {
  theme: 'Dark',
  ...PythonLabLevel.args,
};
