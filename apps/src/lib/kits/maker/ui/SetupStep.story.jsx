import React from 'react';
import SetupStep, {
  FAILED,
  SUCCEEDED,
  ATTEMPTING,
  WAITING,
  CELEBRATING,
  HIDDEN,
  UNKNOWN
} from './SetupStep';

export default storybook => {
  return storybook
    .storiesOf('SetupStep', module)
    .addStoryTable([
      {
        name: 'Succeeded Step',
        description: 'Step in success state',
        story: () => (
          <SetupStep
            stepName="This step is successful"
            stepStatus={SUCCEEDED}
          />
        )
      },
      {
        name: 'Failed Step',
        description: 'Step in failed state',
        story: () => (
          <SetupStep
            stepName="This step has failed"
            stepStatus={FAILED}
          />
        )
      },
      {
        name: 'Failed Step with Explanation',
        description: 'Step in failed state with explanation showing',
        story: () => (
          <SetupStep
            stepName="This step has failed"
            stepStatus={FAILED}
          >
            Here is an explanation of why this step failed.
          </SetupStep>
        )
      },
      {
        name: 'Celebrating Step',
        description: 'Step in celebrating state',
        story: () => (
          <SetupStep
            stepName="This step is celebrating"
            stepStatus={CELEBRATING}
          />
        )
      },
      {
        name: 'Hidden Step',
        description: 'Step in hidden state',
        story: () => (
          <SetupStep
            stepName="This step is hidden"
            stepStatus={HIDDEN}
          />
        )
      },
      {
        name: 'Waiting Step',
        description: 'Step in waiting state',
        story: () => (
          <SetupStep
            stepName="This step is waiting"
            stepStatus={WAITING}
          />
        )
      },
      {
        name: 'Attempting Step',
        description: 'Step in attempting state',
        story: () => (
          <SetupStep
            stepName="This step is attempting"
            stepStatus={ATTEMPTING}
          />
        )
      },
      {
        name: 'UNKNOWN Step',
        description: 'Step in unknown state',
        story: () => (
          <SetupStep
            stepName="This step is unknown"
            stepStatus={UNKNOWN}
          />
        )
      },
    ]);
};
