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
import Statement from "./Statement";
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
    animationTimer: undefined,
    headOpen: false
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
    if (this.state.frame === 15) {
      this.setState({ headOpen: true });
    }

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
    const translateX = 15 + this.getAnimationProgess() * (100 - 15);
    const translateY = 50 - Math.sin(this.getAnimationProgess() * Math.PI) * 30;
    const rotateZ = this.getAnimationProgess() * 60;
    const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;

    return (
      <div
        id="train-model"
        style={{
          ...styles.panel,
          justifyContent: "center",
          backgroundSize: "cover",
          backgroundImage: "url(" + labBackground + ")"
        }}
      >
        <Statement/>

        <div style={styles.trainModelDataTable}>
          <DataTable
            reducedColumns={true}
            startingRow={this.getAnimationStep()}
          />
        </div>

        <div style={styles.trainModelContainer}>

          <div
            style={{
              position: "absolute",
              transformOrigin: "center center",
              top: translateY + "%",
              left: translateX + "%",
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
          <div style={styles.trainModelBotContainer}>
            <div style={{ ...styles.trainBot, margin: "0 auto" }}>
              <img
                src={aiBotHead}
                style={{
                  ...styles.trainBotHead,
                  ...(this.state.headOpen && styles.trainBotOpen)
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
