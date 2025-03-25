import {ComparisonOperator, PutMetricAlarmInput} from "@aws-sdk/client-cloudwatch";

import {
    createFailureMetricsConfig,
    createStartMetricsConfig,
    metricsSumExpression
} from '../alarmHelpers';
import {SL_HANDBOOK_LINK, SNS_TOPIC} from "../../constants";

export const sagemakerModelIds = ['gen-ai-mistral-7b-inst-v01', 'gen-ai-biomistral-7b', 'gen-ai-mistral-pirate-7b', 'gen-ai-karen-creative-mistral-7b', 'gen-ai-arithmo2-mistral-7b'];

const failureMetrics = createFailureMetricsConfig(sagemakerModelIds);
const startMetrics = createStartMetricsConfig(sagemakerModelIds);

export const chatCompletionJobExecutionHighFailureRateSagemakerConfiguration: PutMetricAlarmInput =
    {
        AlarmName: 'genai_chat_completion_job_execution_high_failure_rate_sagemaker',
        AlarmDescription: `Chat completion jobs using Sagemaker are experiencing a high failure rate.
    
*Next Steps*:
- Check the [GenAICurriculum Dashboard](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/GenAICurriculum)
- Check HoneyBadger for **AichatRequestChatCompletionJob** errors
- Check [Student Learning Tips & Tricks](${SL_HANDBOOK_LINK}) for more details.`,
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
                Expression: metricsSumExpression(failureMetrics),
            },
            ...failureMetrics,
            {
                Id: 'total',
                Label: 'total_jobs',
                ReturnData: false,
                Expression: metricsSumExpression(startMetrics),
            },
            ...startMetrics,
        ],
    };
