/* React component to handle showing details of categorical columns. */
import {Bar} from 'react-chartjs-2';

import {colors, styles} from '../constants';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getCategoricalColumnDetails} from '../selectors/currentColumnSelectors';

const chartOptions = {
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

const ColumnDetailsCategorical = () => {
  const columnDetails = useAppSelector(getCategoricalColumnDetails);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  const {id, uniqueOptions, frequencies} = columnDetails;
  const labels = uniqueOptions && Object.values(uniqueOptions);
  const maxChartRows = 5;
  const sortedLabels = [...labels].sort((a, b) => {
    const frequencyDifference = frequencies[b] - frequencies[a];
    return frequencyDifference || a.localeCompare(b);
  });
  const topLabels = sortedLabels.slice(0, maxChartRows);
  const remainingLabels = sortedLabels.slice(maxChartRows);
  const otherLabel = I18n.t('columnDetailsOtherValues') || 'Other';
  const chartLabels =
    remainingLabels.length > 0 ? [...topLabels, otherLabel] : topLabels;
  const chartCounts =
    remainingLabels.length > 0
      ? [
          ...topLabels.map(option => frequencies[option]),
          remainingLabels.reduce((sum, option) => sum + frequencies[option], 0),
        ]
      : topLabels.map(option => frequencies[option]);
  const localizedLabels = chartLabels.map(option =>
    getLocalizedValue(option, datasetId),
  );
  const barData = {
    labels: localizedLabels,
    datasets: [
      {
        label: id,
        backgroundColor: colors.tealTransparent,
        borderColor: colors.teal,
        borderWidth: 1,
        hoverBackgroundColor: '#59cad3',
        hoverBorderColor: 'white',
        data: chartCounts,
      },
    ],
  };

  const chartHeight = 160;

  return (
    <div>
      <div style={styles.bold}>{I18n.t('columnDetailsInformation')}</div>
      <div
        style={{...styles.barChart, height: chartHeight}}
        role="img"
        aria-label={I18n.t('columnDetailsCategoricalChartAriaLabel', {
          column: id,
          values: localizedLabels.join(', '),
        })}
      >
        <Bar
          data={barData}
          width={100}
          height={chartHeight}
          options={chartOptions}
        />
      </div>
      {remainingLabels.length > 0 && (
        <div style={styles.smallText}>
          {I18n.t('columnDetailsTopValuesShown', {
            shownCount: topLabels.length,
            otherCount: remainingLabels.length,
          })}
        </div>
      )}
    </div>
  );
};

export default ColumnDetailsCategorical;
