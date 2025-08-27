import {OverlineThreeText} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useMemo, useState} from 'react';

import {Breakdown} from '../../../WorkshopFormTemplate/types';

import styles from '../../workshop.module.scss';

interface BarChartProps {
  items?: Breakdown[];
  className?: string;
  maxValue?: number;
  step?: number;
  heightPx?: number;
  xLabel?: string;
  yLabel?: string;
}

const MIN_BAR_PX = 2;

export const BarChart: FC<BarChartProps> = ({
  items = [],
  className,
  maxValue,
  step = 5,
  heightPx = 160,
  xLabel,
  yLabel,
}) => {
  const dataMax = useMemo(
    () => maxValue ?? Math.max(1, ...items.map(i => i.count || 0), 1),
    [items, maxValue]
  );

  // one extra step above the max so tallest bar never hits top line
  const max = useMemo(
    () => (Math.ceil(dataMax / step) + 1) * step,
    [dataMax, step]
  );

  const rows = useMemo(() => {
    const arr: number[] = [];
    for (let num = 0; num <= max; num += step) arr.push(num);
    return arr;
  }, [max, step]);

  // position from TOP (%) for each grid line / y label
  const topPctForIndex = (i: number) =>
    rows.length <= 1 ? 0 : (1 - i / (rows.length - 1)) * 100;

  return (
    <Box className={classNames(styles.chartWrapper, className)}>
      <Box className={styles.plotRow}>
        {/* y tick numbers (outside the grid) */}
        <Box className={styles.yGutter} style={{height: heightPx}}>
          <Box className={styles.yLabels}>
            {rows.map((num, i) => (
              <span
                key={num}
                className={styles.yLabel}
                style={{top: `${topPctForIndex(i)}%`}}
              >
                {num}
              </span>
            ))}
          </Box>
        </Box>

        {/* grid */}
        <Box className={styles.gridArea} style={{height: heightPx}}>
          <Box className={styles.gridLines} aria-hidden>
            {rows.map((num, i) => (
              <Box
                key={num}
                className={styles.gridLine}
                style={{top: `${topPctForIndex(i)}%`}}
              />
            ))}
          </Box>

          {/* bars */}
          <Box className={styles.barsRow}>
            {items.map(item => (
              <Bar
                key={item.label}
                value={item.count || 0}
                max={max}
                className={item.className && styles[item.className]}
              />
            ))}
          </Box>
        </Box>
        {yLabel && (
          <OverlineThreeText noMargin className={styles.yAxisTitleAbs}>
            {yLabel}
          </OverlineThreeText>
        )}
      </Box>

      {xLabel && (
        <OverlineThreeText className={styles.xLabel} noMargin>
          {xLabel}
        </OverlineThreeText>
      )}
    </Box>
  );
};

interface BarProps {
  value: number;
  max: number;
  className?: string;
}

const Bar: FC<BarProps> = ({value, max, className}) => {
  const [pct, setPct] = useState(0);
  const target = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));

  useEffect(() => {
    const t = setTimeout(() => setPct(target), 10);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <Box className={styles.barGroup} aria-label={`${value}`}>
      <span className={styles.barCount}>{value}</span>
      <Box
        className={classNames(styles.barFill, className)}
        style={{height: `calc(${pct}% + ${value === 0 ? MIN_BAR_PX : 0}px)`}}
      />
    </Box>
  );
};

export default BarChart;
