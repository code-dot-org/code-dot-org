/* React component to handle showing warning for excessive unique options. */
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { styles, UNIQUE_OPTIONS_MAX } from "../constants";
import {
  hasTooManyUniqueOptions
} from "../selectors/currentColumnSelectors";
import I18n from "../i18n";

function UniqueOptionsWarning({ showWarning }) {
  if (!showWarning) {
    return null;
  }

  return (
    <div>
      <div style={styles.bold}>{I18n.t("uniqueOptionsWarningNotice")}</div>
      <div>
        {I18n.t("uniqueOptionsWarningMessage", {"valueCount": UNIQUE_OPTIONS_MAX})}
      </div>
    </div>
  );
}

UniqueOptionsWarning.propTypes = {
  showWarning: PropTypes.bool
};

export default connect(
  state => ({
    showWarning: hasTooManyUniqueOptions(state)
  })
)(UniqueOptionsWarning);
