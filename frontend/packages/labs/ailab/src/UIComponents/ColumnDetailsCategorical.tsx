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
  const localizedLabels = labels.map(option =>
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
        data: labels.map(option => frequencies[option]),
      },
    ],
  };

  const maxLabelsInHistogram = 5;

  return (
    <div>
      <div style={styles.bold}>{I18n.t('columnDetailsInformation')}</div>
      <div style={styles.barChart}>
        {labels.length <= maxLabelsInHistogram && (
          <Bar data={barData} width={100} height={150} options={chartOptions} />
        )}
        {labels.length > maxLabelsInHistogram && (
          <div>
            {I18n.t('columnDetailsTooManyLabels', {
              labelCount: labels.length,
              maxLabelCount: maxLabelsInHistogram,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnDetailsCategorical;
