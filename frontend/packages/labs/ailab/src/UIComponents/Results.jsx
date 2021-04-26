/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { UnconnectedStatement } from "./Statement";
import { setShowResultsDetails } from "../redux";
import ResultsDetails from "./ResultsDetails";

class Results extends Component {
  static propTypes = {
    historicResults: PropTypes.array,
    showResultsDetails: PropTypes.bool,
    setShowResultsDetails: PropTypes.func
  };

  showDetails = () => {
    this.props.setShowResultsDetails(true);
  };

  render() {
    const { historicResults, showResultsDetails } = this.props;

    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {showResultsDetails && <ResultsDetails />}

        <div id="results" style={styles.panel}>
          <div style={styles.scrollableContents}>
            <div style={styles.scrollingContents}>
              {historicResults.map((historicResult, index) => {
                return (
                  <div key={index}>
                    <div style={{ float: "left", width: "80%" }}>
                      <UnconnectedStatement
                        shouldShow={true}
                        smallFont={true}
                        labelColumn={historicResult.label}
                        selectedFeatures={historicResult.features}
                      />
                    </div>
                    <div style={{ float: "left", fontSize: 18, width: "10%" }}>
                      {historicResult.accuracy}%
                    </div>
                    {index === 0 && (
                      <div style={{ float: "left", textAlign: "center", width: "10%" }}>
                        <button
                          type="button"
                          onClick={this.showDetails}
                          style={styles.resultsDetailsButton}
                        >
                          Details
                        </button>
                      </div>
                    )}
                    {index === 0 && historicResults.length > 1 && (
                      <div
                        style={{
                          ...styles.resultsPreviousHeading,
                          ...styles.italic
                        }}
                      >
                        Previous results
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    historicResults: state.historicResults,
    showResultsDetails: state.showResultsDetails
  }),
  dispatch => ({
    setShowResultsDetails(show) {
      dispatch(setShowResultsDetails(show));
    }
  })
)(Results);
