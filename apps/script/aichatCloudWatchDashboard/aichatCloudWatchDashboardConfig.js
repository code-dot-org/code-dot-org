const {
  modelNames,
  headerWidgetConfig,
  crossModelWidgetsConfig,
} = require('./constants');

const getModelSpecificConfig = modelName => [
  {
    width: 24,
    height: 1,
    type: 'text',
    properties: {
      markdown: `## **${modelName}**`,
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          '/aws/sagemaker/Endpoints',
          'CPUUtilization',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          {
            region: 'us-east-1',
          },
        ],
      ],
      region: 'us-east-1',
      title: `CPU Utilization - ${modelName}`,
      period: 300,
      yAxis: {
        left: {
          min: 0,
          max: 100,
        },
      },
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          '/aws/sagemaker/Endpoints',
          'GPUUtilization',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          {
            region: 'us-east-1',
          },
        ],
        [
          '.',
          'GPUMemoryUtilization',
          '.',
          '.',
          '.',
          '.',
          {
            region: 'us-east-1',
          },
        ],
      ],
      region: 'us-east-1',
      period: 300,
      title: `GPU Utilization - ${modelName}`,
      yAxis: {
        left: {
          min: 0,
          max: 100,
        },
      },
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          '/aws/sagemaker/Endpoints',
          'DiskUtilization',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          {
            region: 'us-east-1',
          },
        ],
        [
          '.',
          'MemoryUtilization',
          '.',
          '.',
          '.',
          '.',
          {
            region: 'us-east-1',
          },
        ],
      ],
      region: 'us-east-1',
      title: `Memory & Disk Utilization - ${modelName}`,
      period: 300,
      yAxis: {
        left: {
          min: 0,
          max: 100,
          label: '',
        },
      },
    },
  },
  {
    type: 'metric',
    properties: {
      metrics: [
        [
          'AWS/SageMaker',
          'Invocations',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          'EndpointConfigName',
          `${modelName}`,
          {
            region: 'us-east-1',
          },
        ],
        [
          '.',
          'InvocationsPerInstance',
          '.',
          '.',
          '.',
          '.',
          {
            region: 'us-east-1',
          },
        ],
      ],
      view: 'timeSeries',
      stacked: false,
      region: 'us-east-1',
      title: `Invocations - ${modelName}`,
      period: 300,
      stat: 'Sum',
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          'AWS/SageMaker',
          'ModelLatency',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          'EndpointConfigName',
          `${modelName}`,
          {
            region: 'us-east-1',
          },
        ],
        ['.', 'OverheadLatency', '.', '.', '.', '.'],
      ],
      region: 'us-east-1',
      title: `Latency - ${modelName}`,
      period: 300,
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          'AWS/SageMaker',
          'InvocationModelErrors',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
          'EndpointConfigName',
          `${modelName}`,
        ],
        ['.', 'Invocation5XXErrors', '.', '.', '.', '.', '.', '.'],
        ['.', 'Invocation4XXErrors', '.', '.', '.', '.', '.', '.'],
      ],
      region: 'us-east-1',
      title: `Invocation Errors - ${modelName}`,
    },
  },
  {
    type: 'metric',
    properties: {
      view: 'singleValue',
      stacked: false,
      metrics: [
        [
          'AWS/SageMaker',
          'OverheadLatency',
          'EndpointName',
          `${modelName}`,
          'VariantName',
          'AllTraffic',
        ],
        ['.', 'ModelLatency', '.', '.', '.', '.'],
      ],
      region: 'us-east-1',
      setPeriodToTimeRange: true,
      sparkline: false,
      trend: false,
      title: 'Average Latency',
    },
  },
];

const dashboardConfig = {
  widgets: [
    headerWidgetConfig,
    ...crossModelWidgetsConfig,
    ...modelNames.map(getModelSpecificConfig).flat(),
  ],
};

module.exports = dashboardConfig;
