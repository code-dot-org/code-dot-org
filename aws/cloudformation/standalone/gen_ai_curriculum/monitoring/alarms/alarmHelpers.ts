export const createJobExecutionMetricStat = (
  metricName: string,
  executionStatus: string | null,
  modelId: string,
  period = 300
) => {
  const dimensions = [
    {Name: 'Environment', Value: 'production'},
    {Name: 'ModelId', Value: modelId},
  ];

  // Include ExecutionStatus only for failure metrics.
  if (executionStatus) {
    dimensions.push({Name: 'ExecutionStatus', Value: executionStatus});
  }

  return {
    MetricStat: {
      Metric: {
        Namespace: 'GenAICurriculum',
        MetricName: metricName,
        Dimensions: dimensions,
      },
      Period: period,
      Stat: 'Sum',
    },
    ReturnData: false,
  };
};

export const createOpenaiSafetyMetricStat = (
  metricName: string,
  attempts: string | null,
  period = 300,
  stat = 'Sum'
) => {
  const dimensions = [
    {Name: 'PromptVersion', Value: 'V0'},
    {Name: 'Environment', Value: 'production'},
  ];

  if (attempts) {
    dimensions.unshift({Name: 'Attempts', Value: attempts});
  }

  return {
    MetricStat: {
      Metric: {
        Namespace: 'GenAICurriculum',
        MetricName: metricName,
        Dimensions: dimensions,
      },
      Period: period,
      Stat: stat,
    },
    ReturnData: false,
  };
};

export const metricsSumExpression = (metrics: { Id: string }[]): string => {
  return `SUM([${metrics.map(m => m.Id).join(",")}])`;
};

// Start(total) jobs metric configuration for a set of models
export const createStartMetricsConfig = (modelIds: string[])  => {
  return modelIds.map((modelId, index) => ({
    Id: `m${index + 1}`,
    ...createJobExecutionMetricStat(
        'AichatRequestChatCompletionJob.Start',
        null,
        modelId
    ),
  }));
}

// Failure job metrics for each model (IDs are indexed to begin one after the total jobs metrics end)
export const createFailureMetricsConfig = (modelIds: string[]) => {
    return modelIds.map((modelId, index) => ({
        Id: `m${index + 1 + modelIds.length}`,
        ...createJobExecutionMetricStat(
            'AichatRequestChatCompletionJob.Finish',
            'FAILURE',
            modelId
        ),
    }));
}
