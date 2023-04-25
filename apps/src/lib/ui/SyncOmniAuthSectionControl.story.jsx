import React from 'react';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {
  SyncOmniAuthSectionButton,
  READY,
  IN_PROGRESS,
  SUCCESS,
} from './SyncOmniAuthSectionControl';
import {action} from '@storybook/addon-actions';

export default {
  title: 'SyncOmniAuthSectionButton',
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
};

const TemplateGoogleClassroom = Template.bind({});
TemplateGoogleClassroom.args = {
  provider: OAuthSectionTypes.google_classroom,
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
