import React from 'react';
import ValidateStep, {Status} from './ValidateStep';

export default storybook => {
  return storybook
    .storiesOf('ValidateStep', module)
    .addStoryTable([
      {
        name: 'Succeeded Step',
        description: 'Step in success state',
        story: () => (
          <ValidateStep
            stepName="This step is successful"
            stepStatus={Status.SUCCEEDED}
          />
        )
      },
      {
        name: 'Failed Step',
        description: 'Step in failed state',
        story: () => (
          <ValidateStep
            stepName="This step has failed"
            stepStatus={Status.FAILED}
          />
        )
      },
      {
        name: 'Failed Step with Explanation',
        description: 'Step in failed state with explanation showing',
        story: () => (
          <ValidateStep
            stepName="This step has failed"
            stepStatus={Status.FAILED}
          >
            Here is an explanation of why this step failed.
          </ValidateStep>
        )
      },
      {
        name: 'Celebrating Step',
        description: 'Step in celebrating state',
        story: () => (
          <ValidateStep
            stepName="This step is celebrating"
            stepStatus={Status.CELEBRATING}
          />
        )
      },
      {
        name: 'Hidden Step',
        description: 'Step in hidden state',
        story: () => (
          <ValidateStep
            stepName="This step is hidden"
            stepStatus={Status.HIDDEN}
          />
        )
      },
      {
        name: 'Waiting Step',
        description: 'Step in waiting state',
        story: () => (
          <ValidateStep
            stepName="This step is waiting"
            stepStatus={Status.WAITING}
          />
        )
      },
      {
        name: 'Attempting Step',
        description: 'Step in attempting state',
        story: () => (
          <ValidateStep
            stepName="This step is attempting"
            stepStatus={Status.ATTEMPTING}
          />
        )
      },
      {
        name: 'Unknown Step',
        description: 'Step in unknown state',
        story: () => (
          <ValidateStep
            stepName="This step is unknown"
            stepStatus={Status.UNKNOWN}
          />
        )
      },
    ]);
};
