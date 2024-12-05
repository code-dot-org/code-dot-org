import {
  CloudWatchClient,
  PutDashboardCommand,
} from '@aws-sdk/client-cloudwatch';
import {Dashboard} from 'cloudwatch-dashboard-types';
import {exit} from 'process';

import modelDescriptions from '../../../../../../apps/static/aichat/modelDescriptions.json';
import {BROWSERS, DASHBOARD_NAME, REGION} from '../constants';

import {
  createActiveJobGraph,
  createBrowserLatencyByModelGraph,
  createBrowserLatencyComparisonGraph,
  createBrowserChatPerformanceGraph,
  createInvocationErrorGraph,
  createInvocationGraph,
  createJobExecutionGraph,
  createLatencyComparisonGraph,
  createLatencyGraph,
  createTitleWidget,
  createUtilizationGraph,
  createBrowserSavePerformanceGraph,
  createJobPerformanceGraph,
  createLogTable,
  createExecutionCountGraph,
  createMarkdownWidget,
  createOverallChatPerformanceGraph,
  createOverallSavePerformanceGraph,
} from './widgetCreators';

function createDashboard(environment = 'production'): Dashboard {
  const modelWidgets = modelDescriptions
    .map(({name, id}) => [
      createTitleWidget(name, 'h2'),
      createInvocationGraph(id, environment),
      createInvocationErrorGraph(id, environment),
      createLatencyGraph(id, environment),
      createLatencyGraph(id, environment, 'singleValue', {
        width: 6,
        height: 12,
      }),
      createJobExecutionGraph(id, environment, {width: 12, height: 6}),
      createUtilizationGraph(id, environment),
    ])
    .flat();

  const browserMetrics = BROWSERS.map(browser => [
    createTitleWidget(browser, 'h2'),
    createBrowserChatPerformanceGraph(environment, browser),
    createBrowserSavePerformanceGraph(environment, browser),
    createBrowserLatencyByModelGraph(modelDescriptions, environment, browser),
  ]).flat();

  return {
    widgets: [
      // Overview Section
      createTitleWidget('Overview', 'h1'),
      // -- Performance Overview
      // ActiveJob metrics
      createMarkdownWidget(
        '## **Active Job Metrics**\n*[View in ActiveJob_DelayedJob Dashboard](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/ActiveJob_DelayedJob)*',
        24,
        2
      ),
      createTitleWidget('Performance', 'h2'),
      createJobPerformanceGraph(environment),
      createOverallChatPerformanceGraph(environment, BROWSERS),
      createOverallSavePerformanceGraph(environment, BROWSERS),
      createExecutionCountGraph(modelDescriptions, environment, {
        width: 6,
        height: 12,
      }),
      createLogTable('error', environment),
      createLogTable('warning', environment),
      // -- Latency Overview
      createTitleWidget('Latency', 'h2'),
      createBrowserLatencyComparisonGraph(BROWSERS, environment),
      createActiveJobGraph(environment),
      createLatencyComparisonGraph(modelDescriptions, environment),
      createBrowserLatencyComparisonGraph(BROWSERS, environment, 'gauge', {
        width: 24,
        height: 5,
      }),
      createLatencyComparisonGraph(modelDescriptions, environment, 'gauge', {
        width: 24,
        height: 5,
      }),
      // Browser Section
      createTitleWidget('Browser Metrics', 'h1'),
      ...browserMetrics,
      // Model-specific section
      createMarkdownWidget(
        '# Model Metrics\n*[Metrics Descriptions](https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-cloudwatch.html#cloudwatch-metrics-jobs)*',
        24,
        2
      ),
      ...modelWidgets,
    ],
  };
}

async function putDashboard(name: string) {
  const dashboard = createDashboard();
  const client = new CloudWatchClient({region: REGION});
  const input = {
    DashboardName: name,
    DashboardBody: JSON.stringify(dashboard),
  };
  const command = new PutDashboardCommand(input);
  const response = await client.send(command);
  console.log(response);

  if (response.$metadata.httpStatusCode === 200) {
    console.log(
      `Success! https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards/dashboard/${dashboardName}`
    );
  }
}

const args = process.argv.slice(2);
if (args.length === 0 || !['test', 'production'].includes(args[0])) {
  console.log('Usage: npx ts-node createDashboard.ts <test|production>');
  exit(0);
}

const dashboardName = DASHBOARD_NAME + (args[0] === 'test' ? '-TEST' : '');
console.log('Updating dashboard: ' + dashboardName);
putDashboard(dashboardName);
