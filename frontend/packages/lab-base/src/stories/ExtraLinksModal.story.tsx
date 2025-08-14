import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';

import {ExtraLinksModal} from '@code-dot-org/lab-base';

export default {
  title: 'Labs/Base/ExtraLinksModal',
  component: ExtraLinksModal,
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
const Template: StoryFn<WrapperProps & ExtraLinksModalProps> = ({
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
        <ExtraLinksModal
          {...args}
        />
      </Wrapper>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  levelLinkData: {
    links: {
      'Extra Lessons': [
        {
          text: 'Level Foo!',
          url: '#foo',
        },
        {
          text: 'Level Bar!',
          url: '#bar',
        },
      ],
      'Resources': [
        {
          text: 'Slide show?',
          url: '#show',
        },
        {
          text: 'Unplugged Activity?',
          url: '#unplugged',
        },
      ],
    },
  },
  isOpen: true,
  closeModal: () => {},
  levelId: 1,
};

export const DefaultDark = Template.bind({});
DefaultDark.args = {
  theme: 'Dark',
  ...Default.args,
};
