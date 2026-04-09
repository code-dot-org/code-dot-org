/* React component to handle training. */
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { getTableData, readyToTrain } from "../redux";
import { styles, getFadeOpacity } from "../constants";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import blueScanner from "@public/images/ai-bot/blue-scanner.png";
import background from "@public/images/results-background-light.jpg";
import DataTable from "./DataTable";
import { TestingAnimationDescription } from "./AnimationDescriptions";
import I18n from "../i18n";

const framesPerCycle = 80;
const maxNumItems = 7;

function GenerateResults({ data, readyToTrain, labelColumn, selectedFeatures, instructionsOverlayActive }) {
  const [frame, setFrame] = useState(0);
  const [, setFinished] = useState(false);
  const frameRef = useRef(0);
  const instructionsOverlayActiveRef = useRef(instructionsOverlayActive);

  // Keep ref in sync with prop
  useEffect(() => {
    instructionsOverlayActiveRef.current = instructionsOverlayActive;
  }, [instructionsOverlayActive]);

  const getNumItems = useCallback(() => {
    return Math.min(maxNumItems, data.length);
  }, [data.length]);

  useEffect(() => {
    const animationTimer = setInterval(() => {
      const currentFrame = frameRef.current;
      const numItems = Math.min(maxNumItems, data.length);
      const animationStep = Math.floor(currentFrame / framesPerCycle);

      if (animationStep >= numItems) {
        setFinished(true);
      }

      if (!instructionsOverlayActiveRef.current) {
        frameRef.current = currentFrame + 1;
        setFrame(frameRef.current);
      }
    }, 1000 / 30);

    return () => {
      clearInterval(animationTimer);
    };
  }, [data.length]);

  const getShowItemsFadingOut = () => {
    return data.length > maxNumItems;
  };

  const getAnimationSubstep = () => {
    return frame % framesPerCycle;
  };

  const getAnimationProgress = () => {
    let amount = (2 * (frame % framesPerCycle)) / framesPerCycle;
    amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);
    return amount / 2;
  };

  const getAnimationStep = () => {
    return Math.floor(frame / framesPerCycle);
  };

  const numItems = getNumItems();
  const animationProgress = getAnimationProgress();
  const translateX = 30 + animationProgress * 40;
  const translateY = 15;
  const rotateZ = 5 + animationProgress * -10;
  const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;
  const opacity = getFadeOpacity(animationProgress);
  const hideLabel = getAnimationSubstep() < framesPerCycle / 2;
  const showAnimation = getAnimationStep() < numItems;
  const startFadingAtItem =
    numItems - (getShowItemsFadingOut() ? 1.5 : 0);
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
  const headMoveAmount =
    frame < framesPerCycle / 4
      ? frame / (framesPerCycle / 4)
      : frame >= maxFrames + framesPerCycle &&
        frame <= maxFrames + 2 * framesPerCycle
      ? 1 - (frame - (maxFrames + framesPerCycle)) / framesPerCycle
      : frame >= maxFrames + 2 * framesPerCycle
      ? 0
      : 1;
  const botTransformY = -50 - headMoveAmount * 50;
  const botContainerTransform = `translateX(-25%) translateY(${botTransformY}%)`;

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
      <div style={styles.statementWithBackgroundAbsolute}>
        {I18n.t("generateResultsHeader")}
      </div>

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
              singleRow={getAnimationStep()}
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
            alt={I18n.t("aiBotHeadAltText")}
          />
          <img
            src={aiBotBody}
            style={styles.trainBotBody}
            alt={I18n.t("aiBotBodyAltText")}
          />
          <div
            style={{ width: 150, position: "absolute", top: 140, zIndex: -1 }}
          >
            <img
              src={blueScanner}
              style={{ width: "100%", opacity: tableOpacity }}
              alt={I18n.t("aiBotBeamAltText")}
            />
          </div>
        </div>
      </div>
      <TestingAnimationDescription />
    </div>
  );
}

GenerateResults.propTypes = {
  data: PropTypes.array,
  readyToTrain: PropTypes.bool,
  labelColumn: PropTypes.string,
  selectedFeatures: PropTypes.array,
  instructionsOverlayActive: PropTypes.bool
};

export default connect(state => ({
  data: getTableData(state, true),
  readyToTrain: readyToTrain(state),
  labelColumn: state.labelColumn,
  selectedFeatures: state.selectedFeatures,
  instructionsOverlayActive: state.instructionsOverlayActive
}))(GenerateResults);
