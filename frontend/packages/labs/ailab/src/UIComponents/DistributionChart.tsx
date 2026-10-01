/* Bar chart of how many rows have each value of a categorical column. */
import {Tooltip} from '@mui/material';
import classNames from 'classnames';

import {getNiceAxisStep} from '../helpers/utils';

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
    (_, index) => index * step,
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
              slotProps={{tooltip: {className: styles.tooltip}}}
              title={
                <>
                  <span className={styles.tooltipLabel}>
                    <span
                      className={classNames(styles.swatch, colorClass(index))}
                    />
                    {bar.label}
                  </span>
                  <strong className={styles.tooltipCount}>{bar.count}</strong>
                </>
              }
            >
              <li className={styles.barSlot}>
                <span
                  className={classNames(styles.bar, colorClass(index))}
                  style={{height: `${(bar.count / axisMax) * 100}%`}}
                />
                <span className={styles.visuallyHidden}>
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
