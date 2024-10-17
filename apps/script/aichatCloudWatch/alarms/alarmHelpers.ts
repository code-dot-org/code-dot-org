// Helper function to create metric stat
export const createMetricStat = (
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
