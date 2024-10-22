import {
  ExpressionMetric,
  Widget,
  WidgetMetric,
  WidgetProperties,
} from 'cloudwatch-dashboard-types';

import {AiRequestExecutionStatus} from '../../../../../../apps/generated-scripts/sharedConstants';
import {getTypedKeys} from '../../../../../../apps/src/types/utils';
import {
  BROWSER_COLORS,
  commonGraphProps,
  COUNT_COLOR,
  ENDPOINT_VARIANT,
  ERROR_COLOR,
  LATENCY_GAUGE_MAX_SECONDS,
  MODEL_COLORS,
  REGION,
  STATUS_COLORS,
  WARNING_COLOR,
} from '../constants';

export function createTitleWidget(title: string, level: 'h1' | 'h2'): Widget {
  return createMarkdownWidget(`${level === 'h1' ? '#' : '##'} **${title}**`);
}

export function createMarkdownWidget(
  markdown: string,
  width = 24,
  height = 1
): Widget {
  return {
    type: 'text',
    width,
    height,
    properties: {
      markdown,
    },
  };
}

export function createLatencyComparisonGraph(
  models: {name: string; id: string}[],
  environment: string,
  view: 'timeSeries' | 'gauge' = 'timeSeries',
  dimensions?: {width: number; height: number}
): Widget {
  return {
    ...commonGraphProps,
    ...(dimensions || {}),
    properties: {
      region: REGION,
      title: 'Model Latency by Model',
      metrics: models.map<WidgetMetric>(({name, id}) => [
        'AWS/SageMaker',
        'ModelLatency',
        'EndpointName',
        id + '-' + environment,
        'VariantName',
        ENDPOINT_VARIANT,
        {label: name, color: MODEL_COLORS[id]},
      ]),
      view,
      setPeriodToTimeRange: true,
      ...(view === 'gauge' && {
        yAxis: {
          left: {min: 0, max: LATENCY_GAUGE_MAX_SECONDS * Math.pow(10, 6)}, // convert to microseconds
        },
      }),
    },
  } as Widget; // needed for setPeriodToTimeRange
}

export function createActiveJobGraph(environment: string): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: 'Active Job Latency',
      metrics: ['TotalTime', 'ExecutionTime', 'WaitTime'].map(metric => [
        'code-dot-org/ActiveJob',
        metric,
        'JobName',
        'AichatRequestChatCompletionJob',
        'Environment',
        environment,
      ]),
    },
  };
}

export function createBrowserLatencyComparisonGraph(
  browsers: string[],
  environment: string,
  view: 'timeSeries' | 'gauge' = 'timeSeries',
  dimensions?: {width: number; height: number}
): Widget {
  return {
    ...commonGraphProps,
    ...(dimensions || {}),
    properties: {
      region: REGION,
      title: 'Chat Request Latency by Browser',
      metrics: browsers
        .map<WidgetMetric[]>((browser, i) => [
          [
            {
              expression: getLatencySearch(environment, browser),
              id: `e${i + 1}`,
              visible: false,
            },
          ],
          [
            {
              expression: `SUM(e${i + 1})/DATAPOINT_COUNT(e${i + 1})`,
              label: browser,
              color: BROWSER_COLORS[browser],
            },
          ],
        ])
        .flat(),
      view,
      setPeriodToTimeRange: true,
      ...(view === 'gauge' && {
        yAxis: {
          left: {min: 0, max: LATENCY_GAUGE_MAX_SECONDS * Math.pow(10, 3)}, // convert to milliseconds
        },
      }),
    },
  } as Widget; // needed for setPeriodToTimeRange
}

export function createBrowserLatencyByModelGraph(
  models: {name: string; id: string}[],
  environment: string,
  browser?: string
): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: `Chat Request Latency by Model - ${browser || 'All Browsers'}`,
      metrics: models
        .map<WidgetMetric[]>(({name, id}, i) => [
          [
            {
              expression: getLatencySearch(environment, browser, id),
              id: `e${i + 1}`,
              visible: false,
            },
          ],
          [
            {
              expression: `SUM(e${i + 1})/DATAPOINT_COUNT(e${i + 1})`,
              label: name,
              color: MODEL_COLORS[id],
            },
          ],
        ])
        .flat(),
    },
  };
}

function getLatencySearch(
  environment: string,
  browser?: string,
  model?: string
) {
  return `SEARCH('{${environment}-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} AppName="aichat" ${
    browser ? `Browser="${browser}"` : ''
  } ${
    model ? `ModelId="${model}"` : ''
  } MetricName="AichatModelResponseTime"', 'Average', 300)`;
}

