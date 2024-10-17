import {ComparisonOperator} from '@aws-sdk/client-cloudwatch';

export const openaiLowSuccessRateConfigurations = {
  AlarmName: 'test_script_genai_openai_low_success_rate',
  AlarmDescription: 'test_script_genai_openai_low_success_rate',
  ActionsEnabled: true,
  OKActions: [],
  AlarmActions: ['arn:aws:sns:us-east-1:475661607190:javabuilder-low-urgency'],
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
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatSafety.Openai.Finish',
          Dimensions: [
            {Name: 'Attempts', Value: '1'},
            {Name: 'PromptVersion', Value: 'V0'},
            {Name: 'Environment', Value: 'production'},
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'finish_two_attempt',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatSafety.Openai.Finish',
          Dimensions: [
            {Name: 'Attempts', Value: '2'},
            {Name: 'PromptVersion', Value: 'V0'},
            {Name: 'Environment', Value: 'production'},
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'start',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatSafety.Openai.Start',
          Dimensions: [
            {Name: 'PromptVersion', Value: 'V0'},
            {Name: 'Environment', Value: 'production'},
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
  ],
};
