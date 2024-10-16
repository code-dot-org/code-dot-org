import {
  CloudWatchClient,
  PutMetricAlarmCommand,
} from '@aws-sdk/client-cloudwatch';

import {REGION} from '../constants';

import {openaiLowSuccessRateParams} from './alarmParams';

// Initialize the CloudWatch client
const cloudwatch = new CloudWatchClient({region: REGION});

const createMetricAlarms = async () => {
  // Send the PutMetricAlarmCommand
  try {
    const command = new PutMetricAlarmCommand(openaiLowSuccessRateParams);
    const response = await cloudwatch.send(command);
    console.log('Metric alarms created successfully:', response);
  } catch (error) {
    console.error('Error creating metric alarms:', error);
  }
};

// Call the function to create the alarms
createMetricAlarms();
