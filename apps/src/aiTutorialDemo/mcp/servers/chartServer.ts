import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';

import {MCP_APP_MIME_TYPE} from '../constants';
import {buildChartWidgetHtml} from '../widgets/chartWidgetHtml';

export const CHART_WIDGET_URI = 'ui://chart-server/main';

// MCP Apps server for an interactive bar chart. With editable=true the
// student can drag bar tops; each completed drag comes back as a
// widget_event with the new values and their mean, which makes the chart a
// hands-on surface for teaching averages rather than a static picture.
export function createChartServer(): McpServer {
  const server = new McpServer({name: 'chart-server', version: '0.1.0'});

  server.registerTool(
    'show_bar_chart',
    {
      description:
        'Show the student a bar chart of a small list of numbers, replacing ' +
        'any widget currently shown. Set showMean to draw a labeled mean ' +
        'line that updates live. Set editable to let the student drag bar ' +
        'tops; each completed drag sends you a widget_event with the new ' +
        'values and mean. Call again with new parameters to change the chart.',
      inputSchema: {
        title: z.string().optional().describe('Short chart title'),
        values: z
          .array(z.number().min(0).max(1000))
          .min(1)
          .max(10)
          .describe('Bar heights, one per bar'),
        labels: z
          .array(z.string())
          .optional()
          .describe('Bar labels; defaults to 1..n'),
        showMean: z
          .boolean()
          .optional()
          .describe('Draw a dashed mean line that updates as values change'),
        editable: z
          .boolean()
          .optional()
          .describe('Let the student drag bar tops to change values'),
      },
      _meta: {
        ui: {resourceUri: CHART_WIDGET_URI, visibility: ['model']},
      },
    },
    async () => ({
      content: [{type: 'text', text: 'Chart is now on screen.'}],
    })
  );

  server.registerResource(
    'bar-chart-widget',
    CHART_WIDGET_URI,
    {
      description: 'Interactive bar chart with optional mean line',
      mimeType: MCP_APP_MIME_TYPE,
      _meta: {ui: {prefersBorder: true}},
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MCP_APP_MIME_TYPE,
          text: buildChartWidgetHtml(),
        },
      ],
    })
  );

  return server;
}
