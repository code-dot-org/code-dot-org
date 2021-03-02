/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train, { availableTrainers } from "../train";
import { readyToTrain } from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";

class TrainModel extends Component {
  static propTypes = {
    readyToTrain: PropTypes.bool,
    modelSize: PropTypes.number,
  };

  componentDidMount() {
    this.onClickTrainModel();
  }

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();
  };

  render() {
    return (
      <div id="train-model" style={styles.panel}>
        {this.props.readyToTrain && (
          <div>
            {!this.props.modelSize && <FontAwesomeIcon icon={faSpinner} />}
            <div style={{ ...styles.trainBot, margin: "0 auto" }}>
              <img
                src={aiBotHead}
                style={{
                  ...styles.trainBotHead,
                  ...(false && styles.trainBotOpen),
                }}
              />
              <img src={aiBotBody} style={styles.trainBotBody} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect((state) => ({
  readyToTrain: readyToTrain(state),
  modelSize: state.modelSize,
}))(TrainModel);
