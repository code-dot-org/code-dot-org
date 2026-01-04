import {Meta, StoryFn} from '@storybook/react';

import {DialogControlProvider} from '@code-dot-org/lab-base/contexts';
import {DialogViews, GenericDropdown, GenericDropdownProps} from '@code-dot-org/lab-base/dialogs';
import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';

export default {
  title: 'Labs/Base/Dialogs/GenericDropdown',
  component: GenericDropdown,
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
const Template: StoryFn<WrapperProps & GenericDropdownProps> = ({
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
          <GenericDropdown
            {...args}
          />
        </DialogControlProvider>
      </Wrapper>
    </ThemeProvider>
  </div>
);

const items = [
  {
    value: 'item1',
    text: 'Item 1',
  },
  {
    value: 'item2',
    text: 'Item 2',
  },
  {
    value: 'item3',
    text: 'Item 3',
  },
];

export const Default = Template.bind({});
Default.args = {
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const InputNotRequired = Template.bind({});
InputNotRequired.args = {
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
  placeholder: 'Optional!',
  requiresDropdown: false,
};

export const InputNotRequiredDark = Template.bind({});
InputNotRequiredDark.args = {
  theme: 'Dark',
  ...InputNotRequired.args,
};

export const CustomConfirm = Template.bind({});
CustomConfirm.args = {
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
  title: 'Dropdown Title',
  message: 'Dropdown message here',
  items,
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
