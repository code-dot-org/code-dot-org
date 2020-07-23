import React from 'react';
import ValidationStep, {Status} from './ValidationStep';

export default storybook => {
  return storybook.storiesOf('ValidationStep', module).addStoryTable([
    {
      name: 'Succeeded Step',
      description: 'Step in success state',
      story: () => (
        <ValidationStep
          stepName="This step is successful"
          stepStatus={Status.SUCCEEDED}
        />
      )
    },
    {
      name: 'Failed Step',
      description: 'Step in failed state',
      story: () => (
        <ValidationStep
          stepName="This step has failed"
          stepStatus={Status.FAILED}
        />
      )
    },
    {
      name: 'Failed Step with Explanation',
      description: 'Step in failed state with explanation showing',
      story: () => (
        <ValidationStep
          stepName="This step has failed"
          stepStatus={Status.FAILED}
        >
          Here is an explanation of why this step failed.
        </ValidationStep>
      )
    },
    {
      name: 'Celebrating Step',
      description: 'Step in celebrating state',
      story: () => (
        <ValidationStep
          stepName="This step is celebrating"
          stepStatus={Status.CELEBRATING}
        />
      )
    },
    {
      name: 'Waiting Step',
      description: 'Step in waiting state',
      story: () => (
        <ValidationStep
          stepName="This step is waiting"
          stepStatus={Status.WAITING}
        />
      )
    },
    {
      name: 'Attempting Step',
      description: 'Step in attempting state',
      story: () => (
        <ValidationStep
          stepName="This step is attempting"
          stepStatus={Status.ATTEMPTING}
        />
      )
    },
    {
      name: 'Unknown Step',
      description: 'Step in unknown state',
      story: () => (
        <ValidationStep
          stepName="This step is unknown"
          stepStatus={Status.UNKNOWN}
        />
      )
    },
    {
      name: 'Alert Step',
      description: 'Step in alert state',
      story: () => (
        <ValidationStep stepName="This is an alert" stepStatus={Status.ALERT}>
          Alerts have explanations!
        </ValidationStep>
      )
    }
  ]);
};
