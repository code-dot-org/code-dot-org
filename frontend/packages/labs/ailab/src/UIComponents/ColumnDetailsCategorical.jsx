/* React component to handle showing details of categorical columns. */
import React, { Component } from "react";
import { connect } from "react-redux";
import { colors, styles } from "../constants";
import { Bar } from "react-chartjs-2";
import { categeoricalColumnDetailsShape } from "./shapes";
import {
  getCategoricalColumnDetails
} from "../selectors/currentColumnSelectors";
import I18n from "../i18n";

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

class ColumnDetailsCategorical extends Component {
  static propTypes = {
    columnDetails: categeoricalColumnDetailsShape
  };

  render() {
    const { id, uniqueOptions, frequencies } = this.props.columnDetails;
    barData.labels = uniqueOptions && Object.values(uniqueOptions);
    barData.datasets[0].data = barData.labels.map(option => {
      return frequencies[option];
    });
    barData.datasets[0].label = id;

    const maxLabelsInHistogram = 5;

    return (
      <div>
        <div style={styles.bold}>{I18n.t("columnDetailsInformation")}</div>
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
              {I18n.t("columnDetailsTooManyLabels", {
                "labelCount": barData.labels.length,
                "maxLabelCount": maxLabelsInHistogram
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    columnDetails: getCategoricalColumnDetails(state)
  })
)(ColumnDetailsCategorical);
