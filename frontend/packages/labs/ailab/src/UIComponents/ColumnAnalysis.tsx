/* Panel describing the column selected in the data table. */
import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {ColumnTypes, UNIQUE_OPTIONS_MAX} from '../constants';
import {
  getLocalizedColumnName,
  getMostAndLeastCommon,
} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {useProject} from '../ProjectContext';
import {setCurrentColumn} from '../redux';
import {
  getCategoricalColumnDetails,
  getCurrentColumnDetails,
  getNumericalColumnDetails,
  hasTooManyUniqueOptions,
} from '../selectors/currentColumnSelectors';

import DistributionChart, {
  type DistributionBar,
  MAX_DISTRIBUTION_BARS,
} from './DistributionChart';
import StatCard from './StatCard';

import styles from './columnAnalysis.module.scss';

const formatNumber = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, {maximumFractionDigits: 2})
    : '—';

const ColumnAnalysis = () => {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const columnDetails = useAppSelector(state =>
    getCurrentColumnDetails(state, project)
  );
  const categoricalDetails = useAppSelector(getCategoricalColumnDetails);
  const numericalDetails = useAppSelector(getNumericalColumnDetails);
  const tooManyOptions = useAppSelector(hasTooManyUniqueOptions);
  const datasetLayout = useAppSelector(state => state.datasetLayout);

  if (!columnDetails || datasetLayout === 'cards') {
    return null;
  }

  const columnName = getLocalizedColumnName(datasetId, columnDetails.id);
  const isCategorical = columnDetails.dataType === ColumnTypes.CATEGORICAL;
  const localizedOption = (option: string) =>
    String(getLocalizedValue(option, datasetId));

  const stats = [
    {label: 'Type', value: isCategorical ? 'Categorical' : 'Numerical'},
  ];
  if (isCategorical) {
    const {uniqueOptions, frequencies} = categoricalDetails;
    const common = getMostAndLeastCommon(uniqueOptions, frequencies);
    stats.push({label: 'Values', value: String(uniqueOptions.length)});
    if (common) {
      stats.push(
        {label: 'Most Common', value: localizedOption(common.mostCommon)},
        {label: 'Least Common', value: localizedOption(common.leastCommon)}
      );
    }
  } else if (numericalDetails.extrema) {
    const {min, max, range} = numericalDetails.extrema;
    stats.push(
      {label: 'Minimum', value: formatNumber(min)},
      {label: 'Maximum', value: formatNumber(max)},
      {label: 'Range', value: formatNumber(range)}
    );
  }

  const bars: DistributionBar[] = isCategorical
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
        <Typography
          id="column-analysis-heading"
          component="h3"
          variant="overline2"
          className={styles.headerTitle}
        >
          Column Analysis
        </Typography>
        <IconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          aria-label="Close column analysis"
          // Selecting the current column again deselects it.
          onClick={() => dispatch(setCurrentColumn(columnDetails.id))}
        >
          <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <div className={styles.summary}>
          <Typography component="h4" variant="h6">
            {columnName}
          </Typography>
          {columnDetails.description && (
            <Typography variant="body4" className={styles.description}>
              {columnDetails.description}
            </Typography>
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
              <Typography
                component="h4"
                variant="label1"
                className={styles.emptyGraphTitle}
              >
                Too many values
              </Typography>
              <Typography variant="body4" className={styles.emptyGraphMessage}>
                {`A graph is shown when there are ${MAX_DISTRIBUTION_BARS} or fewer values.`}
              </Typography>
            </div>
          ) : (
            <div className={styles.distribution}>
              <Typography
                component="h4"
                variant="body4"
                className={styles.distributionTitle}
              >
                Distribution
              </Typography>
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
