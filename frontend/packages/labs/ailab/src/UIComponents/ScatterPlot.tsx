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

  const scatterDataCombined = {
    ...scatterDataBase,
  };

  const chartOptionsCombined = {
    ...chartOptionsBase,
  };

  if (scatterPlotData) {
    scatterDataCombined.datasets[0].data = scatterPlotData.coordinates;

    chartOptionsCombined.scales.xAxes[0].scaleLabel.labelString =
      scatterPlotData.feature;
    chartOptionsCombined.scales.yAxes[0].scaleLabel.labelString =
      scatterPlotData.label;
  }

  return (
    scatterPlotData && (
      <div id="scatter-plot">
        <div style={styles.bold}>{I18n.t('scatterPlotLabel')}</div>
        <div style={styles.scatterPlot}>
          <Scatter data={scatterDataCombined} options={chartOptionsCombined} />
        </div>
      </div>
    )
  );
};

export default ScatterPlot;
