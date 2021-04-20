/* React component to handle displaying a model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { saveMessages, styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class ModelSummary extends Component {
  static propTypes = {
    saveStatus: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    // Add a timer to simulate loading when saving a model.
    let loadSpinner = () => this.setState({ isLoading: false });
    setTimeout(loadSpinner, 2000);
  }

  render() {
    const { saveStatus } = this.props;

    let loadStatus = this.state.isLoading ? (
      <FontAwesomeIcon icon={faSpinner} />
    ) : (
      saveMessages[saveStatus]
    );

    return (
      <div style={{ ...styles.panel }}>
        {saveStatus === "success" && (
          <div style={{ ...styles.largeText, textAlign: "center" }}>
            {loadStatus}
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  saveStatus: state.saveStatus
}))(ModelSummary);
