/* React component to handle training. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getTableData, readyToTrain } from "../redux";
import { styles, getFadeOpacity } from "../constants";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import blueScanner from "@public/images/ai-bot/blue-scanner.png";
import background from "@public/images/results-background-light.jpg";
import DataTable from "./DataTable";

const framesPerCycle = 80;
const maxNumItems = 7;

class GenerateResults extends Component {
  static propTypes = {
    data: PropTypes.array,
    readyToTrain: PropTypes.bool,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    instructionsOverlayActive: PropTypes.bool
  };

  state = {
    frame: 0,
    animationTimer: undefined,
    headOpen: false
  };

  constructor(props) {
    super(props);

    this.state = {
      frame: 0,
      animationTimer: undefined,
      finished: false
    };
  }

  componentDidMount() {
    const animationTimer = setInterval(
      this.updateAnimation.bind(this),
      1000 / 30
    );

    this.setState({ animationTimer });
  }

  getNumItems = () => {
    return Math.min(maxNumItems, this.props.data.length);
  };

  getShowItemsFadingOut = () => {
    return this.props.data.length > maxNumItems;
  };

  getAnimationSubstep = () => {
    return this.state.frame % framesPerCycle;
  };

  updateAnimation = () => {
    if (this.getAnimationStep() >= this.getNumItems()) {
      this.setState({ finished: true });
    }

    if (!this.props.instructionsOverlayActive) {
      this.setState({ frame: this.state.frame + 1 });
    }
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
    const showAnimation = this.getAnimationStep() < this.getNumItems();
    const startFadingAtItem =
      this.getNumItems() - (this.getShowItemsFadingOut() ? 1.5 : 0);
    const maxFrames = framesPerCycle * startFadingAtItem;
    const tableOpacity =
      this.state.frame < framesPerCycle
        ? this.state.frame / framesPerCycle
        : this.state.frame >= maxFrames &&
          this.state.frame < maxFrames + framesPerCycle
        ? 1 - (this.state.frame - maxFrames) / framesPerCycle
        : this.state.frame >= maxFrames + framesPerCycle
        ? 0
        : 1;
    const headMoveAmount =
      this.state.frame < framesPerCycle / 4
        ? this.state.frame / (framesPerCycle / 4)
        : this.state.frame >= maxFrames + framesPerCycle &&
          this.state.frame <= maxFrames + 2 * framesPerCycle
        ? 1 - (this.state.frame - (maxFrames + framesPerCycle)) / framesPerCycle
        : this.state.frame >= maxFrames + 2 * framesPerCycle
        ? 0
        : 1;
    const botTransformY = -50 - headMoveAmount * 50;
    const botContainerTransform = `translateX(-25%) translateY(${botTransformY}%)`;

    // Let's still show the starting row on our very first frame, because we might
    // be paused waiting for the overlay to be dismissed.
    const startingRow =
      this.state.frame === 0 ? undefined : this.getAnimationStep();

    return (
      <div
        id="train-model"
        style={{
          ...styles.panel,
          justifyContent: "center",
          backgroundSize: "cover",
          backgroundPosition: "50% 50%",
          backgroundImage: "url(" + background + ")"
        }}
      >
        <div style={styles.statementWithBackgroundAbsolute}>Testing the model</div>

        <div style={styles.generateResultsContainer}>
          <div
            style={{
              ...styles.generateResultsDataTable,
              opacity: tableOpacity
            }}
          >
            <DataTable
              useResultsData={true}
              reducedColumns={true}
              startingRow={startingRow}
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
                opacity: opacity * tableOpacity,
                zIndex: 1
              }}
            >
              <DataTable
                useResultsData={true}
                reducedColumns={true}
                singleRow={this.getAnimationStep()}
                hideLabel={hideLabel}
              />
            </div>
          )}
        </div>

        <div
          style={{
            ...styles.generateResultsBotContainer,
            transform: botContainerTransform
          }}
        >
          <div className="ailab-image-hover" style={styles.trainBot}>
            <img
              src={aiBotHead}
              style={styles.trainBotHead}
              alt="A.I. bot head"
            />
            <img
              src={aiBotBody}
              style={styles.trainBotBody}
              alt="A.I. bot body"
            />
            <div
              style={{ width: 150, position: "absolute", top: 140, zIndex: -1 }}
            >
              <img
                src={blueScanner}
                style={{ width: "100%", opacity: tableOpacity }}
                alt="A.I. bot scanner beam"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  data: getTableData(state, true),
  readyToTrain: readyToTrain(state),
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  instructionsOverlayActive: state.instructionsOverlayActive
}))(GenerateResults);
