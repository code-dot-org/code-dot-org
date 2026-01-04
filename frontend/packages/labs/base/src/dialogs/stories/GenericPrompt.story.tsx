import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import {DialogControlProvider} from '@code-dot-org/lab-base/contexts';
import {DialogViews, GenericPrompt, GenericPromptProps} from '@code-dot-org/lab-base/dialogs';
import Markdown from '@code-dot-org/markdown';

export default {
  title: 'Labs/Base/Dialogs/GenericPrompt',
  component: GenericPrompt,
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
const Template: StoryFn<WrapperProps & GenericPromptProps> = ({
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
        <DialogControlProvider dialogViews={DialogViews}>
          <GenericPrompt
            {...args}
          />
        </DialogControlProvider>
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const InputNotRequired = Template.bind({});
InputNotRequired.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  placeholder: 'Optional!',
  requiresPrompt: false,
};

export const InputNotRequiredDark = Template.bind({});
InputNotRequiredDark.args = {
  theme: 'Dark',
  ...InputNotRequired.args,
};

export const CustomConfirm = Template.bind({});
CustomConfirm.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    confirm: {
      text: 'Engage!',
    },
  },
};

export const CustomConfirmDark = Template.bind({});
CustomConfirmDark.args = {
  theme: 'Dark',
  ...CustomConfirm.args,
};

export const DisabledConfirm = Template.bind({});
DisabledConfirm.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    confirm: {
      text: 'Not yet',
      disabled: true,
    },
    cancel: {
      text: 'Use this instead',
    },
  },
};

export const DisabledConfirmDark = Template.bind({});
DisabledConfirmDark.args = {
  theme: 'Dark',
  ...DisabledConfirm.args,
};

export const DestructiveConfirm = Template.bind({});
DestructiveConfirm.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    confirm: {
      text: 'Not yet',
      destructive: true,
    },
  },
};

export const DestructiveConfirmDark = Template.bind({});
DestructiveConfirmDark.args = {
  theme: 'Dark',
  ...DestructiveConfirm.args,
};

export const CustomCancel = Template.bind({});
CustomCancel.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    cancel: {
      text: 'Engage!',
    },
  },
};

export const CustomCancelDark = Template.bind({});
CustomCancelDark.args = {
  theme: 'Dark',
  ...CustomCancel.args,
};

export const DisabledCancel = Template.bind({});
DisabledCancel.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    cancel: {
      text: 'Not yet',
      disabled: true,
    },
    confirm: {
      text: 'You gotta do it',
    },
  },
};

export const DisabledCancelDark = Template.bind({});
DisabledCancelDark.args = {
  theme: 'Dark',
  ...DisabledCancel.args,
};

export const DestructiveCancel = Template.bind({});
DestructiveCancel.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    cancel: {
      text: 'Not yet',
      destructive: true,
    },
  },
};

export const DestructiveCancelDark = Template.bind({});
DestructiveCancelDark.args = {
  theme: 'Dark',
  ...DestructiveCancel.args,
};

export const CustomNeutral = Template.bind({});
CustomNeutral.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    neutral: {
      text: 'Engage!',
    },
  },
};

export const CustomNeutralDark = Template.bind({});
CustomNeutralDark.args = {
  theme: 'Dark',
  ...CustomNeutral.args,
};

export const DisabledNeutral = Template.bind({});
DisabledNeutral.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    neutral: {
      text: 'Not yet',
      disabled: true,
    },
  },
};

export const DisabledNeutralDark = Template.bind({});
DisabledNeutralDark.args = {
  theme: 'Dark',
  ...DisabledNeutral.args,
};

export const DestructiveNeutral = Template.bind({});
DestructiveNeutral.args = {
  title: 'Prompt Title',
  message: 'Prompt message here',
  buttons: {
    neutral: {
      text: 'Not yet',
      destructive: true,
    },
  },
};

export const DestructiveNeutralDark = Template.bind({});
DestructiveNeutralDark.args = {
  theme: 'Dark',
  ...DestructiveNeutral.args,
};

export const BodyComponent = Template.bind({});
BodyComponent.args = {
  title: 'Prompt Title',
  bodyComponent: <BodyThreeText>hello <strong>world</strong></BodyThreeText>,
};

export const BodyComponentDark = Template.bind({});
BodyComponentDark.args = {
  theme: 'Dark',
  ...BodyComponent.args,
};

const markdownContent = `
Hello **World** Testing ***Markdown*** and [links](#) ~~Strikethru~~

#### Subheader

More paragraph text.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

export const MarkdownComponent = Template.bind({});
MarkdownComponent.args = {
  title: 'Prompt Title',
  bodyComponent: <Markdown content={markdownContent} />
};

export const MarkdownComponentDark = Template.bind({});
MarkdownComponentDark.args = {
  theme: 'Dark',
  ...MarkdownComponent.args,
};
