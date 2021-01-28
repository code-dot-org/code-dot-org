/* React component to render a special kind of crosstab table. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getCrossTabData } from "../redux";
import { ColumnTypes, styles } from "../constants.js";

class CrossTab extends Component {
  static propTypes = {
    crossTabData: PropTypes.object
  };

  getCellStyle = percent => {
    return {
      ...styles["crossTabCell" + Math.round(percent / 20)],
      ...styles.dataDisplayCell
    };
  };
  render() {
    const { crossTabData } = this.props;

    return (
      <div id="cross-tab">
        <div style={styles.validationMessagesLight}>
          {crossTabData && (
            <table>
              <thead>
                <tr>
                  <th colSpan={crossTabData.featureNames.length}>&nbsp;</th>
                  <th colSpan={crossTabData.uniqueLabelValues.length}>
                    {crossTabData.labelName}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {crossTabData.featureNames.map((featureName, index) => {
                    return <td key={index}>{featureName}</td>;
                  })}

                  {crossTabData.uniqueLabelValues.map(
                    (uniqueLabelValue, index) => {
                      return (
                        <td key={index} style={styles.dataDisplayCell}>
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
                          return <td key={featureIndex}>{featureValue}</td>;
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
                              {/*
                            {result.labelCounts[uniqueLabelValue]}
                            */}
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
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  crossTabData: getCrossTabData(state)
}))(CrossTab);
