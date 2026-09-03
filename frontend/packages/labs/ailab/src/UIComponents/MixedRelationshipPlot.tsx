import {Scatter} from 'react-chartjs-2';

import {styles, colors} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getMixedRelationshipPlotData} from '../selectors/visualizationSelectors';

const MixedRelationshipPlot = () => {
  const mixedRelationshipPlotData = useAppSelector(getMixedRelationshipPlotData);

  if (!mixedRelationshipPlotData) {
    return null;
  }

  const scatterData = {
    labels: ['Mixed relationship'],
    datasets: [
      {
        label: `${mixedRelationshipPlotData.feature} / ${mixedRelationshipPlotData.label}`,
        fill: true,
        pointRadius: 4,
        pointHitRadius: 10,
        pointBorderWidth: 1,
        pointBorderColor: 'white',
        pointBackgroundColor: colors.teal,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#59cad3',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
        data: mixedRelationshipPlotData.coordinates,
      },
    ],
  };

  const chartOptions = {
    scales: {
      xAxes: [
        {
          ticks: {
            min: -0.5,
            max: mixedRelationshipPlotData.xCategories.length - 0.5,
            stepSize: 1,
            callback: (value: number | string) => {
              const numericValue = Number(value);
              const index = Math.round(numericValue);
              return Math.abs(numericValue - index) < 0.01
                ? mixedRelationshipPlotData.xCategories[index] || ''
                : '';
            },
          },
          scaleLabel: {
            display: true,
            labelString: mixedRelationshipPlotData.xAxisLabel,
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: mixedRelationshipPlotData.yAxisLabel,
          },
        },
      ],
    },
    legend: {display: false},
    maintainAspectRatio: false,
  };

  return (
    <div id="mixed-relationship-plot">
      <div style={styles.bold}>{I18n.t('scatterPlotLabel')}</div>
      <div
        style={styles.scatterPlot}
        role="img"
        aria-label={I18n.t('mixedRelationshipPlotAriaLabel', {
          feature: mixedRelationshipPlotData.feature,
          label: mixedRelationshipPlotData.label,
        })}
      >
        <Scatter data={scatterData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MixedRelationshipPlot;
