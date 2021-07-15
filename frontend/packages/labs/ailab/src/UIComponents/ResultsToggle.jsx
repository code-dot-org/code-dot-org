/* React component to handle toggling between correct/incorrect test results */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setResultsTab } from "../redux";
import { ResultsGrades, styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

const resultsTabs = [
  {
    key: ResultsGrades.CORRECT,
    headerText: "Correct",
    icon: faCheck,
    iconStyle: styles.correct
  },
  {
    key: ResultsGrades.INCORRECT,
    headerText: "Incorrect",
    icon: faTimes,
    iconStyle: styles.error
  }
];

class ResultsToggle extends Component {
  static propTypes = {
    resultsTab: PropTypes.string,
    setResultsTab: PropTypes.func
  };

  getTogglePillStyle = key => {
    let style;
    if (key === this.props.resultsTab) {
      style = { ...styles.pill, ...styles.selectedPill };
    } else {
      style = styles.pill;
    }
    return style;
  };

  render() {
    return (
      <div>
        <div style={styles.resultsToggle}>
          {resultsTabs.map(tab => (
            <div
              key={tab.key}
              style={this.getTogglePillStyle(tab.key)}
              onClick={() => this.props.setResultsTab(tab.key)}
              onKeyDown={() => this.props.setResultsTab(tab.key)}
              role="button"
              tabIndex={0}
            >
              <FontAwesomeIcon icon={tab.icon} style={tab.iconStyle} />{" "}
              {tab.headerText}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    resultsTab: state.resultsTab
  }),
  dispatch => ({
    setResultsTab(key) {
      dispatch(setResultsTab(key));
    }
  })
)(ResultsToggle);
