/* React component to handle selecting columns as features. */
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { styles } from "../constants";
import { addSelectedFeature } from "../redux";
import I18n from "../i18n";

function AddFeatureButton({ column, addSelectedFeature }) {
  const addFeature = (event, column) => {
    addSelectedFeature(column);
    event.preventDefault();
  };

  return (
    <button
      id="uitest-add-feature-button"
      type="button"
      onClick={event => addFeature(event, column)}
      style={styles.selectFeaturesButton}
    >
      {I18n.t("addFeatureButton")}
    </button>
  );
}

AddFeatureButton.propTypes = {
  column: PropTypes.string,
  addSelectedFeature: PropTypes.func.isRequired
};

export default connect(
  state => ({}),
  dispatch => ({
    addSelectedFeature(column) {
      dispatch(addSelectedFeature(column));
    }
  })
)(AddFeatureButton);
