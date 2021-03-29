import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getScatterPlotData } from "../redux";
import { styles } from "../constants.js";
import { Scatter } from "react-chartjs-2";

const scatterDataBase = {
  labels: ["Scatter"],
  datasets: [
    {
      label: "",
      fill: true,
      backgroundColor: "rgba(75,192,192,0.4)",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 4,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
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
          <div style={styles.largeText}>Relationship Information</div>
          <div style={styles.scrollableContents}>
            <div style={{ ...styles.scrollingContents, height: 300 }}>
              <Scatter
                data={scatterDataCombined}
                options={chartOptionsCombined}
              />
            </div>
          </div>
        </div>
      )
    );
  }
}

export default connect(state => ({
  scatterPlotData: getScatterPlotData(state)
}))(ScatterPlot);
