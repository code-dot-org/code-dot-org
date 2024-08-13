import React from 'react';

import ValidationStep, {Status} from './ValidationStep';

export default {
  component: ValidationStep,
};

// Template
const Template = args => <ValidationStep {...args} />;

// Stories

export const SuccessStep = Template.bind({});
SuccessStep.args = {
  stepName: 'This step is successful',
  stepStatus: Status.SUCCEEDED,
};

export const FailStep = Template.bind({});
FailStep.args = {
  stepName: 'This step has failed',
  stepStatus: Status.FAILED,
};

export const FailStepWithExplanation = Template.bind({});
FailStepWithExplanation.args = {
  stepName: 'This step has failed and explains why',
  stepStatus: Status.FAILED,
  children: <p>Explaining why the step failed</p>,
};

export const CelebrateStep = Template.bind({});
CelebrateStep.args = {
  stepName: 'This step is celebrating',
  stepStatus: Status.CELEBRATING,
};

export const WaitingStep = Template.bind({});
WaitingStep.args = {
  stepName: 'This step is waiting',
  stepStatus: Status.WAITING,
};

export const AttemptingStep = Template.bind({});
AttemptingStep.args = {
  stepName: 'This step is attempting',
  stepStatus: Status.ATTEMPTING,
};

export const UnknownStep = Template.bind({});
UnknownStep.args = {
  stepName: 'This step is unknown',
  stepStatus: Status.UNKNOWN,
};

export const AlertStep = Template.bind({});
AlertStep.args = {
  stepName: 'This step is an alert',
  stepStatus: Status.ALERT,
  children: 'Alerts have explanations!',
};
