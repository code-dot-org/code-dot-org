/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { UnconnectedStatement } from "./Statement";
import { setShowResultsDetails, setResultsPhase } from "../redux";
import ResultsDetails from "./ResultsDetails";

class Results extends Component {
  static propTypes = {
    historicResults: PropTypes.array,
    showResultsDetails: PropTypes.bool,
    setShowResultsDetails: PropTypes.func,
    setResultsPhase: PropTypes.func
  };

  componentDidMount() {
    this.props.setResultsPhase(0);
    setTimeout(() => {
      this.props.setResultsPhase(1);
    }, 1000);
  }

  showDetails = () => {
    this.props.setShowResultsDetails(true);
  };

  render() {
    const { historicResults, showResultsDetails } = this.props;

    return (
      <div style={styles.resultsPanelContainer}>
        {showResultsDetails && <ResultsDetails />}

        <div id="results" style={styles.panel}>
          <div style={styles.scrollableContents}>
            <div style={styles.scrollingContents}>
              <div style={styles.largeText}>Results</div>
              {historicResults.map((historicResult, index) => {
                return (
                  <div key={index}>
                    <div style={styles.resultsStatement}>
                      <UnconnectedStatement
                        shouldShow={true}
                        smallFont={true}
                        labelColumn={historicResult.label}
                        selectedFeatures={historicResult.features}
                      />
                    </div>
                    <div style={styles.resultsAccuracy}>
                      {historicResult.accuracy}%
                    </div>
                    {index === 0 && (
                      <div style={styles.resultsDetailsButtonContainer}>
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
    setResultsPhase(phase) {
      dispatch(setResultsPhase(phase));
    },
    setShowResultsDetails(show) {
      dispatch(setShowResultsDetails(show));
    }
  })
)(Results);
