// This mock just bundles the entire chart library since it cannot be
// minimally built per-module since echarts does not properly publish
// modules for common-js.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - this is OK because the bundler will handle the ambiguity
import * as echarts from 'echarts';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type {EChartsReactProps} from 'echarts-for-react/lib/types';
import React from 'react';

const Chart: React.FunctionComponent<EChartsReactProps> = props => (
  <ReactEChartsCore echarts={echarts} {...props} />
);

export default Chart;
