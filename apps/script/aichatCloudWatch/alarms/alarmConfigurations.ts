import {ComparisonOperator} from '@aws-sdk/client-cloudwatch';

import modelDescriptions from '../../../static/aichat/modelDescriptions.json';
import {SNS_TOPIC} from '../constants';

import {
  createJobExecutionMetricStat,
  createOpenaiMetricStat,
} from './alarmHelpers';

const modelIds = modelDescriptions.map((model: {id: string}) => model.id);

export const openaiLowSuccessRateConfiguration = {
  AlarmName: 'test_script_genai_openai_low_success_rate',
  AlarmDescription: 'test_script_genai_openai_low_success_rate',
  ActionsEnabled: true,
  OKActions: [],
  AlarmActions: [SNS_TOPIC],
  InsufficientDataActions: [],
  EvaluationPeriods: 5,
  DatapointsToAlarm: 5,
  Threshold: 90,
  ComparisonOperator: ComparisonOperator.LessThanThreshold,
  TreatMissingData: 'missing',
  Metrics: [
    {
      Id: 'success_rate',
      Label: 'Success_rate',
      ReturnData: true,
      Expression: '(finish_one_attempt + finish_two_attempt)/start * 100',
    },
    {
      Id: 'finish_one_attempt',
      ...createOpenaiMetricStat('AichatSafety.Openai.Finish', '1'),
    },
    {
      Id: 'finish_two_attempt',
      ...createOpenaiMetricStat('AichatSafety.Openai.Finish', '2'),
    },
    {
      Id: 'start',
      ...createOpenaiMetricStat('AichatSafety.Openai.Start', null),
    },
  ],
};

// Start(total) jobs metrics for each model (m1,...,m5).
const startMetrics = modelIds.map((modelId, index) => ({
  Id: `m${index + 1}`,
  ...createJobExecutionMetricStat(
    'AichatRequestChatCompletionJob.Start',
    null,
    modelId
  ),
}));

// Failure job metrics for each model (m6,...,m10).
const failureMetrics = modelIds.map((modelId, index) => ({
  Id: `m${index + 6}`,
  ...createJobExecutionMetricStat(
    'AichatRequestChatCompletionJob.Finish',
    'FAILURE',
    modelId
  ),
}));

export const highChatCompletionJobExecutionFailureRateConfiguration = {
  AlarmName: 'test_script_high_chat_completion_job_execution_failure_rate',
  AlarmDescription: 'test_high_chat_completion_job_execution_failure_rate',
  ActionsEnabled: true,
  OKActions: [],
  AlarmActions: [SNS_TOPIC],
  InsufficientDataActions: [],
  EvaluationPeriods: 5,
  DatapointsToAlarm: 5,
  Threshold: 10,
  ComparisonOperator: ComparisonOperator.GreaterThanThreshold,
  TreatMissingData: 'missing',
  Metrics: [
    {
      Id: 'failure_rate',
      Label: 'failure_rate',
      ReturnData: true,
      Expression: '100*(failures/total)',
    },
    {
      Id: 'failures',
      Label: 'failures',
      ReturnData: false,
      Expression: 'SUM([m6, m7, m8, m9, m10])',
    },
    ...failureMetrics,
    {
      Id: 'total',
      Label: 'total_jobs',
      ReturnData: false,
      Expression: 'SUM([m1, m2, m3, m4, m5])',
    },
    ...startMetrics,
  ],
};
