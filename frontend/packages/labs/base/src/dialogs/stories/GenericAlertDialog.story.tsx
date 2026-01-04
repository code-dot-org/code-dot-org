import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import {GenericAlertDialog, GenericAlertDialogProps} from '@code-dot-org/lab-base/dialogs';
import Markdown from '@code-dot-org/markdown';


export default {
  title: 'Labs/Base/Dialogs/GenericAlertDialog',
  component: GenericAlertDialog,
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
const Template: StoryFn<WrapperProps & GenericAlertDialogProps> = ({
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
        <GenericAlertDialog
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

export const BodyComponent = Template.bind({});
BodyComponent.args = {
  title: 'Dialog Title',
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
  title: 'Dialog Title',
  bodyComponent: <Markdown content={markdownContent} />
};

export const MarkdownComponentDark = Template.bind({});
MarkdownComponentDark.args = {
  theme: 'Dark',
  ...MarkdownComponent.args,
};
