/* React component to handle displaying a model summary. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getSummaryStat } from "../redux";
import { saveMessages, styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";

class ModelSummary extends Component {
  static propTypes = {
    saveStatus: PropTypes.string,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    summaryStat: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  // Display text with a typewritter effect.
  typeWriter(text, htmlID) {
    let i = 0;
    const msDelay = 65;

    let typeWriterHelper = () => {
      if (i >= text.length) {
        return;
      }

      document.getElementById(htmlID).innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriterHelper, msDelay);
    };

    typeWriterHelper();
  }

  componentDidMount() {
    // Add a timer to simulate loading when saving a model.
    let loadSpinner = () => this.setState({ isLoading: false });
    setTimeout(loadSpinner, 2000);

    const text = `A.I. predicted ${
      this.props.labelColumn
    } based on ${this.props.selectedFeatures.join(", ")} with ${
      this.props.summaryStat.stat
    }% accuracy.`;
    this.typeWriter(text, "bot-text");
  }

  render() {
    const { saveStatus } = this.props;

    let loadStatus = this.state.isLoading ? (
      <FontAwesomeIcon icon={faSpinner} />
    ) : (
      saveMessages[saveStatus]
    );

    return (
      <div style={styles.panel}>
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
        <p
          id="bot-text"
          style={{ ...styles.statement, ...styles.botTextContainer }}
        />
        <div>
          {saveStatus === "success" && (
            <div style={{ position: "absolute", bottom: 0 }}>{loadStatus}</div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  saveStatus: state.saveStatus,
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  summaryStat: getSummaryStat(state)
}))(ModelSummary);
