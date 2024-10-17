import {ComparisonOperator} from '@aws-sdk/client-cloudwatch';

export const openaiLowSuccessRateConfiguration = {
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

export const highChatCompletionJobExecutionFailureRateConfiguration = {
  AlarmName: 'test_script_high_chat_completion_job_execution_failure_rate',
  AlarmDescription: 'test_high_chat_completion_job_execution_failure_rate',
  ActionsEnabled: true,
  OKActions: [],
  AlarmActions: ['arn:aws:sns:us-east-1:475661607190:javabuilder-low-urgency'],
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
    {
      Id: 'm6',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Finish',
          Dimensions: [
            {
              Name: 'ExecutionStatus',
              Value: 'FAILURE',
            },
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-karen-creative-mistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm7',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Finish',
          Dimensions: [
            {
              Name: 'ExecutionStatus',
              Value: 'FAILURE',
            },
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-mistral-7b-inst-v01',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm8',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Finish',
          Dimensions: [
            {
              Name: 'ExecutionStatus',
              Value: 'FAILURE',
            },
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-biomistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm9',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Finish',
          Dimensions: [
            {
              Name: 'ExecutionStatus',
              Value: 'FAILURE',
            },
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-arithmo2-mistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm10',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Finish',
          Dimensions: [
            {
              Name: 'ExecutionStatus',
              Value: 'FAILURE',
            },
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-mistral-pirate-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'total',
      Label: 'total_jobs',
      ReturnData: false,
      Expression: 'SUM([m1, m2, m3, m4, m5])',
    },
    {
      Id: 'm1',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Start',
          Dimensions: [
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-mistral-pirate-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm2',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Start',
          Dimensions: [
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-arithmo2-mistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm3',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Start',
          Dimensions: [
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-karen-creative-mistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm4',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Start',
          Dimensions: [
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-biomistral-7b',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
    {
      Id: 'm5',
      ReturnData: false,
      MetricStat: {
        Metric: {
          Namespace: 'GenAICurriculum',
          MetricName: 'AichatRequestChatCompletionJob.Start',
          Dimensions: [
            {
              Name: 'Environment',
              Value: 'production',
            },
            {
              Name: 'ModelId',
              Value: 'gen-ai-mistral-7b-inst-v01',
            },
          ],
        },
        Period: 300,
        Stat: 'Sum',
      },
    },
  ],
};
