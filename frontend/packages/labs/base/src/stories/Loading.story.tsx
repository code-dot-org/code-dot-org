import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {Loading, LoadingProps} from '@code-dot-org/lab-base';

export default {
  title: 'Labs/Base/Loading',
  component: Loading,
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
const Template: StoryFn<WrapperProps & LoadingProps> = ({
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
        <Loading
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  isLoading: true,
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};

export const Done = Template.bind({});
Done.args = {
  isLoading: false,
};

export const DoneDark = Template.bind({});
DoneDark.args = {
  theme: 'Dark',
  ...Done.args,
};
