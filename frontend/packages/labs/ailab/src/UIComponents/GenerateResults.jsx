/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import train from "../train";
import { readyToTrain } from "../redux";
import { styles, getFadeOpacity } from "../constants";
import aiBotClosed from "@public/images/ai-bot/ai-bot-closed.png";
//import aiBotYes from "@public/images/ai-bot/ai-bot-yes.png";
//import aiBotNo from "@public/images/ai-bot/ai-bot-no.png";
import blueScanner from "@public/images/ai-bot/blue-scanner.png";
import redScanner from "@public/images/ai-bot/red-scanner.png";
import resultsBackground from "@public/images/results-background-light.png";
import DataTable from "./DataTable";

const framesPerCycle = 80;
const numItems = 12;

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
    let amount = (2 * (this.state.frame % framesPerCycle)) / framesPerCycle;
    amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);
    return amount / 2;
  };

  getAnimationStep = () => {
    return Math.floor(this.state.frame / framesPerCycle);
  };

  render() {
    const animationProgress = this.getAnimationProgess();
    const translateX = 30 + animationProgress * 40;
    const translateY = 15;
    const rotateZ = 5 + animationProgress * -10;
    const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;
    const opacity = getFadeOpacity(animationProgress);
    const hideLabel = this.getAnimationSubstep() < framesPerCycle / 2;
    const showAnimation = this.getAnimationStep() < numItems;
    const scannerImage =
      animationProgress >= 0.4
        ? redScanner
        : blueScanner;

    return (
      <div
        id="train-model"
        style={{
          ...styles.panel,
          justifyContent: "center",
          backgroundSize: "cover",
          backgroundImage: "url(" + resultsBackground + ")"
        }}
      >
        <div style={styles.statement}>Testing accuracy</div>

        <div style={styles.generateResultsContainer}>
          <div style={styles.generateResultsDataTable}>
            {/*
            <svg
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                width: "30%",
                //height: 40,
                paddingTop: 32,
                zIndex: 1
              }}
              xmlns="http://www.w3.org/2000/svg"
              _viewBox="1 0 6 1"

            >
              <defs>
                <pattern id="tear" width="0.1" height="1" patternContentUnits="objectBoundingBox" viewBox="0 1 2 3">
                  <path d="M 2 0 L 1 1 L 0 0" fill="white"/>
                </pattern>
              </defs>
              <rect fill="url(#tear)" width="100%" height="100"/>
            </svg>
            */}

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
                opacity: opacity,
                zIndex: 1
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
              <div style={{ width: 150 }}>
                <img src={scannerImage} style={{ width: "100%" }} />
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
