// Helper function to create metric stat
export const createExecutionJobMetricStat = (
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

export const createOpenaiMetricStat = (
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
