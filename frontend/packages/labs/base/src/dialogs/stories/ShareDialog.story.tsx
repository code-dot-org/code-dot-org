import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {ShareDialog, ShareDialogProps} from '@code-dot-org/lab-base/dialogs';
import {default as defaultStore, injectSlice, RootStateProvider, useAppDispatch} from '@code-dot-org/redux';
import {UserType} from '@code-dot-org/user';
import {currentUserSlice} from '@code-dot-org/user/redux';

injectSlice(currentUserSlice, defaultStore);

export default {
  title: 'Labs/Base/Dialogs/ShareDialog',
  component: ShareDialog,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme: string;
  userType: UserType;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  userType,
  children,
}) => {
  const dispatch = useAppDispatch();
  dispatch(currentUserSlice.actions.setUserType({
    userType,
    under13: false,
  }));
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & ShareDialogProps> = ({
  theme,
  userType,
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
      <RootStateProvider>
        <Wrapper theme={theme} userType={userType}>
          <ShareDialog
            {...args}
          />
        </Wrapper>
      </RootStateProvider>
    </ThemeProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {};

export const Dark = Template.bind({});
Dark.args = {
  theme: 'Dark',
};

export const FinishAsStudent = Template.bind({});
FinishAsStudent.args = {
  userType: UserType.Student,
  finishUrl: '#',
};

export const FinishAsStudentDark = Template.bind({});
FinishAsStudentDark.args = {
  ...FinishAsStudent.args,
  theme: 'Dark',
};

export const FinishAsTeacher = Template.bind({});
FinishAsTeacher.args = {
  finishUrl: '#',
  userType: UserType.Teacher,
};

export const FinishAsTeacherDark = Template.bind({});
FinishAsTeacherDark.args = {
  ...FinishAsTeacher.args,
  theme: 'Dark',
};
