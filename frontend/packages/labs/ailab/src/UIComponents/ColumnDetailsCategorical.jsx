/* React component to handle showing details of categorical columns. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { colors, styles } from "../constants";
import { Bar } from "react-chartjs-2";

const barData = {
  labels: [],
  datasets: [
    {
      label: "",
      backgroundColor: colors.tealTransparent,
      borderColor: colors.teal,
      borderWidth: 1,
      hoverBackgroundColor: "#59cad3",
      hoverBorderColor: "white",
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
  legend: { display: false },
  maintainAspectRatio: false
};

export default class ColumnDetailsCategorical extends Component {
  static propTypes = {
    id: PropTypes.string,
    uniqueOptions: PropTypes.object,
    optionFrequencies: PropTypes.object
  };

  render() {
    const { uniqueOptions, optionFrequencies, id } = this.props;

    barData.labels = Object.values(uniqueOptions);
    barData.datasets[0].data = barData.labels.map(option => {
      return optionFrequencies[option];
    });
    barData.datasets[0].label = id;

    const maxLabelsInHistogram = 5;

    return (
      <div>
        <div style={styles.bold}>Column information:</div>

        <div style={styles.barChart}>
          {barData.labels.length <= maxLabelsInHistogram && (
            <Bar
              data={barData}
              width={100}
              height={150}
              options={chartOptions}
            />
          )}
          {barData.labels.length > maxLabelsInHistogram && (
            <div>
              {barData.labels.length} values were found in this
              column. A graph is only shown when there are{" "}
              {maxLabelsInHistogram} or fewer.
            </div>
          )}
        </div>
      </div>
    );
  }
};
