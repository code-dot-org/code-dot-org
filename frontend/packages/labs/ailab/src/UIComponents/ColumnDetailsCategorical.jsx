/* React component to handle showing details of categorical columns. */
import { connect } from "react-redux";
import { colors, styles } from "../constants";
import { Bar } from "react-chartjs-2";
import { categeoricalColumnDetailsShape } from "./shapes";
import {
  getCategoricalColumnDetails
} from "../selectors/currentColumnSelectors";
import I18n from "../i18n";

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

function ColumnDetailsCategorical({ columnDetails }) {
  const { id, uniqueOptions, frequencies } = columnDetails;
  const labels = uniqueOptions && Object.values(uniqueOptions);
  const barData = {
    labels,
    datasets: [
      {
        label: id,
        backgroundColor: colors.tealTransparent,
        borderColor: colors.teal,
        borderWidth: 1,
        hoverBackgroundColor: "#59cad3",
        hoverBorderColor: "white",
        data: labels.map(option => frequencies[option])
      }
    ]
  };

  const maxLabelsInHistogram = 5;

  return (
    <div>
      <div style={styles.bold}>{I18n.t("columnDetailsInformation")}</div>
      <div style={styles.barChart}>
        {labels.length <= maxLabelsInHistogram && (
          <Bar
            data={barData}
            width={100}
            height={150}
            options={chartOptions}
          />
        )}
        {labels.length > maxLabelsInHistogram && (
          <div>
            {I18n.t("columnDetailsTooManyLabels", {
              "labelCount": labels.length,
              "maxLabelCount": maxLabelsInHistogram
            })}
          </div>
        )}
      </div>
    </div>
  );
}

ColumnDetailsCategorical.propTypes = {
  columnDetails: categeoricalColumnDetailsShape
};

export default connect(
  state => ({
    columnDetails: getCategoricalColumnDetails(state)
  })
)(ColumnDetailsCategorical);
