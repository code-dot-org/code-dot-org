/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import { readyToTrain } from "../redux";
import { styles } from "../constants";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import labBackground from "@public/images/lab-background-light.png";
import DataTable from "./DataTable";

const framesPerCycle = 40;

class TrainModel extends Component {
  static propTypes = {
    data: PropTypes.array,
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

    const animationTimer = setInterval(
      this.updateAnimation.bind(this),
      1000 / 30
    );

    this.setState({ animationTimer });
  };

  updateAnimation = () => {
    this.setState({ frame: this.state.frame + 1 });
  };

  componentWillUnmount = () => {
    if (this.state.animationTimer) {
      clearInterval(this.state.animationTimer);
      this.setState({ animationTimer: undefined });
    }
  };

  getAnimationProgess = () => {
    return (this.state.frame % framesPerCycle) / framesPerCycle;
  };

  getAnimationStep = () => {
    return Math.floor(this.state.frame / framesPerCycle);
  };

  render() {
    const translateX = 15 + this.getAnimationProgess() * (50 - 15);
    const translateY = 50 - Math.sin(this.getAnimationProgess() * Math.PI) * 30;
    const rotateZ = this.getAnimationProgess() * 60;
    const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;

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

        <div style={{ overflow: "hidden", paddingTop: 20 }}>
          <div style={{ width: "30%", overflow: "hidden", opacity: 0.3 }}>
            <DataTable
              reducedColumns={true}
              startingRow={this.getAnimationStep()}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: translateY + "%",
              left: translateX + "%",
              transformOrigin: "center center",
              transform: transform
            }}
          >
            <DataTable
              reducedColumns={true}
              singleRow={this.getAnimationStep()}
            />
          </div>
        </div>

        {this.props.readyToTrain && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-25%)"
            }}
          >
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
  selectedFeatures: state.selectedFeatures
}))(TrainModel);
