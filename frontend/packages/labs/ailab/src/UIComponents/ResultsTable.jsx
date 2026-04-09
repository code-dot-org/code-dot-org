/* React component to handle displaying test data and A.I. Bot's guesses. */
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { connect } from "react-redux";
import { isRegression, setResultsHighlightRow } from "../redux";
import { styles, colors, REGRESSION_ERROR_TOLERANCE } from "../constants";
import { resultsPropType } from "./shapes";
import I18n from "../i18n";
import { getLocalizedColumnName } from "../helpers/columnDetails.js";

function ResultsTable({ selectedFeatures, labelColumn, results, isRegression: isRegressionMode, setResultsHighlightRow, resultsHighlightRow, datasetId }) {
  const getRowCellStyle = useCallback((index) => {
    return {
      ...styles.tableCell,
      ...(index === resultsHighlightRow &&
        styles.resultsCellHighlight)
    };
  }, [resultsHighlightRow]);

  const featureCount = selectedFeatures.length;

  return (
    <div style={styles.panel}>
      {isRegressionMode && (
        <div style={styles.smallTextRight}>
          {I18n.t(
            "resultsTablePredictionRange",
            {"percentage": REGRESSION_ERROR_TOLERANCE}
          )}
        </div>
      )}

      <div style={styles.tableParent}>
        <table style={styles.displayTable}>
          <thead>
            <tr>
              <th
                colSpan={featureCount}
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader
                }}
              >
                {I18n.t("resultsTableFeatureHeader")}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader
                }}
              >
                {I18n.t("resultsTableActualValueHeader")}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader
                }}
              >
                {I18n.t("resultsTablePredictedValueHeader")}
              </th>
            </tr>
            <tr>
              {selectedFeatures.map((feature, index) => {
                return (
                  <th
                    style={{
                      ...styles.tableHeader,
                      backgroundColor: colors.feature,
                      ...styles.resultsTableSecondHeader
                    }}
                    key={index}
                  >
                    {getLocalizedColumnName(datasetId, feature)}
                  </th>
                );
              })}
              <th
                style={{
                  ...styles.tableHeader,
                  backgroundColor: colors.label,
                  ...styles.resultsTableSecondHeader
                }}
              >
                {getLocalizedColumnName(datasetId, labelColumn)}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  backgroundColor: colors.label,
                  ...styles.resultsTableSecondHeader
                }}
              >
                {getLocalizedColumnName(datasetId, labelColumn)}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.examples.map((examples, index) => {
              return (
                <tr
                  key={index}
                  onMouseEnter={() => setResultsHighlightRow(index)}
                  onMouseLeave={() => setResultsHighlightRow(undefined)}
                >
                  {examples.map((example, i) => {
                    return (
                      <td style={getRowCellStyle(index)} key={i}>
                        {example}
                      </td>
                    );
                  })}
                  <td style={getRowCellStyle(index)}>
                    {results.labels[index]}
                  </td>
                  <td style={getRowCellStyle(index)}>
                    {results.predictedLabels[index]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ResultsTable.propTypes = {
  selectedFeatures: PropTypes.array,
  labelColumn: PropTypes.string,
  results: resultsPropType,
  isRegression: PropTypes.bool,
  setResultsHighlightRow: PropTypes.func,
  resultsHighlightRow: PropTypes.number,
  datasetId: PropTypes.string
};

export default connect(
  state => ({
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    isRegression: isRegression(state),
    resultsHighlightRow: state.resultsHighlightRow,
    datasetId: state.metadata && state.metadata.name
  }),
  dispatch => ({
    setResultsHighlightRow(column) {
      dispatch(setResultsHighlightRow(column));
    }
  })
)(ResultsTable);
