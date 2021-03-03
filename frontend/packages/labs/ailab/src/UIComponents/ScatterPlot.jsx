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
      pointBorderWidth: 2,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: []
    }
  ]
};

const chartOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true
        }
      }
    ]
  },
  maintainAspectRatio: false
};

class ScatterPlot extends Component {
  static propTypes = {
    scatterPlotData: PropTypes.object
  };

  render() {
    const { scatterPlotData } = this.props;

    const scatterDataCombined = {
      ...scatterDataBase,
      datasets: [scatterPlotData]
    };

    return (
      scatterPlotData && (
        <div id="scatter-plot" style={{ ...styles.panel, ...styles.rightPanel }}>
          <div style={styles.largeText}>Correlation Information</div>
          <div style={styles.scrollableContents}>
            <div style={styles.scrollingContents}>
              <Scatter data={scatterDataCombined} options={chartOptions} />
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
