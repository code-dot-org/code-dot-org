/* React component to handle toggling between correct/incorrect test results */
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setResultsTab } from "../redux";
import { ResultsGrades, styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import I18n from "../i18n";

function ResultsToggle({ resultsTab, setResultsTab }) {
  const getTogglePillStyle = key => {
    let style;
    if (key === resultsTab) {
      style = { ...styles.pill, ...styles.selectedPill };
    } else {
      style = styles.pill;
    }
    return style;
  };

  const resultsTabs = [
    {
      key: ResultsGrades.CORRECT,
      headerText: I18n.t("correctAnswer"),
      icon: faCheck,
      iconStyle: styles.correct
    },
    {
      key: ResultsGrades.INCORRECT,
      headerText: I18n.t("incorrectAnswer"),
      icon: faTimes,
      iconStyle: styles.error
    }
  ];

  return (
    <div>
      <div style={styles.resultsToggle}>
        {resultsTabs.map(tab => (
          <div
            key={tab.key}
            style={getTogglePillStyle(tab.key)}
            onClick={() => setResultsTab(tab.key)}
            onKeyDown={() => setResultsTab(tab.key)}
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

ResultsToggle.propTypes = {
  resultsTab: PropTypes.string,
  setResultsTab: PropTypes.func
};

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
