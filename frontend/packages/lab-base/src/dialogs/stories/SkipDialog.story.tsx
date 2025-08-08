import {Meta, StoryFn} from '@storybook/react';

import {SkipDialog, SkipDialogProps} from '@code-dot-org/lab-base/dialogs';
import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';

export default {
  title: 'Labs/Base/Dialogs/SkipDialog',
  component: SkipDialog,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: string;
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
const Template: StoryFn<WrapperProps & SkipDialogProps> = ({
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
        <SkipDialog
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {};

export const Dark = Template.bind({});
Dark.args = {
  theme: 'Dark',
};
