/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { UnconnectedStatement } from "./Statement";
import { setShowResultsDetails, setResultsPhase } from "../redux";
import ResultsDetails from "./ResultsDetails";
import ScrollableContent from "./ScrollableContent";
import I18n from "../i18n";

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
          <ScrollableContent>
            <div style={styles.largeText}>
              <div style={styles.resultsHeader}>{I18n.t("resultsHeader")}</div>
              <div style={styles.resultsHeaderAccuracy}>{I18n.t("resultsAccuracy")}</div>
            </div>
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
                  <div style={{ ...styles.resultsAccuracy, ...styles.bold }}>
                    {historicResult.accuracy}%
                  </div>
                  {index === 0 && (
                    <div style={styles.resultsDetailsButtonContainer}>
                      <button
                        id="uitest-details-button"
                        type="button"
                        onClick={this.showDetails}
                        style={styles.resultsDetailsButton}
                      >
                        {I18n.t("resultsDetailsButton")}
                      </button>
                    </div>
                  )}
                  {index === 0 && historicResults.length > 1 && (
                    <div
                      style={{
                        ...styles.largeText,
                        clear: "both",
                        paddingTop: 40
                      }}
                    >
                      <div style={styles.resultsHeader}>
                        {I18n.t("resultsPreviousResults")}
                      </div>
                      <div style={styles.resultsHeaderAccuracy}>
                        {I18n.t("resultsAccuracy")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollableContent>
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
