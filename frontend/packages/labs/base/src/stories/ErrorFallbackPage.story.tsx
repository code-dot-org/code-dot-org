import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';

import {ErrorFallbackPage, ErrorFallbackPageProps} from '@lab-base/components';

export default {
  title: 'Labs/Base/ErrorFallbackPage',
  component: ErrorFallbackPage,
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
const Template: StoryFn<WrapperProps & ErrorFallbackPageProps> = ({
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
        <ErrorFallbackPage
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const CustomMessage = Template.bind({});
CustomMessage.args = {
  message: "This is some kind of custom error message",
};

export const CustomMessageDark = Template.bind({});
CustomMessageDark.args = {
  theme: 'Dark',
  ...CustomMessage.args,
};
