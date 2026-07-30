/* React component to handle showing details of numerical columns. */
import {Bar} from 'react-chartjs-2';

import {colors, styles} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getNumericalColumnDetails} from '../selectors/currentColumnSelectors';
import type {BoxPlotStats} from '../types';

const histogramChartOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          precision: 0,
        },
      },
    ],
  },
  legend: {display: false},
  maintainAspectRatio: false,
};

function formatStat(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(value.toFixed(2)));
}

function renderBoxPlot(boxPlot: BoxPlotStats) {
  const width = 220;
  const height = 74;
  const left = 18;
  const right = width - 18;
  const centerY = 32;
  const boxTop = 18;
  const boxHeight = 28;
  const range = boxPlot.max - boxPlot.min;
  const scale = (value: number) =>
    range === 0
      ? width / 2
      : left + ((value - boxPlot.min) / range) * (right - left);

  const minX = scale(boxPlot.min);
  const q1X = scale(boxPlot.q1);
  const medianX = scale(boxPlot.median);
  const q3X = scale(boxPlot.q3);
  const maxX = scale(boxPlot.max);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={I18n.t('columnDetailsBoxPlotAriaLabel', {
        min: formatStat(boxPlot.min),
        q1: formatStat(boxPlot.q1),
        median: formatStat(boxPlot.median),
        q3: formatStat(boxPlot.q3),
        max: formatStat(boxPlot.max),
      })}
    >
      <line
        x1={minX}
        x2={maxX}
        y1={centerY}
        y2={centerY}
        stroke={colors.teal}
        strokeWidth={2}
      />
      <line
        x1={minX}
        x2={minX}
        y1={boxTop}
        y2={boxTop + boxHeight}
        stroke={colors.teal}
        strokeWidth={2}
      />
      <line
        x1={maxX}
        x2={maxX}
        y1={boxTop}
        y2={boxTop + boxHeight}
        stroke={colors.teal}
        strokeWidth={2}
      />
      <rect
        x={q1X}
        y={boxTop}
        width={Math.max(q3X - q1X, 1)}
        height={boxHeight}
        fill={colors.tealTransparent}
        stroke={colors.teal}
        strokeWidth={2}
      />
      <line
        x1={medianX}
        x2={medianX}
        y1={boxTop}
        y2={boxTop + boxHeight}
        stroke="#4d575f"
        strokeWidth={3}
      />
      <text x={minX} y={66} textAnchor="middle" fontSize={10} fill="#4d575f">
        {formatStat(boxPlot.min)}
      </text>
      <text x={maxX} y={66} textAnchor="middle" fontSize={10} fill="#4d575f">
        {formatStat(boxPlot.max)}
      </text>
    </svg>
  );
}

const ColumnDetailsNumerical = () => {
  const columnDetails = useAppSelector(getNumericalColumnDetails);

  const {extrema, containsOnlyNumbers, histogram, boxPlot} = columnDetails;
  const histogramData = {
    labels: histogram?.map(bin => bin.label) ?? [],
    datasets: [
      {
        label: columnDetails.id,
        backgroundColor: colors.tealTransparent,
        borderColor: colors.teal,
        borderWidth: 1,
        hoverBackgroundColor: '#59cad3',
        hoverBorderColor: 'white',
        data: histogram?.map(bin => bin.count) ?? [],
      },
    ],
  };

  return (
    <div>
      <div style={styles.bold}>{I18n.t('columnDetailsInformation')}</div>
      {!containsOnlyNumbers && (
        <p style={styles.error}>{I18n.t('columnDetailsNumericalTypeError')}</p>
      )}
      {containsOnlyNumbers && extrema && (
        <div style={styles.contents}>
          {I18n.t('columnDetailsMinimumValue')} {extrema.min}
          <br />
          {I18n.t('columnDetailsMaximumValue')} {extrema.max}
          <br />
          {I18n.t('columnDetailsValueRange')} {extrema.range}
        </div>
      )}
      {containsOnlyNumbers && histogram && histogram.length > 0 && (
        <div>
          <div style={styles.columnDetailsChartHeading}>
            {I18n.t('columnDetailsHistogramLabel')}
          </div>
          <div
            style={styles.histogramChart}
            role="img"
            aria-label={I18n.t('columnDetailsHistogramAriaLabel', {
              column: columnDetails.id,
            })}
          >
            <Bar
              data={histogramData}
              width={100}
              height={150}
              options={histogramChartOptions}
            />
          </div>
        </div>
      )}
      {containsOnlyNumbers && boxPlot && (
        <div>
          <div style={styles.columnDetailsChartHeading}>
            {I18n.t('columnDetailsBoxPlotLabel')}
          </div>
          <div style={styles.boxPlotChart}>{renderBoxPlot(boxPlot)}</div>
        </div>
      )}
    </div>
  );
};

export default ColumnDetailsNumerical;
