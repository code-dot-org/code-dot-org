/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import { readyToTrain } from "../redux";
import { styles } from "../constants";
import aiBotClosed from "@public/images/ai-bot/ai-bot-closed.png";
import aiBotYes from "@public/images/ai-bot/ai-bot-yes.png";
import aiBotNo from "@public/images/ai-bot/ai-bot-no.png";
import blueScanner from "@public/images/ai-bot/blue-scanner.png";
import resultsBackground from "@public/images/results-background-light.png";
import Statement from "./Statement";
import DataTable from "./DataTable";
import ResultsTable from "./ResultsTable";

const framesPerCycle = 80;
const numItems = 6;

class GenerateResults extends Component {
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

  getAnimationSubstep = () => {
    return this.state.frame % framesPerCycle;
  };

  updateAnimation = () => {
    if (this.state.frame === 15) {
      this.setState({ headOpen: true });
    }

    if (this.getAnimationStep() >= numItems) {
      this.setState({ headOpen: false });
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
    const translateX = 30 + this.getAnimationProgess() * 40;
    const translateY = 15;
    const rotateZ = 20 + this.getAnimationProgess() * -20;
    const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;

    const hideLabel = this.getAnimationSubstep() < framesPerCycle / 2;

    const showAnimation = this.getAnimationStep() < numItems;

    return (
      <div
        id="train-model"
        style={{
          ...styles.panel,
          justifyContent: "center",
          backgroundSize: "cover",
          //backgroundImage: "url(" + resultsBackground + ")"
        }}
      >
        <div style={styles.statement}>Testing accuracy</div>

        <div style={styles.generateResultsContainer}>
          <div style={styles.generateResultsDataTable}>

            <svg
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                width: "30%",
                height: 40,
                paddingTop: 32,
                zIndex: 1
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="1 0 6 1"
            >
              <path d="M 8 0 L 7 1 L 6 0 L 5 1 L 4 0 L 3 1 L 2 0 L 1 1 L 0 0 L 8 0" fill="#fff"/>
            </svg>

            <DataTable
              reducedColumns={true}
              startingRow={this.getAnimationStep()}
              noLabel={true}
            />
          </div>

          {showAnimation && (
            <div
              style={{
                position: "absolute",
                transformOrigin: "center center",
                bottom: translateY + "%",
                left: translateX + "%",
                transform: transform,
              }}
            >
              <DataTable
                reducedColumns={true}
                singleRow={this.getAnimationStep()}
                hideLabel={hideLabel}
              />
            </div>
          )}
        </div>

        {this.props.readyToTrain && (
          <div style={styles.generateResultsBotContainer}>
            <div style={{ ...styles.trainBot, margin: "0 auto" }}>
              <div>
                <img src={aiBotClosed} style={styles.trainBotBody} />
              </div>
              <div style={{width: 150}}>
                <img src={blueScanner} style={{width: "100%"}} />
              </div>
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
}))(GenerateResults);
