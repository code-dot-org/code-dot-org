/* React component to render a special kind of crosstab table, with a row for each
 * active combination of features values, and corresponding percentage of label
 * values, with a heatmap style applied. */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getCrossTabData } from "../redux";
import { styles } from "../constants.js";

class CrossTab extends Component {
  static propTypes = {
    crossTabData: PropTypes.object
  };

  getCellStyle = percent => {
    return {
      ...styles["crossTabCell" + Math.round(percent / 20)],
      ...styles.crossTabTableCell
    };
  };

  render() {
    const { crossTabData } = this.props;

    // There are a few criteria that affect how big the table looks.  We'll not
    // render it if any of them are exceeded.
    // First, how many columns are there on the left side.
    const maxFeaturesInTable = 5;
    // Second, how many columns are there in the main table.
    const maxUniqueLabelValues = 5;
    // Third, how many rows are there.
    const maxResults = 5;

    const showTable =
      crossTabData &&
      crossTabData.featureNames.length <= maxFeaturesInTable &&
      crossTabData.uniqueLabelValues.length <= maxUniqueLabelValues &&
      crossTabData.results.length <= maxResults;

    return (
      <div id="cross-tab">
        {crossTabData && !showTable && (
          <div>
            <div style={styles.bold}>Relationship information:</div>

            <div>
              The currently-selected data is too large to show in a table.
            </div>
          </div>
        )}

        {showTable && (
          <div>
            <div style={styles.bold}>Relationship information:</div>
            <div style={styles.scrollableContents}>
              <div style={styles.scrollingContents}>
                <table style={styles.crossTabTable}>
                  <thead>
                    <tr>
                      <th style={styles.crosssTabHeader} />
                      <th
                        style={styles.crosssTabHeader}
                        colSpan={crossTabData.featureNames.length}
                      >
                        &nbsp;
                      </th>
                      <th
                        colSpan={crossTabData.uniqueLabelValues.length}
                        style={{ ...styles.crosssTabHeader, ...styles.bold }}
                      >
                        {crossTabData.labelName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          ...styles.bold,
                          ...styles.crossTabLeftColumn
                        }}
                        rowSpan={crossTabData.results.length + 1}
                      >
                        {crossTabData.featureNames[0]}
                      </td>
                      <td />
                      {crossTabData.uniqueLabelValues.map(
                        (uniqueLabelValue, index) => {
                          return (
                            <td key={index} style={styles.tableCell}>
                              {uniqueLabelValue}
                            </td>
                          );
                        }
                      )}
                    </tr>
                    {crossTabData.results.map((result, resultIndex) => {
                      return (
                        <tr key={resultIndex}>
                          {result.featureValues.map(
                            (featureValue, featureIndex) => {
                              return (
                                <td key={featureIndex} style={styles.tableCell}>
                                  {featureValue}
                                </td>
                              );
                            }
                          )}
                          {crossTabData.uniqueLabelValues.map(
                            (uniqueLabelValue, labelIndex) => {
                              return (
                                <td
                                  key={labelIndex}
                                  style={this.getCellStyle(
                                    result.labelPercents[uniqueLabelValue]
                                  )}
                                >
                                  {result.labelPercents[uniqueLabelValue] || 0}%
                                </td>
                              );
                            }
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  crossTabData: getCrossTabData(state)
}))(CrossTab);
