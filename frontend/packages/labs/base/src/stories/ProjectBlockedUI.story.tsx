import {Meta, StoryFn} from '@storybook/react';

import {ThemeProvider, useTheme} from '@code-dot-org/component-library/common/contexts';
import {default as defaultStore, injectSlice, RootStateProvider, useAppDispatch} from '@code-dot-org/redux';

import {ProjectBlockedUI, ProjectBlockedUIProps} from '@lab-base/components';
import {labSlice} from '@lab-base/redux';

injectSlice(labSlice, defaultStore);

export default {
  title: 'Labs/Base/ProjectBlockedUI',
  component: ProjectBlockedUI,
  parameters: {},
} as Meta;

interface WrapperProps extends PropsWithChildren {
  /** The theme to render the wrapped components within */
  theme?: string;
  isOwner?: boolean;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  theme,
  isOwner,
  children,
}) => {
  const dispatch = useAppDispatch();
  dispatch(labSlice.actions.setChannel({
    id: 'foo',
    name: 'foo',
    isOwner: isOwner || false,
    projectType: 'artist',
    publishedAt: '0',
    createAt: '0',
    updatedAt: '0',
  }));
  useTheme().setTheme(theme || 'Light');
  return children;
};

//
// TEMPLATE
//
const Template: StoryFn<WrapperProps & ProjectBlockedUIProps> = ({
  theme,
  isOwner,
  ...args
}) => (
  <div style={{
    minHeight: '25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }}>
    <ThemeProvider>
      <RootStateProvider>
        <Wrapper theme={theme} isOwner={isOwner}>
          <ProjectBlockedUI
            {...args}
          />
        </Wrapper>
      </RootStateProvider>
    </ThemeProvider>
  </div>
);

export const BlockedForAbuse = Template.bind({});
BlockedForAbuse.args = {
  blockedType: 'projectAbuse',
  isProjectValidator: false,
};

export const BlockedForAbuseDark = Template.bind({});
BlockedForAbuseDark.args = {
  theme: 'Dark',
  ...BlockedForAbuse.args,
};

export const BlockedForAbuseAndIsOwner = Template.bind({});
BlockedForAbuseAndIsOwner.args = {
  isOwner: true,
  blockedType: 'projectAbuse',
  isProjectValidator: false,
};

export const BlockedForAbuseAndIsOwnerDark = Template.bind({});
BlockedForAbuseAndIsOwnerDark.args = {
  theme: 'Dark',
  ...BlockedForAbuseAndIsOwner.args,
};

export const BlockedForShare = Template.bind({});
BlockedForShare.args = {
  blockedType: 'projectSharingDisabled',
  isProjectValidator: false,
};

export const BlockedForShareDark = Template.bind({});
BlockedForShareDark.args = {
  theme: 'Dark',
  ...BlockedForShare.args,
};

export const BlockedForShareAndIsOwner = Template.bind({});
BlockedForShareAndIsOwner.args = {
  isOwner: true,
  blockedType: 'projectSharingDisabled',
  isProjectValidator: false,
};

export const BlockedForShareAndIsOwnerDark = Template.bind({});
BlockedForShareAndIsOwnerDark.args = {
  theme: 'Dark',
  ...BlockedForShareAndIsOwner.args,
};

export const BlockedByProjectValidatorForAbuse = Template.bind({});
BlockedByProjectValidatorForAbuse.args = {
  blockedType: 'projectAbuse',
  isProjectValidator: true,
};

export const BlockedByProjectValidatorForAbuseDark = Template.bind({});
BlockedByProjectValidatorForAbuseDark.args = {
  theme: 'Dark',
  ...BlockedByProjectValidatorForAbuse.args,
};

export const BlockedByProjectValidatorForAbuseAndIsOwner = Template.bind({});
BlockedByProjectValidatorForAbuseAndIsOwner.args = {
  isOwner: true,
  blockedType: 'projectAbuse',
  isProjectValidator: true,
};

export const BlockedByProjectValidatorForAbuseAndIsOwnerDark = Template.bind({});
BlockedByProjectValidatorForAbuseAndIsOwnerDark.args = {
  theme: 'Dark',
  ...BlockedByProjectValidatorForAbuseAndIsOwner.args,
};

export const BlockedByProjectValidatorForShare = Template.bind({});
BlockedByProjectValidatorForShare.args = {
  blockedType: 'projectSharingDisabled',
  isProjectValidator: true,
};

export const BlockedByProjectValidatorForShareDark = Template.bind({});
BlockedByProjectValidatorForShareDark.args = {
  theme: 'Dark',
  ...BlockedByProjectValidatorForShare.args,
};

export const BlockedByProjectValidatorForShareAndIsOwner = Template.bind({});
BlockedByProjectValidatorForShareAndIsOwner.args = {
  isOwner: true,
  blockedType: 'projectSharingDisabled',
  isProjectValidator: true,
};

export const BlockedByProjectValidatorForShareAndIsOwnerDark = Template.bind({});
BlockedByProjectValidatorForShareAndIsOwnerDark.args = {
  theme: 'Dark',
  ...BlockedByProjectValidatorForShareAndIsOwner.args,
};
