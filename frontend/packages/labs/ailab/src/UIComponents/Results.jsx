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
import { UnconnectedStatement } from "./Statement";
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
    setResultsPhase: PropTypes.func,
    historicResults: PropTypes.array
  };

  render() {
    return (
      <div id="results" style={styles.panel}>
        {this.props.historicResults.map(historicResult => {
          return (
            <div>
              <div style={{float: "left", width: "80%"}}>
                <UnconnectedStatement
                  shouldShow={true}
                  labelColumn={historicResult.label}
                  selectedFeatures={historicResult.features}
                />
              </div>
              <div style={{float: "left", fontSize: 32}}>{historicResult.accuracy}%</div>
            </div>
          );
        })}
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
    resultsPhase: state.resultsPhase,
    historicResults: state.historicResults
  }),
  dispatch => ({
    setResultsPhase(phase) {
      dispatch(setResultsPhase(phase));
    }
  })
)(Results);
