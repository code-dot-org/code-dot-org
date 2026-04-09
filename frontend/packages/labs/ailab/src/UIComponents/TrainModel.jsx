/* React component to handle training. */
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { store } from "../index.js";
import train from "../train";
import { getTableData, readyToTrain } from "../redux";
import { styles, getFadeOpacity } from "../constants";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import background from "@public/images/results-background-light.jpg";
import DataTable from "./DataTable";
import { TrainingAnimationDescription } from "./AnimationDescriptions";
import I18n from "../i18n";

const framesPerCycle = 80;
const maxNumItems = 7;

function TrainModel({ data, readyToTrain: ready, labelColumn, selectedFeatures, instructionsOverlayActive }) {
  const [frame, setFrame] = useState(0);
  const [headOpen, setHeadOpen] = useState(false);
  const [, setFinished] = useState(false);
  const frameRef = useRef(0);
  const headOpenRef = useRef(false);
  const finishedRef = useRef(false);
  const instructionsOverlayActiveRef = useRef(instructionsOverlayActive);

  // Keep refs in sync
  useEffect(() => {
    instructionsOverlayActiveRef.current = instructionsOverlayActive;
  }, [instructionsOverlayActive]);

  useEffect(() => {
    train.init(store);
    train.onClickTrain(store);

    const animationTimer = setInterval(() => {
      const currentFrame = frameRef.current;

      if (currentFrame === 15) {
        headOpenRef.current = true;
        setHeadOpen(true);
      }

      const animationStep = Math.floor(currentFrame / framesPerCycle);
      const numItems = Math.min(maxNumItems, data.length);

      if (animationStep >= numItems) {
        headOpenRef.current = false;
        finishedRef.current = true;
        setHeadOpen(false);
        setFinished(true);
      }

      if (!instructionsOverlayActiveRef.current) {
        frameRef.current = currentFrame + 1;
        setFrame(currentFrame + 1);
      }
    }, 1000 / 30);

    return () => {
      clearInterval(animationTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getAnimationProgress = () => {
    let amount = (frame % framesPerCycle) / framesPerCycle;
    amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);
    return amount;
  };

  const getNumItems = () => {
    return Math.min(maxNumItems, data.length);
  };

  const getShowItemsFadingOut = () => {
    return data.length > maxNumItems;
  };

  const getAnimationStep = () => {
    return Math.floor(frame / framesPerCycle);
  };

  const animationProgress = getAnimationProgress();
  const translateX = 15 + animationProgress * (100 - 15);
  const translateY = 80 - Math.sin(animationProgress * Math.PI) * 30;
  const rotateZ = animationProgress * 60;
  const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;
  const opacity = getFadeOpacity(animationProgress);
  const showAnimation = getAnimationStep() < getNumItems();
  const startFadingAtItem =
    getNumItems() - (getShowItemsFadingOut() ? 1.5 : 0);
  const maxFrames = framesPerCycle * startFadingAtItem;
  const tableOpacity =
    frame < framesPerCycle
      ? frame / framesPerCycle
      : frame >= maxFrames &&
        frame < maxFrames + framesPerCycle
      ? 1 - (frame - maxFrames) / framesPerCycle
      : frame >= maxFrames + framesPerCycle
      ? 0
      : 1;

  // Let's still show the starting row on our very first frame, because we might
  // be paused waiting for the overlay to be dismissed.
  const startingRow =
    frame === 0 ? undefined : getAnimationStep();

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
      <div style={styles.statementWithBackgroundAbsolute}>{I18n.t("trainModelHeading")}</div>

      <div
        style={{
          ...styles.trainModelDataTable,
          opacity: tableOpacity
        }}
      >
        <DataTable reducedColumns={true} startingRow={startingRow} />
      </div>

      <div style={styles.trainModelContainer}>
        {showAnimation && (
          <div
            style={{
              position: "absolute",
              transformOrigin: "center center",
              top: translateY + "%",
              left: translateX + "%",
              transform: transform,
              opacity: opacity * tableOpacity
            }}
          >
            <DataTable
              reducedColumns={true}
              singleRow={getAnimationStep()}
            />
          </div>
        )}
      </div>

      <div style={styles.trainModelBotContainer}>
        <div className="ailab-image-hover" style={styles.trainBot}>
          <img
            src={aiBotHead}
            style={{
              ...styles.trainBotHead,
              ...(headOpen && styles.trainBotOpen)
            }}
            alt={I18n.t("aiBotHeadAltText")}
          />
          <img
            src={aiBotBody}
            style={styles.trainBotBody}
            alt={I18n.t("aiBotBodyAltText")}
          />
        </div>
      </div>
      <TrainingAnimationDescription />
    </div>
  );
}

TrainModel.propTypes = {
  data: PropTypes.array,
  readyToTrain: PropTypes.bool,
  labelColumn: PropTypes.string,
  selectedFeatures: PropTypes.array,
  instructionsOverlayActive: PropTypes.bool
};

export default connect(state => ({
  data: getTableData(state, false),
  readyToTrain: readyToTrain(state),
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  instructionsOverlayActive: state.instructionsOverlayActive
}))(TrainModel);
