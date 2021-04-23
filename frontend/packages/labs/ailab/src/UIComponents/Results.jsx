/* React component to handle displaying accuracy results. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setResultsPhase } from "../redux";
import { styles } from "../constants";
import { UnconnectedStatement } from "./Statement";

class Results extends Component {
  static propTypes = {
    resultsPhase: PropTypes.number,
    setResultsPhase: PropTypes.func,
    historicResults: PropTypes.array
  };

  render() {
    const { historicResults } = this.props;

    return (
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
                  <div style={{ float: "left", fontSize: 18 }}>
                    {historicResult.accuracy}%
                  </div>
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
    );
  }
}

export default connect(
  state => ({
    resultsPhase: state.resultsPhase,
    historicResults: state.historicResults
  }),
  dispatch => ({
    setResultsPhase(phase) {
      dispatch(setResultsPhase(phase));
    }
  })
)(Results);
