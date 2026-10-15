/* Bar chart of how many rows have each value of a categorical column.
It uses a list behind the scenes to make the data accessible to screen readers. */
import {Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {getNiceAxisStep} from '../helpers/utils';

import appStyles from '../app.module.scss';
import styles from './distributionChart.module.scss';

const AXIS_INTERVALS = 4;
const BAR_COLOR_CLASSES = [
  styles.barColor0,
  styles.barColor1,
  styles.barColor2,
  styles.barColor3,
  styles.barColor4,
];
// One distinct color per bar, so the chart is capped at the palette size.
export const MAX_DISTRIBUTION_BARS = BAR_COLOR_CLASSES.length;

export interface DistributionBar {
  label: string;
  count: number;
}

interface DistributionChartProps {
  columnName: string;
  bars: DistributionBar[];
}

const DistributionChart = ({columnName, bars}: DistributionChartProps) => {
  const maxCount = Math.max(...bars.map(bar => bar.count));
  const step = getNiceAxisStep(maxCount, AXIS_INTERVALS);
  const axisMax = Math.max(step, Math.ceil(maxCount / step) * step);
  const ticks = Array.from(
    {length: axisMax / step + 1},
    (_, index) => index * step
  );
  const colorClass = (index: number) => BAR_COLOR_CLASSES[index];

  return (
    <div className={styles.chart}>
      <div className={styles.plot}>
        {ticks.map(tick => (
          <div
            key={tick}
            className={styles.gridLine}
            style={{bottom: `${(tick / axisMax) * 100}%`}}
            aria-hidden="true"
          >
            <span className={styles.tickLabel}>{tick}</span>
          </div>
        ))}
        <ul
          className={styles.bars}
          aria-label={`Distribution of ${columnName}`}
        >
          {bars.map((bar, index) => (
            <Tooltip
              key={bar.label}
              arrow={false}
              placement="top"
              // The open tooltip names the focused bar instead of repeating
              // its hidden label as a description.
              describeChild={false}
              slotProps={{tooltip: {className: styles.tooltip}}}
              title={
                <>
                  <Typography
                    component="span"
                    variant="body4"
                    className={styles.tooltipLabel}
                  >
                    <span
                      className={classNames(styles.swatch, colorClass(index))}
                    />
                    {bar.label}
                  </Typography>
                  <Typography
                    component="strong"
                    variant="body4"
                    className={styles.tooltipCount}
                  >
                    {bar.count}
                  </Typography>
                </>
              }
            >
              <li
                className={styles.barSlot}
                // Focusable so keyboard users can open the count's tooltip.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
              >
                <span
                  className={classNames(styles.bar, colorClass(index))}
                  style={{height: `${(bar.count / axisMax) * 100}%`}}
                />
                {/* Label for screen readers */}
                <span className={appStyles.visuallyHidden}>
                  {bar.label}: {bar.count}
                </span>
              </li>
            </Tooltip>
          ))}
        </ul>
      </div>
      <div className={styles.barLabels} aria-hidden="true">
        {bars.map(bar => (
          <span key={bar.label} className={styles.barLabel}>
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;