export function createBrowserChatPerformanceGraph(
  environment: string,
  browser?: string
): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: `Chat Completion Performance - ${browser || 'All Browsers'}`,
      metrics: [
        [
          {
            expression: getBrowserMetricSearch(
              'ChatCompletionRequestInitiated',
              environment,
              browser
            ),
            id: `e1${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: getBrowserMetricSearch(
              'ChatCompletionErrorUnhandled',
              environment,
              browser
            ),
            id: `e2${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: getBrowserMetricSearch(
              'ChatCompletionErrorRateLimited',
              environment,
              browser
            ),
            id: `e3${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: `SUM(e1${browser})`,
            label: `Request Count`,
            color: COUNT_COLOR,
          },
        ],
        [
          {
            expression: `SUM(e2${browser})/SUM(e1${browser}) * 100`,
            label: `Error Rate (%)`,
            yAxis: 'right',
            color: ERROR_COLOR,
          },
        ],
        [
          {
            expression: `SUM(e3${browser})/SUM(e1${browser}) * 100`,
            label: `Rate Limited (%)`,
            yAxis: 'right',
            color: WARNING_COLOR,
          },
        ] as unknown as ExpressionMetric,
      ] as WidgetMetric[],
      yAxis: {
        right: {label: '%', showUnits: false, min: 0, max: 100},
        left: {label: 'Count', showUnits: false},
      },
    },
  };
}

export function createBrowserSavePerformanceGraph(
  environment: string,
  browser?: string
): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: `Save/Update Performance - ${browser || 'All Browsers'}`,
      metrics: [
        [
          {
            expression: getBrowserMetricSearch(
              'SaveStarted',
              environment,
              browser
            ),
            id: `e1${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: getBrowserMetricSearch(
              'SaveFailError',
              environment,
              browser
            ),
            id: `e2${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: getBrowserMetricSearch(
              'SaveFailToxicityDetected',
              environment,
              browser
            ),
            id: `e3${browser}`,
            visible: false,
          },
        ],
        [
          {
            expression: `SUM(e1${browser})`,
            label: `Save/Update Count`,
            color: COUNT_COLOR,
          },
        ],
        [
          {
            expression: `SUM(e2${browser})/SUM(e1${browser}) * 100`,
            label: `Error Rate (%)`,
            yAxis: 'right',
            color: ERROR_COLOR,
          },
        ],
        [
          {
            expression: `SUM(e3${browser})/SUM(e1${browser}) * 100`,
            label: `Toxicity Detected (%)`,
            yAxis: 'right',
            color: WARNING_COLOR,
          },
        ] as unknown as ExpressionMetric,
      ] as WidgetMetric[],
      yAxis: {
        right: {label: '%', showUnits: false, min: 0, max: 100},
        left: {label: 'Count', showUnits: false},
      },
    },
  };
}

function getBrowserMetricSearch(
  metric: string,
  environment: string,
  browser?: string
) {
  return `SEARCH('{${environment}-browser-metrics,AppName,Browser,BrowserVersion,Hostname} AppName=\"aichat\" ${
    browser ? `Browser=\"${browser}\"` : ''
  } MetricName=\"Aichat.${metric}\"', 'Sum', 300)`;
}

export function createJobPerformanceGraph(environment: string): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: 'Execution Performance - All Models',
      metrics: [
        [
          {
            expression: `SEARCH('{GenAICurriculum,Environment,ModelId} Environment=\"${environment}\" MetricName=\"AichatRequestChatCompletionJob.Start\"', 'Sum', 300)`,
            id: 'e1',
            visible: false,
          },
        ],
        [
          {
            expression: `SEARCH('{GenAICurriculum,Environment,ExecutionStatus,ModelId} Environment=\"${environment}\" ExecutionStatus=\"FAILURE\"', 'Sum', 300)`,
            id: 'e2',
            visible: false,
          },
        ],
        [
          {
            expression: 'SUM(e1)',
            label: 'Executions',
            color: COUNT_COLOR,
          },
        ],
        [
          {
            expression: 'SUM(e2)/SUM(e1) * 100',
            label: 'Failure Rate (%)',
            yAxis: 'right',
            color: ERROR_COLOR,
          },
        ] as unknown as ExpressionMetric, // needed for yAxis (TS issue)
      ] as WidgetMetric[],
      yAxis: {
        right: {min: 0, max: 100, label: '%', showUnits: false},
        left: {label: 'Count', showUnits: false},
      },
    },
  };
}

export function createExecutionCountGraph(
  models: {name: string; id: string}[],
  environment: string,
  dimensions?: {width: number; height: number}
): Widget {
  return {
    ...commonGraphProps,
    ...(dimensions || {}),
    properties: {
      region: REGION,
      title: 'Total Executions by Model',
      metrics: models.map<WidgetMetric>(({name, id}) => [
        'GenAICurriculum',
        'AichatRequestChatCompletionJob.Start',
        'Environment',
        environment,
        'ModelId',
        id,
        {label: name, color: MODEL_COLORS[id]},
      ]),
      view: 'singleValue',
      stat: 'Sum',
      setPeriodToTimeRange: true,
    } as WidgetProperties,
  };
}

export function createJobExecutionGraph(
  modelId: string,
  environment: string,
  dimensions?: {width: number; height: number}
): Widget {
  const namespace = 'GenAICurriculum';
  const prefix = 'AichatRequestChatCompletionJob';
  const endStatuses = getTypedKeys(AiRequestExecutionStatus).filter(
    status =>
      AiRequestExecutionStatus[status] > AiRequestExecutionStatus.SUCCESS
  );

  return {
    ...commonGraphProps,
    ...(dimensions || {}),
    properties: {
      region: REGION,
      title: 'Job Executions',
      metrics: [
        [
          namespace,
          `${prefix}.Start`,
          'Environment',
          environment,
          'ModelId',
          modelId,
          {id: 'm0', label: 'Executions', color: COUNT_COLOR},
        ],
        ...endStatuses.map<WidgetMetric>((status, i) => [
          namespace,
          `${prefix}.Finish`,
          'ExecutionStatus',
          status,
          'Environment',
          environment,
          'ModelId',
          modelId,
          {visible: false, id: `m${i + 1}`},
        ]),
        ...endStatuses.map<WidgetMetric>((status, i) => [
          {
            expression: `m${i + 1}/m0 * 100`,
            label: `${status} %`,
            yAxis: 'right',
            color: STATUS_COLORS[status],
          },
        ]),
      ],
      stat: 'Sum',
      yAxis: {right: {min: 0, max: 100, label: '%', showUnits: false}},
    },
  };
}

export function createInvocationGraph(
  modelId: string,
  environment: string
): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: 'Invocations',
      metrics: [
        'Invocations',
        'InvocationsPerInstance',
        'ConcurrentRequestsPerModel',
      ].map(metric => [
        'AWS/SageMaker',
        metric,
        'EndpointName',
        modelId + '-' + environment,
        'VariantName',
        ENDPOINT_VARIANT,
      ]),
      stat: 'Sum',
    },
  };
}

