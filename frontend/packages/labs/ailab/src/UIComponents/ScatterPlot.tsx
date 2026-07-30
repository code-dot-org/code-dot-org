import {Scatter} from 'react-chartjs-2';

import {styles, colors} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getScatterPlotData} from '../selectors/visualizationSelectors';

const scatterDataBase = {
  labels: ['Scatter'],
  datasets: [
    {
      label: '',
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
      data: [] as {x: number; y: number}[],
    },
  ],
};

const chartOptionsBase = {
  scales: {
    xAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
        scaleLabel: {
          display: true,
          labelString: '',
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
        scaleLabel: {
          display: true,
          labelString: '',
        },
      },
    ],
  },
  legend: {display: false},
  maintainAspectRatio: false,
};

const ScatterPlot = () => {
  const scatterPlotData = useAppSelector(getScatterPlotData);

  if (!scatterPlotData) {
    return null;
  }

  const scatterDataCombined = {
    ...scatterDataBase,
    datasets: [
      {
        ...scatterDataBase.datasets[0],
        data: scatterPlotData.coordinates,
      },
    ],
  };

  const chartOptionsCombined = {
    ...chartOptionsBase,
    scales: {
      xAxes: [
        {
          ...chartOptionsBase.scales.xAxes[0],
          scaleLabel: {
            ...chartOptionsBase.scales.xAxes[0].scaleLabel,
            labelString: scatterPlotData.feature,
          },
        },
      ],
      yAxes: [
        {
          ...chartOptionsBase.scales.yAxes[0],
          scaleLabel: {
            ...chartOptionsBase.scales.yAxes[0].scaleLabel,
            labelString: scatterPlotData.label,
          },
        },
      ],
    },
  };

  return (
    <div id="scatter-plot">
      <div style={styles.bold}>{I18n.t('scatterPlotLabel')}</div>
      <div
        style={styles.scatterPlot}
        role="img"
        aria-label={I18n.t('mixedRelationshipPlotAriaLabel', {
          feature: scatterPlotData.feature,
          label: scatterPlotData.label,
        })}
      >
        <Scatter data={scatterDataCombined} options={chartOptionsCombined} />
      </div>
    </div>
  );
};

export default ScatterPlot;
