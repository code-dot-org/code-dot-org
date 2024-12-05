import {
  ComparisonOperator,
  PutMetricAlarmInput,
} from '@aws-sdk/client-cloudwatch';

// TODO: Replace with dependency on shared_constants.rb.
import modelDescriptions from '../../../../../../apps/static/aichat/modelDescriptions.json';
import {BROWSERS, SNS_TOPIC} from '../constants';

import {
  createJobExecutionMetricStat,
  createOpenaiMetricStat,
} from './alarmHelpers';

const modelIds = modelDescriptions.map((model: {id: string}) => model.id);

export const openaiSafetyHighFailureRateConfiguration: PutMetricAlarmInput = {
  AlarmName: 'genai_openai_safety_high_failure_rate',
  AlarmDescription:
    'Alarms when OpenAI safety checks are experiencing a high failure rate.',
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
      Label: 'Failure_rate',
      ReturnData: true,
      Expression: '100 - (finish_one_attempt + finish_two_attempt)/start * 100',
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

export const chatCompletionJobExecutionHighFailureRateConfiguration: PutMetricAlarmInput =
  {
    AlarmName: 'genai_chat_completion_job_execution_high_failure_rate',
    AlarmDescription:
      'Alarms when chat completion jobs are experiencing a high failure rate.',
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

const browserIndices = BROWSERS.map((_, i) => i + 1);

// TODO: Unify this code with dashboard metrics if possible
export const chatCompletionHighBrowserFailureRateConfiguration: PutMetricAlarmInput =
  {
    AlarmName: 'genai_chat_completion_high_browser_failure_rate',
    AlarmDescription:
      'Alarms when browser are experiencing a high failure rate attempting chat completion requests.',
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
      ...['ChatCompletionRequestInitiated', 'ChatCompletionErrorUnhandled']
        .map((metric, i) =>
          BROWSERS.map((browser, j) => ({
            Id: `m${i + 1}${j + 1}`,
            MetricStat: {
              Metric: {
                Namespace: 'production-browser-metrics',
                MetricName: `Aichat.${metric}`,
                Dimensions: [
                  {
                    Name: 'Hostname',
                    Value: 'studio.code.org',
                  },
                  {
                    Name: 'AppName',
                    Value: 'aichat',
                  },
                  {
                    Name: 'Browser',
                    Value: browser,
                  },
                ],
              },
              Period: 300,
              Stat: 'Sum',
            },
            ReturnData: false,
          }))
        )
        .flat(),
      {
        Expression: browserIndices.map(i => `m1${i}`).join('+'),
        Label: 'Request Count',
        Id: 'e1',
        ReturnData: false,
      },
      {
        Expression: `(${browserIndices.map(i => `m2${i}`).join('+')})/e1 * 100`,
        Label: 'Error Rate (%)',
        Id: 'e2',
        ReturnData: true,
      },
    ],
  };
