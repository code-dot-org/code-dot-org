import {ComparisonOperator, PutMetricAlarmInput} from "@aws-sdk/client-cloudwatch";
import {SNS_TOPIC, SL_HANDBOOK_LINK} from "../../constants";
import {createOpenaiSafetyMetricStat} from "../alarmHelpers";

export const openaiSafetyHighFailureRateConfiguration: PutMetricAlarmInput = {
    AlarmName: 'genai_openai_safety_high_failure_rate',
    AlarmDescription: `OpenAI safety checks are experiencing a high failure rate.

*Next Steps*:
- Check the [GenAICurriculum Dashboard](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/GenAICurriculum)
- Check HoneyBadger for **AichatRequestChatCompletionJob** errors
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
        {
            Id: 'failure_rate',
            Label: 'Failure_rate',
            ReturnData: true,
            Expression: '100 - (finish_one_attempt + finish_two_attempt)/start * 100',
        },
        {
            Id: 'finish_one_attempt',
            ...createOpenaiSafetyMetricStat('AichatSafety.Openai.Finish', '1'),
        },
        {
            Id: 'finish_two_attempt',
            ...createOpenaiSafetyMetricStat('AichatSafety.Openai.Finish', '2'),
        },
        {
            Id: 'start',
            ...createOpenaiSafetyMetricStat('AichatSafety.Openai.Start', null),
        },
    ],
};
