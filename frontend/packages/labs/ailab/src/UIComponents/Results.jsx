/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getConvertedAccuracyCheckExamples,
  getConvertedLabels,
  getSummaryStat,
  setResultsPhase
} from "../redux";
import { styles } from "../constants";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import ResultsTable from "./ResultsTable";

class Results extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    percentDataToReserve: PropTypes.number,
    summaryStat: PropTypes.object,
    accuracyCheckExamples: PropTypes.array,
    accuracyCheckLabels: PropTypes.array,
    accuracyCheckPredictedLabels: PropTypes.array,
    resultsPhase: PropTypes.number,
    setResultsPhase: PropTypes.func
  };

  componentDidMount() {
    this.props.setResultsPhase(0);
    setTimeout(() => {
      this.props.setResultsPhase(1);
    }, 1000);
    setTimeout(() => {
      this.props.setResultsPhase(2);
    }, 2000);
    setTimeout(() => {
      this.props.setResultsPhase(3);
    }, 3000);
  }

  render() {
    return (
      <div id="results" style={styles.panel}>
        {this.props.resultsPhase === 0 && (
          <div style={{ ...styles.trainBot, margin: "0 auto" }}>
            <img
              src={aiBotHead}
              style={{
                ...styles.trainBotHead,
                ...(false && styles.trainBotOpen)
              }}
            />
            <img src={aiBotBody} style={styles.trainBotBody} />
          </div>
        )}

        {this.props.resultsPhase >= 1 &&
          !isNaN(this.props.summaryStat.stat) && (
            <div>
              {this.props.percentDataToReserve}% of the training data was
              reserved to test the accuracy of the newly trained model.
            </div>
          )}

        {this.props.resultsPhase >= 1 && !isNaN(this.props.summaryStat.stat) && (
          <div style={styles.scrollableContentsTinted}>
            <div style={styles.scrollingContents}>
              <ResultsTable />
            </div>
          </div>
        )}

        <div style={{ opacity: this.props.resultsPhase >= 2 ? 1 : 0 }}>
          {isNaN(this.props.summaryStat.stat) && (
            <p>
              An accuracy score was not calculated because no training data was
              reserved for testing.
            </p>
          )}
          <div>
            {!isNaN(this.props.summaryStat.stat) && (
              <div>
                <div style={styles.mediumText}>
                  Accuracy
                </div>
                <div style={styles.contents}>
                  {this.props.summaryStat.stat}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedFeatures: state.selectedFeatures,
    labelColumn: state.labelColumn,
    summaryStat: getSummaryStat(state),
    accuracyCheckExamples: getConvertedAccuracyCheckExamples(state),
    accuracyCheckLabels: getConvertedLabels(state, state.accuracyCheckLabels),
    accuracyCheckPredictedLabels: getConvertedLabels(
      state,
      state.accuracyCheckPredictedLabels
    ),
    percentDataToReserve: state.percentDataToReserve,
    resultsPhase: state.resultsPhase
  }),
  dispatch => ({
    setResultsPhase(phase) {
      dispatch(setResultsPhase(phase));
    }
  })
)(Results);
