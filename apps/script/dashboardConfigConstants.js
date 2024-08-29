const modelNames = [
  'gen-ai-mistral-7b-inst-v01',
  'gen-ai-arithmo2-mistral-7b',
  'gen-ai-biomistral-7b',
  'gen-ai-karen-creative-mistral-7b',
  'gen-ai-mistral-pirate-7b',
];

const headerWidgetConfig = {
  height: 2,
  width: 24,
  y: 0,
  x: 0,
  type: 'text',
  properties: {
    markdown:
      '# Model Metrics\n*[Metrics Descriptions](https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-cloudwatch.html#cloudwatch-metrics-jobs)*',
  },
};

// Note that the second widget here still has some hard coded model names in it.
// This could probably be adjusted to accommodate parameterized model names in the future.
const crossModelWidgetsConfig = [
  {
    height: 9,
    width: 12,
    type: 'metric',
    properties: {
      metrics: [
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" Browser="Chrome"\', \'Average\')',
            id: 'e1',
            region: 'us-east-1',
            label: 'chrome',
            visible: false,
          },
        ],
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" Browser="Safari"\', \'Average\')',
            id: 'e2',
            region: 'us-east-1',
            label: 'safari',
            visible: false,
          },
        ],
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" Browser="Firefox"\', \'Average\')',
            id: 'e3',
            region: 'us-east-1',
            label: 'firefox',
            visible: false,
          },
        ],
        [
          {
            expression: 'SUM(e1)/(DATAPOINT_COUNT(e1))',
            id: 'e1avg',
            region: 'us-east-1',
            label: 'chrome-avg',
          },
        ],
        [
          {
            expression: 'SUM(e2)/(DATAPOINT_COUNT(e2))',
            id: 'e2avg',
            region: 'us-east-1',
            label: 'safari-avg',
          },
        ],
        [
          {
            expression: 'SUM(e3)/(DATAPOINT_COUNT(e3))',
            id: 'e3avg',
            region: 'us-east-1',
            label: 'firefox-avg',
          },
        ],
      ],
      view: 'timeSeries',
      stacked: false,
      region: 'us-east-1',
      stat: 'Average',
      period: 300,
      title: 'Model Reponse Time by Browser',
    },
  },
  {
    height: 9,
    width: 12,
    type: 'metric',
    properties: {
      metrics: [
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" ModelId="gen-ai-mistral-7b-inst-v01"\', \'Average\')',
            id: 'e1',
            region: 'us-east-1',
            label: 'verbose-mistral',
            visible: false,
            period: 900,
          },
        ],
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" ModelId="gen-ai-biomistral-7b"\', \'Average\')',
            id: 'e3',
            region: 'us-east-1',
            label: 'verbose-mistral',
            visible: false,
            period: 900,
          },
        ],
        [
          {
            expression:
              'SEARCH(\'{production-browser-metrics,AppName,Browser,BrowserVersion,Hostname,ModelId} MetricName="AichatModelResponseTime" ModelId!="gen-ai-mistral-7b-inst-v01" && ModelId!="gen-ai-biomistral-7b"\', \'Average\')',
            id: 'e2',
            region: 'us-east-1',
            label: 'other',
            visible: false,
            period: 900,
          },
        ],
        [
          {
            expression: 'SUM(e1)/DATAPOINT_COUNT(e1)',
            id: 'e1avg',
            region: 'us-east-1',
            label: 'gen-ai-mistral-7b-inst-v01',
            stat: 'Average',
          },
        ],
        [
          {
            expression: 'SUM(e2)/(DATAPOINT_COUNT(e2))',
            id: 'e2avg',
            region: 'us-east-1',
            label: 'other',
            stat: 'Average',
          },
        ],
        [
          {
            expression: 'SUM(e3)/(DATAPOINT_COUNT(e3))',
            id: 'e3avg',
            region: 'us-east-1',
            label: 'gen-ai-biomistral-7b',
            stat: 'Average',
          },
        ],
      ],
      view: 'timeSeries',
      stacked: false,
      region: 'us-east-1',
      stat: 'Average',
      period: 300,
      title: 'Model Response Time by Model',
      yAxis: {
        right: {
          label: '',
          showUnits: true,
        },
        left: {
          label: 'ms',
          showUnits: false,
        },
      },
    },
  },
];

module.exports = {modelNames, headerWidgetConfig, crossModelWidgetsConfig};
