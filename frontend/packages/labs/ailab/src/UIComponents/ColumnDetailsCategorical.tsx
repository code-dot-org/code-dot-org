/* React component to handle showing details of categorical columns. */
import {Bar} from 'react-chartjs-2';
import {connect} from 'react-redux';

import {colors, styles} from '../constants';
import {getLocalizedValue} from '../helpers/valueDetails';
import I18n from '../i18n';
import type {RootState} from '../redux';
import {getCategoricalColumnDetails} from '../selectors/currentColumnSelectors';
import type {CategoricalColumnDetails} from '../types';

interface ColumnDetailsCategoricalProps {
  columnDetails: CategoricalColumnDetails;
  datasetId: string;
}

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

const ColumnDetailsCategorical = ({
  columnDetails,
  datasetId,
}: ColumnDetailsCategoricalProps) => {
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

export default connect(
  (state: RootState) => ({
    columnDetails: getCategoricalColumnDetails(state),
    datasetId: state.metadata?.name || 'unknown',
  }),
  {},
)(ColumnDetailsCategorical);
