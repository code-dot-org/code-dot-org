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
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

import {COLOR_MAP, ColorMapKey} from '../constants';

import moduleStyles from './barChartGroupStyles.module.scss';

export const barColors = [
  COLOR_MAP.get('green'),
  COLOR_MAP.get('orange'),
  COLOR_MAP.get('red'),
  COLOR_MAP.get('teal'),
  COLOR_MAP.get('purple'),
  COLOR_MAP.get('aqua'),
];

const gridColor = COLOR_MAP.get('light-gray');

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
  color?: ColorMapKey;
};

type SimpleBarChartProps = {
  width?: number | string;
  height?: number | string;
  data: SimpleBarChartData[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  barSize?: number;
  step?: number;
  animate?: boolean;
};

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  width = '100%',
  height = '100%',
  data,
  yAxisLabel,
  xAxisLabel,
  step = 2,
  barSize = 42,
  animate = false,
}) => {
  const yMax = Math.max(...data.map(d => d.value), 10);
  const niceMax = Math.ceil(yMax / step) * step + step;
  const yTicks = Array.from(
    {length: Math.floor(niceMax / step) + 1},
    (_, i) => i * step
  );

  return (
    <ResponsiveContainer height={height} width={width}>
      <BarChart
        data={data}
        margin={{top: 16, right: 8, bottom: 28, left: 8}}
        barCategoryGap="30%" // tighter spacing so bars feel centered under labels
        barSize={barSize}
      >
        <CartesianGrid
          vertical={false}
          stroke={gridColor}
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
              className={moduleStyles.axisLabel}
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
              className={moduleStyles.axisLabel}
              style={{
                textAnchor: 'middle',
              }}
            />
          )}
        </YAxis>

        <ReferenceLine y={0} stroke={gridColor} strokeWidth={2} />

        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]} // rounded tops
          shape={<Rectangle radius={[4, 4, 0, 0]} />} // ensures rounding everywhere in v2.8
          isAnimationActive={animate}
          animationDuration={animate ? 600 : undefined}
          animationEasing={animate ? 'ease-out' : undefined}
        >
          {!!data.length &&
            data.map((d, i) => {
              let fillColor = barColors[i % barColors.length];
              if (typeof d.color === 'string') {
                fillColor = COLOR_MAP.get(d.color);
              }
              return <Cell key={i} fill={fillColor} />;
            })}
          <LabelList dataKey="value" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export type BarChartGroupProps = {
  chartWidth?: number | string;
  chartHeight?: number | string;
  title?: string;
  data: SimpleBarChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  animate?: boolean;
};

const BarChartGroup: React.FC<BarChartGroupProps> = ({
  chartWidth = '100%',
  chartHeight = '100%',
  title = 'Years Teaching',
  data = [],
  xAxisLabel,
  yAxisLabel,
  animate,
}) => (
  <Box className={moduleStyles.barChartGroupContainer}>
    <Box className={moduleStyles.barChartGroupHeaderContainer}>
      <BodyTwoText noMargin>
        <StrongText>{title}</StrongText>
      </BodyTwoText>
    </Box>
    <Box className={moduleStyles.simpleBarChartContainer}>
      <SimpleBarChart
        width={chartWidth}
        height={chartHeight}
        data={data}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        animate={animate}
      />
    </Box>
  </Box>
);

export {SimpleBarChart, BarChartGroup};

export default BarChartGroup;
