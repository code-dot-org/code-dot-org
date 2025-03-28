import {
  CloudWatchClient,
  PutMetricAlarmCommand,
} from '@aws-sdk/client-cloudwatch';

import {REGION} from '../constants';

import {
  openaiSafetyHighFailureRateConfiguration,
  chatCompletionJobExecutionHighFailureRateOpenaiConfiguration,
  chatCompletionJobExecutionHighFailureRateSagemakerConfiguration,
  chatCompletionHighBrowserFailureRateConfiguration,
} from './configurations';

// Initialize the CloudWatch client.
const cloudwatch = new CloudWatchClient({region: REGION});

// Array of alarm configurations.
const alarmConfigurations = [
  openaiSafetyHighFailureRateConfiguration,
  chatCompletionJobExecutionHighFailureRateOpenaiConfiguration,
  chatCompletionJobExecutionHighFailureRateSagemakerConfiguration,
  chatCompletionHighBrowserFailureRateConfiguration,
];

const createMetricAlarms = async () => {
  for (const alarmConfig of alarmConfigurations) {
    try {
      const command = new PutMetricAlarmCommand(alarmConfig);
      const response = await cloudwatch.send(command);
      console.log(
        `Alarm ${alarmConfig.AlarmName} created successfully:`,
        response
      );
    } catch (error) {
      console.error(`Error creating alarm ${alarmConfig.AlarmName}: `, error);
    }
  }
};

// Call the function to create the alarms
createMetricAlarms();
