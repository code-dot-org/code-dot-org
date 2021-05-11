/* React component to handle toggling between correct/incorrect test results */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getCorrectResults, getIncorrectResults } from "../redux";
import ResultsTable from "./ResultsTable";
import { ResultsGrades, styles } from "../constants";

const resultsTabs = [
  {
    key: ResultsGrades.CORRECT,
    headerText: "Correct",
    icon: ""
  },
  {
    key: ResultsGrades.INCORRECT,
    headerText: "Incorrect",
    icon: ""
  },
];

class ResultsToggle extends Component {
  static propTypes = {
    correctResults: PropTypes.array,
    incorrectResults: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      tab: ResultsGrades.CORRECT
    };
  }

  toggleTo = tab => {
    this.setState({tab: tab})
  };

  getTogglePillStyle = key => {
    let style;
    if (key === this.state.tab) {
      style = {...styles.pill, ...styles.selectedPill};
    } else {
      style = styles.pill;
    }
    return style;
  };

  render() {
    const results =
      this.state.tab === ResultsGrades.CORRECT
        ? this.props.correctResults
        : this.props.incorrectResults;

    return (
      <div>
        <div style={styles.resultsToggle}>
          {resultsTabs.map(tab => (
            <div
              key={tab.key}
              style={this.getTogglePillStyle(tab.key)}
              onClick={() => this.toggleTo(tab.key)}
            >
              {tab.headerText}
            </div>
          ))}
        </div>
        <ResultsTable results={results} />
      </div>

    );
  }
}

export default connect(state => ({
  correctResults: getCorrectResults(state),
  incorrectResults: getIncorrectResults(state)
}))(ResultsToggle);
