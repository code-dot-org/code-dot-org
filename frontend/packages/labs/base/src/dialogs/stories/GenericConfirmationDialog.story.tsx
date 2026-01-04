import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import {GenericConfirmationDialog, GenericConfirmationDialogProps} from '@code-dot-org/lab-base/dialogs';
import Markdown from '@code-dot-org/markdown';


export default {
  title: 'Labs/Base/Dialogs/GenericConfirmationDialog',
  component: GenericConfirmationDialog,
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
const Template: StoryFn<WrapperProps & GenericConfirmationDialogProps> = ({
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
        <GenericConfirmationDialog
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Dialog Title',
  message: 'Dialog message here',
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const Destructive = Template.bind({});
Destructive.args = {
  title: 'Dialog Title',
  message: 'Dialog message here',
  destructive: true,
};

export const DestructiveDark = Template.bind({});
DestructiveDark.args = {
  theme: 'Dark',
  ...Destructive.args,
};

export const CustomButtonText = Template.bind({});
CustomButtonText.args = {
  title: 'Dialog Title',
  message: 'Dialog message here',
  confirmText: 'Go ahead!',
};

export const CustomButtonTextDark = Template.bind({});
CustomButtonTextDark.args = {
  theme: 'Dark',
  ...CustomButtonText.args,
};

export const NeutralButton = Template.bind({});
NeutralButton.args = {
  title: 'Dialog Title',
  message: 'Dialog message here',
  neutralText: 'Maybe...',
};

export const NeutralButtonDark = Template.bind({});
NeutralButtonDark.args = {
  theme: 'Dark',
  ...NeutralButton.args,
};
