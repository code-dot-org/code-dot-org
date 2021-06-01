import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getScatterPlotData } from "../redux";
import { styles, colors } from "../constants.js";
import { Scatter } from "react-chartjs-2";

const scatterDataBase = {
  labels: ["Scatter"],
  datasets: [
    {
      label: "",
      fill: true,
      pointRadius: 4,
      pointHitRadius: 10,
      pointBorderWidth: 1,
      pointBorderColor: "white",
      pointBackgroundColor: colors.teal,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#59cad3",
      pointHoverBorderColor: "white",
      pointHoverBorderWidth: 2,
      data: []
    }
  ]
};

const chartOptionsBase = {
  scales: {
    xAxes: [
      {
        ticks: {
          beginAtZero: true
        },
        scaleLabel: {
          display: true,
          labelString: ""
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true
        },
        scaleLabel: {
          display: true,
          labelString: ""
        }
      }
    ]
  },
  legend: { display: false },
  maintainAspectRatio: false
};

class ScatterPlot extends Component {
  static propTypes = {
    scatterPlotData: PropTypes.object
  };

  render() {
    const { scatterPlotData } = this.props;

    const scatterDataCombined = {
      ...scatterDataBase
    };

    const chartOptionsCombined = {
      ...chartOptionsBase
    };

    if (scatterPlotData) {
      scatterDataCombined.datasets[0].data = scatterPlotData.data;

      chartOptionsCombined.scales.xAxes[0].scaleLabel.labelString =
        scatterPlotData.feature;
      chartOptionsCombined.scales.yAxes[0].scaleLabel.labelString =
        scatterPlotData.label;
    }

    return (
      scatterPlotData && (
        <div id="scatter-plot">
          <div style={styles.bold}>Relationship information:</div>
          <div style={styles.scatterPlot}>
            <Scatter
              data={scatterDataCombined}
              options={chartOptionsCombined}
            />
          </div>
        </div>
      )
    );
  }
}

export default connect(state => ({
  scatterPlotData: getScatterPlotData(state)
}))(ScatterPlot);
