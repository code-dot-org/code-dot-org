/* React component to handle selecting a column as the label. */
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { styles } from "../constants";
import { setLabelColumn } from "../redux";
import I18n from "../i18n";

function SelectLabelButton({ column, setLabelColumn }) {
  const setPredictColumn = (event, column) => {
    setLabelColumn(column);
    event.preventDefault();
  };

  return (
    <button
      id="uitest-select-label-button"
      type="button"
      onClick={event => setPredictColumn(event, column)}
      style={styles.selectLabelButton}
    >
      {I18n.t("selectLabelButton")}
    </button>
  );
}

SelectLabelButton.propTypes = {
  column: PropTypes.string,
  setLabelColumn: PropTypes.func.isRequired
};

export default connect(
  state => ({}),
  dispatch => ({
    setLabelColumn(column) {
      dispatch(setLabelColumn(column));
    }
  })
)(SelectLabelButton);
