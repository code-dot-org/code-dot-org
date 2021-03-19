/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import { readyToTrain } from "../redux";
import { styles } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import labBackground from "@public/images/lab-background-light.png";

class TrainModel extends Component {
  static propTypes = {
    readyToTrain: PropTypes.bool,
    modelSize: PropTypes.number,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array
  };

  state = {
    frame: 0,
    animationTimer: undefined
  };

  componentDidMount() {
    this.onClickTrainModel();
  }

  onClickTrainModel = () => {
    train.init();
    train.onClickTrain();

    const animationTimer = setInterval(this.updateAnimation.bind(this), 1000 / 30);

    this.setState({animationTimer});

    //this.start = undefined;
    //window.requestAnimationFrame(this.animationFrame);
  };

  updateAnimation = () => {
    this.setState({ frame: this.state.frame + 1 });
  };

  componentWillUnmount = () => {
    if (this.state.animationTimer) {
      clearInterval(this.state.animationTimer);
      this.setState({animationTimer: undefined})
    }
  }

  getAnimationProgess = () => {
    const framesPerCycle = 40;
    return (this.state.frame % framesPerCycle) / framesPerCycle;
  };

  render() {
    const translateX = this.getAnimationProgess() * 40;
    const translateY = 50 - Math.sin(this.getAnimationProgess() * Math.PI) * 30;
    const rotateZ = this.getAnimationProgess() * 60;
    const transform = `rotateZ(${rotateZ}deg)`;

    return (
      <div
        id="train-model"
        style={{
          ...styles.panel,
          justifyContent: "center",
          backgroundImage: "url(" + labBackground + ")",
          backgroundSize: "cover"
        }}
      >

        <div style={styles.statement}>
          Predict{" "}
          <span style={styles.statementLabel}>
            {this.props.labelColumn || "..."}
          </span>
          <span>
            {" "}
            based on{" "}
            <span style={styles.statementFeature}>
              {this.props.selectedFeatures.length > 0
                ? this.props.selectedFeatures.join(", ")
                : ".."}
            </span>
            {"."}
          </span>
        </div>

        <div style={{ width: "100%", height: "100%", position: "absolute" }}>
          <div
            style={{
              position: "absolute",
              top: translateY + "%",
              left: translateX + "%",
              transformOrigin: "center center",
              transform: transform
            }}
          >
            <table
              style={{
                ...styles.displayTable,
                width: "initial",
                backgroundColor: "white"
              }}
            >
              <tbody>
                <tr>
                  <td style={{...styles.tableCell, ...styles.selectLabelText}}>first</td>
                  <td style={styles.tableCell}>second</td>
                  <td style={{...styles.tableCell, ...styles.selectFeaturesText}}>third</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {this.props.readyToTrain && (
          <div>
            {false && !this.props.modelSize && (
              <FontAwesomeIcon icon={faSpinner} />
            )}
            <div style={{ ...styles.trainBot, margin: "0 auto" }}>
              <img
                src={aiBotHead}
                style={{
                  ...styles.trainBotHead,
                  ...(true && styles.trainBotOpen)
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

export default connect(state => ({
  readyToTrain: readyToTrain(state),
  modelSize: state.modelSize,
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
}))(TrainModel);