export function createInvocationErrorGraph(
  modelId: string,
  environment: string
): Widget {
  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: 'Invocation Errors',
      metrics: [
        'InvocationModelErrors',
        'Invocation5XXErrors',
        'Invocation4XXErrors',
      ].map(metric => [
        'AWS/SageMaker',
        metric,
        'EndpointName',
        modelId + '-' + environment,
        'VariantName',
        ENDPOINT_VARIANT,
      ]),
      stat: 'Sum',
    },
  };
}

export function createUtilizationGraph(
  modelId: string,
  environment: string
): Widget {
  const metrics = [
    'DiskUtilization',
    'MemoryUtilization',
    'CPUUtilization',
    'GPUUtilization',
    'GPUMemoryUtilization',
  ];

  return {
    ...commonGraphProps,
    properties: {
      region: REGION,
      title: 'Utilization',
      metrics: metrics.map(metric => [
        '/aws/sagemaker/Endpoints',
        metric,
        'EndpointName',
        modelId + '-' + environment,
        'VariantName',
        ENDPOINT_VARIANT,
      ]),
      yAxis: {left: {min: 0, max: 100}},
    },
  };
}

export function createLatencyGraph(
  modelId: string,
  environment: string,
  view: 'singleValue' | 'timeSeries' = 'timeSeries',
  dimensions?: {width: number; height: number}
): Widget {
  const latencyMetrics: WidgetMetric[] = [];
  ['ModelLatency', 'OverheadLatency'].forEach((metric, i) => {
    latencyMetrics.push([
      'AWS/SageMaker',
      metric,
      'EndpointName',
      modelId + '-' + environment,
      'VariantName',
      ENDPOINT_VARIANT,
      {id: `m${i + 1}`, visible: false},
    ]);
    latencyMetrics.push([
      {
        expression: `m${i + 1} / 1000000`,
        label: metric,
      },
    ]);
  });

  return {
    ...commonGraphProps,
    ...(dimensions || {}),
    properties: {
      region: REGION,
      title: `${view === 'singleValue' ? 'Average ' : ''}Latency`,
      metrics: [
        [
          'GenAICurriculum',
          'AichatRequestChatCompletionJob.ExecutionTime',
          'Environment',
          environment,
          'ModelId',
          modelId,
          {label: 'Job Execution Time'},
        ],
        ...['1', '2'].map<WidgetMetric>(attempt => [
          'GenAICurriculum',
          'AichatSafety.Openai.Latency',
          'Attempts',
          attempt,
          'PromptVersion',
          'V0',
          'Environment',
          environment,
          {label: `OpenAI Latency (${attempt} attempt(s))`},
        ]),
        ...latencyMetrics,
      ],
      yAxis: {left: {label: 'Seconds', showUnits: false}},
      view,
      ...{setPeriodToTimeRange: true},
    },
  };
}

export function createLogTable(
  type: 'error' | 'warning',
  environment: string
): Widget {
  const level = type === 'error' ? 'SEVERE' : 'WARNING';
  const key = type === 'error' ? 'errorMessage' : 'message';
  return {
    height: 6,
    width: 9,
    type: 'log',
    properties: {
      region: REGION,
      query: `SOURCE '${environment}-browser-events' | fields @message\n| filter level = \"${level}\" and message.appName = 'aichat'\n| stats count(*) as count by message.${key} as ${type}\n| display ${type}, count\n| sort by count desc`,
      title: `${type}s by type`,
      view: 'table',
    },
  };
}
