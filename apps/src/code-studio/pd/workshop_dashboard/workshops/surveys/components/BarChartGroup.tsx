import {
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  LabelProps,
  LabelList,
  Rectangle,
} from 'recharts';

import moduleStyles from './barChartGroupStyles.module.scss';

const barColors = [
  'var(--sentiment-success-50, #3EA33E)', // green
  'var(--accent-orange-50, #FFB42E)', // orange
  'var(--accent-strawberry-50, #ED6060)', // red
  'var(--brand-teal-50, #0093A4)', // teal
  'var(--brand-purple-50, #8c52ba)', // purple
  'var(--brand-aqua-50, #3cfff7)', // aqua
];

const bodyFourTextStyle = {
  // Body-4 Text styles
  color: 'var(--text-neutral-primary, #292F36)',
  fontFamily: 'var(--font-family-body, Figtree)',
  fontSize: 'var(--font-size-body-xs, 12px)',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: 'var(--font-line-height-body-xs, 1.64)',
};

const strongTextStyle = {
  fontWeight: 600,
};

const overlineThreeTextStyle = {
  // Overline-3 Text styles
  color: 'var(--text-neutral-quaternary, #69788A)',
  fill: 'var(--text-neutral-quaternary, #69788A)',
  fontFamily: 'var(--font-family-body, Figtree)',
  fontSize: 'var(--font-size-body-xxs, 10px)',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: 'var(--font-line-height-body-xxs, 1.76)',
  letterSpacing: '0.4px',
};

// value labels that still render for zero-height bars, colored per-bar
const ValueLabel = (props: LabelProps) => {
  const {x = 0, y = 0, width = 0, value} = props;
  const cx = +x + +width / 2;
  const cy = +y - 6; // lift above bar/baseline
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill="var(--text-neutral-primary, #292F36)"
      style={{...bodyFourTextStyle, ...strongTextStyle}}
    >
      {value}
    </text>
  );
};

type SimpleBarChartData = {
  label: string;
  value: number;
};

type SimpleBarChartProps = {
  width?: number;
  height?: number;
  data: SimpleBarChartData[];
  yAxisLabel?: string;
  xAxisLabel?: string;
};

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  width = 374,
  height = 180,
  data,
  yAxisLabel,
  xAxisLabel,
}) => {
  const yMax = Math.max(...data.map(d => d.value), 10);
  const niceMax = Math.min(12, Math.ceil(yMax / 2) * 2);
  const yTicks = Array.from({length: yMax / 2 + 1}, (_, i) => i * 2);

  return (
    <Box className={moduleStyles.simpleBarChartContainer}>
      <BarChart
        width={width}
        height={height}
        data={data}
        margin={{top: 16, right: 8, bottom: 28, left: 8}}
        barCategoryGap="30%" // tighter spacing so bars feel centered under labels
        barSize={42} // consistent bar thickness
      >
        <CartesianGrid
          vertical={false}
          stroke="#E2E8F0"
          strokeDasharray="4 4"
        />

        <XAxis
          dataKey="label"
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={{...bodyFourTextStyle}}
          tickMargin={10}
        >
          {xAxisLabel && (
            <Label
              value={xAxisLabel}
              position="bottom"
              offset={14}
              style={{...overlineThreeTextStyle}}
            />
          )}
        </XAxis>

        <YAxis
          domain={[0, niceMax]}
          ticks={yTicks}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{...bodyFourTextStyle}}
          width={30}
        >
          {yAxisLabel && (
            <Label
              value={yAxisLabel}
              angle={-90}
              position="insideLeft"
              offset={-4}
              style={{
                textAnchor: 'middle',
                ...overlineThreeTextStyle,
              }}
            />
          )}
        </YAxis>

        <Bar
          dataKey="value"
          radius={[8, 8, 0, 0]} // rounded tops
          shape={<Rectangle radius={[8, 8, 0, 0]} />} // ensures rounding everywhere in v2.8
          isAnimationActive={false}
        >
          {!!data.length &&
            data.map((d, i) => (
              <Cell key={i} fill={barColors[i % barColors.length]} />
            ))}
          <LabelList dataKey="value" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </Box>
  );
};

type BarChartGroupProps = {
  chartWidth?: number;
  chartHeight?: number;
  title?: string;
  data: SimpleBarChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const BarChartGroup: React.FC<BarChartGroupProps> = ({
  chartWidth = 374,
  chartHeight = 180,
  title = 'Years Teaching',
  data = [],
  xAxisLabel,
  yAxisLabel,
}) => (
  <Box className={moduleStyles.barChartGroupContainer}>
    <Box className={moduleStyles.barChartGroupHeaderContainer}>
      <BodyTwoText noMargin>
        <StrongText>{title}</StrongText>
      </BodyTwoText>
    </Box>
    <SimpleBarChart
      width={chartWidth}
      height={chartHeight}
      data={data}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
    />
  </Box>
);

export {SimpleBarChart, BarChartGroup};

export default BarChartGroup;
