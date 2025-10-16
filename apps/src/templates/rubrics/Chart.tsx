// Our build system bundles typescript in a way that allows importing these types
// of packages without require, but the type checker doesn't know that, so it
// errors when linting/type-checking. So we ignore the type error and then ignore
// the lint error about using ts-ignore.
//
// This is generally because ECharts is built as modules and the type checker
// believes incorrectly that we are building our application as common-js.
//
// When our build system improves such that we are building modules first-class,
// we can re-visit this.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
import {BarChart, PieChart} from 'echarts/charts';
import {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this is OK because the bundler will handle the ambiguity
  GridComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this is OK because the bundler will handle the ambiguity
  LegendComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this is OK because the bundler will handle the ambiguity
  PolarComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this is OK because the bundler will handle the ambiguity
  TooltipComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - this is OK because the bundler will handle the ambiguity
} from 'echarts/components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
import * as echarts from 'echarts/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
import {LabelLayout} from 'echarts/features';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
import {SVGRenderer} from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type {EChartsReactProps} from 'echarts-for-react/lib/types';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
echarts.use([
  SVGRenderer,
  LabelLayout,
  GridComponent,
  PolarComponent,
  LegendComponent,
  TooltipComponent,
  BarChart,
  PieChart,
]);

const Chart: React.FunctionComponent<EChartsReactProps> = props => (
  <ReactEChartsCore echarts={echarts} {...props} />
);

export default Chart;
