import {ComparisonOperator, PutMetricAlarmInput} from "@aws-sdk/client-cloudwatch";

import {BROWSERS, SL_HANDBOOK_LINK, SNS_TOPIC} from "../../constants";

const browserIndices = BROWSERS.map((_, i) => i + 1);

// TODO: Unify this code with dashboard metrics if possible
export const chatCompletionHighBrowserFailureRateConfiguration: PutMetricAlarmInput =
    {
        AlarmName: 'genai_chat_completion_high_browser_failure_rate',
        AlarmDescription: `Browsers are experiencing a high failure rate attempting chat completion requests.

*Next Steps:*
- Check the [GenAICurriculum Dashboard](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/GenAICurriculum)
- Check [browser logs](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/production-browser-events/log-events/production) in Cloudwatch (filter by **appName: 'aichat'**)
- If chat completion job failure rates and/or OpenAI failure rates are also elevated, check HoneyBadger for **AichatRequestChatCompletionJob** errors.
- If not, this is likely a browser-specific and/or ActiveJob related issue. Check the [ActiveJob dashboard](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/ActiveJob_DelayedJob).
- Check [Student Learning Tips & Tricks](${SL_HANDBOOK_LINK}) for more details.`,
        ActionsEnabled: true,
        OKActions: [],
        AlarmActions: [SNS_TOPIC],
        InsufficientDataActions: [],
        EvaluationPeriods: 3,
        DatapointsToAlarm: 3,
        Threshold: 10,
        ComparisonOperator: ComparisonOperator.GreaterThanThreshold,
        TreatMissingData: 'ignore',
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
