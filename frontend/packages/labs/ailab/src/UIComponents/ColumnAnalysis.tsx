/* Panel describing the column selected in the data table. */
import {IconButton as MuiIconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {ColumnTypes, UNIQUE_OPTIONS_MAX} from '../constants';
import {
  getLocalizedColumnName,
  getMostAndLeastCommon,
} from '../helpers/columnDetails';
import {getNiceAxisStep} from '../helpers/utils';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setCurrentColumn} from '../redux';
import {
  getCategoricalColumnDetails,
  getCurrentColumnDetails,
  getNumericalColumnDetails,
  hasTooManyUniqueOptions,
} from '../selectors/currentColumnSelectors';

import styles from './columnAnalysis.module.scss';

const AXIS_INTERVALS = 4;
const BAR_COLOR_CLASSES = [
  styles.barColor0,
  styles.barColor1,
  styles.barColor2,
  styles.barColor3,
  styles.barColor4,
];
// One distinct color per bar, so the chart is capped at the palette size.
const MAX_DISTRIBUTION_BARS = BAR_COLOR_CLASSES.length;

const formatNumber = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, {maximumFractionDigits: 2})
    : '—';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({label, value}: StatCardProps) => (
  <div className={styles.statCard}>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue} title={value}>
      {value}
    </div>
  </div>
);

interface DistributionChartProps {
  columnName: string;
  bars: {label: string; count: number}[];
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
              title={
                <span className={styles.tooltip}>
                  <span
                    className={classNames(styles.swatch, colorClass(index))}
                  />
                  {bar.label}
                  <strong>{bar.count}</strong>
                </span>
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

const ColumnAnalysis = () => {
  const dispatch = useAppDispatch();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const columnDetails = useAppSelector(getCurrentColumnDetails);
  const categoricalDetails = useAppSelector(getCategoricalColumnDetails);
  const numericalDetails = useAppSelector(getNumericalColumnDetails);
  const tooManyOptions = useAppSelector(hasTooManyUniqueOptions);

  if (!columnDetails) {
    return null;
  }

  const columnName = getLocalizedColumnName(datasetId, columnDetails.id);
  const isCategorical = columnDetails.dataType === ColumnTypes.CATEGORICAL;
  const localizedOption = (option: string) =>
    String(getLocalizedValue(option, datasetId));

  const stats: StatCardProps[] = [
    {label: 'Type', value: isCategorical ? 'Categorical' : 'Numerical'},
  ];
  if (isCategorical) {
    const {uniqueOptions, frequencies} = categoricalDetails;
    const common = getMostAndLeastCommon(uniqueOptions, frequencies);
    stats.push({label: 'Values', value: String(uniqueOptions.length)});
    if (common) {
      stats.push(
        {label: 'Most Common', value: localizedOption(common.mostCommon)},
        {label: 'Least Common', value: localizedOption(common.leastCommon)},
      );
    }
  } else if (numericalDetails.extrema) {
    const {min, max, range} = numericalDetails.extrema;
    stats.push(
      {label: 'Minimum', value: formatNumber(min)},
      {label: 'Maximum', value: formatNumber(max)},
      {label: 'Range', value: formatNumber(range)},
    );
  }

  const bars = isCategorical
    ? categoricalDetails.uniqueOptions.map(option => ({
        label: localizedOption(option),
        count: categoricalDetails.frequencies[option],
      }))
    : [];

  return (
    <section
      id="column-analysis"
      className={styles.panel}
      aria-labelledby="column-analysis-heading"
    >
      <div className={styles.header}>
        <span className={styles.headerSpacer} />
        <h2 id="column-analysis-heading" className={styles.headerTitle}>
          Column Analysis
        </h2>
        <MuiIconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          aria-label="Close column analysis"
          // Selecting the current column again deselects it.
          onClick={() => dispatch(setCurrentColumn(columnDetails.id))}
        >
          <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
        </MuiIconButton>
      </div>
      <div className={styles.body}>
        <div className={styles.summary}>
          <h3 className={styles.columnName}>{columnName}</h3>
          {columnDetails.description && (
            <p className={styles.description}>{columnDetails.description}</p>
          )}
          <div className={styles.stats}>
            {stats.map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
          {isCategorical && tooManyOptions && (
            <Alert
              type="warning"
              size="xs"
              isImmediateImportance={false}
              className={styles.alert}
              text={
                I18n.t('uniqueOptionsWarningMessage', {
                  valueCount: UNIQUE_OPTIONS_MAX,
                }) ?? ''
              }
            />
          )}
        </div>
        {isCategorical &&
          (bars.length > MAX_DISTRIBUTION_BARS ? (
            <div className={classNames(styles.distribution, styles.emptyGraph)}>
              <span className={styles.emptyGraphIcon} aria-hidden="true">
                <FontAwesomeV6Icon iconName="chart-simple" iconStyle="solid" />
              </span>
              <h3 className={styles.emptyGraphTitle}>Too many values</h3>
              <p className={styles.emptyGraphMessage}>
                {`A graph is shown when there are ${MAX_DISTRIBUTION_BARS} or fewer values.`}
              </p>
            </div>
          ) : (
            <div className={styles.distribution}>
              <h3 className={styles.distributionTitle}>Distribution</h3>
              {bars.length > 0 && (
                <DistributionChart columnName={columnName} bars={bars} />
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

export default ColumnAnalysis;
