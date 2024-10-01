import {action} from '@storybook/addon-actions';
import React from 'react';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

import {
  SyncOmniAuthSectionButton,
  READY,
  IN_PROGRESS,
  SUCCESS,
  DISABLED,
} from './SyncOmniAuthSectionControl';

export default {
  component: SyncOmniAuthSectionButton,
};

//
// TEMPLATE
//

const Template = args => (
  <SyncOmniAuthSectionButton onClick={action('click')} {...args} />
);

const TemplateClever = Template.bind({});
TemplateClever.args = {
  provider: OAuthSectionTypes.clever,
  providerName: 'Clever',
};

const TemplateGoogleClassroom = Template.bind({});
TemplateGoogleClassroom.args = {
  provider: OAuthSectionTypes.google_classroom,
  providerName: 'Google Classroom',
};

const TemplateLti = Template.bind({});
TemplateLti.args = {
  provider: SectionLoginType.lti_v1,
  providerName: 'Canvas',
};

//
// STORIES
//

export const SyncCleverReady = Template.bind({});
SyncCleverReady.args = {
  ...TemplateClever.args,
  buttonState: READY,
};

export const SyncGoogleClassroomReady = Template.bind({});
SyncGoogleClassroomReady.args = {
  ...TemplateGoogleClassroom.args,
  buttonState: READY,
};

export const SyncLtiReady = Template.bind({});
SyncLtiReady.args = {
  ...TemplateLti.args,
  buttonState: READY,
};

export const SyncCleverInProgress = Template.bind({});
SyncCleverInProgress.args = {
  ...TemplateClever.args,
  buttonState: IN_PROGRESS,
};

export const SyncGoogleClassroomInProgress = Template.bind({});
SyncGoogleClassroomInProgress.args = {
  ...TemplateGoogleClassroom.args,
  buttonState: IN_PROGRESS,
};
export const SyncLtiInProgress = Template.bind({});
SyncLtiInProgress.args = {
  ...TemplateLti.args,
  buttonState: IN_PROGRESS,
};

export const SyncCleverSuccess = Template.bind({});
SyncCleverSuccess.args = {
  ...TemplateClever.args,
  buttonState: SUCCESS,
};

export const SyncGoogleClassroomSuccess = Template.bind({});
SyncGoogleClassroomSuccess.args = {
  ...TemplateGoogleClassroom.args,
  buttonState: SUCCESS,
};
export const SyncLtiSuccess = Template.bind({});
SyncLtiSuccess.args = {
  ...TemplateLti.args,
  buttonState: SUCCESS,
};

export const SyncLtiDisabled = Template.bind({});
SyncLtiDisabled.args = {
  ...TemplateLti.args,
  buttonState: 'disabled',
  syncEnabled: DISABLED,
};
