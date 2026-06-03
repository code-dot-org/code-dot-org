/* React component to handle training. */
import {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';

import {imageUrl} from '../assetPath';
import {styles, getFadeOpacity} from '../constants';
import I18n from '../i18n';
import {store} from '../index';
import type {RootState} from '../redux';
import {getTableData} from '../redux';
import train from '../train';
import type {DataRow} from '../types';

import {TrainingAnimationDescription} from './AnimationDescriptions';
import DataTable from './DataTable';

const framesPerCycle = 80;
const maxNumItems = 7;

interface TrainModelProps {
  data: DataRow[];
  instructionsOverlayActive: boolean;
}

const TrainModel = ({data, instructionsOverlayActive}: TrainModelProps) => {
  const [frame, setFrame] = useState(0);
  const [headOpen, setHeadOpen] = useState(false);
  const [, setFinished] = useState(false);
  const frameRef = useRef(0);
  const headOpenRef = useRef(false);
  const finishedRef = useRef(false);
  const instructionsOverlayActiveRef = useRef(instructionsOverlayActive);
  const dataRef = useRef(data);

  // Keep refs in sync with props
  useEffect(() => {
    instructionsOverlayActiveRef.current = instructionsOverlayActive;
  }, [instructionsOverlayActive]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    train.init(store);
    train.onClickTrain(store);

    const animationTimer = setInterval(() => {
      const currentData = dataRef.current;
      if (!currentData) {
        return;
      }

      const currentFrame = frameRef.current;

      if (currentFrame === 15) {
        headOpenRef.current = true;
        setHeadOpen(true);
      }

      const animationStep = Math.floor(currentFrame / framesPerCycle);
      const numItems = Math.min(maxNumItems, currentData.length);

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
  }, []);

  const getAnimationProgress = (): number => {
    let amount = (frame % framesPerCycle) / framesPerCycle;
    amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);
    return amount;
  };

  const getNumItems = (): number => {
    return Math.min(maxNumItems, data.length);
  };

  const getShowItemsFadingOut = (): boolean => {
    return data.length > maxNumItems;
  };

  const getAnimationStep = (): number => {
    return Math.floor(frame / framesPerCycle);
  };

  const animationProgress = getAnimationProgress();
  const translateX = 15 + animationProgress * (100 - 15);
  const translateY = 80 - Math.sin(animationProgress * Math.PI) * 30;
  const rotateZ = animationProgress * 60;
  const transform = `translateX(-50%) translateY(-50%) rotateZ(${rotateZ}deg)`;
  const opacity = getFadeOpacity(animationProgress);
  const showAnimation = getAnimationStep() < getNumItems();
  const startFadingAtItem = getNumItems() - (getShowItemsFadingOut() ? 1.5 : 0);
  const maxFrames = framesPerCycle * startFadingAtItem;
  const tableOpacity =
    frame < framesPerCycle
      ? frame / framesPerCycle
      : frame >= maxFrames && frame < maxFrames + framesPerCycle
        ? 1 - (frame - maxFrames) / framesPerCycle
        : frame >= maxFrames + framesPerCycle
          ? 0
          : 1;

  // Let's still show the starting row on our very first frame, because we might
  // be paused waiting for the overlay to be dismissed.
  const startingRow = frame === 0 ? undefined : getAnimationStep();

  return (
    <div
      id="train-model"
      style={{
        ...styles.panel,
        justifyContent: 'center',
        backgroundSize: 'cover',
        backgroundPosition: '50% 50%',
        backgroundImage:
          'url(' + imageUrl('results-background-light.jpg') + ')',
      }}
    >
      <div style={styles.statementWithBackgroundAbsolute}>
        {I18n.t('trainModelHeading')}
      </div>

      <div
        style={{
          ...styles.trainModelDataTable,
          opacity: tableOpacity,
        }}
      >
        <DataTable reducedColumns={true} startingRow={startingRow} />
      </div>

      <div style={styles.trainModelContainer}>
        {showAnimation && (
          <div
            style={{
              position: 'absolute',
              transformOrigin: 'center center',
              top: translateY + '%',
              left: translateX + '%',
              transform: transform,
              opacity: opacity * tableOpacity,
            }}
          >
            <DataTable reducedColumns={true} singleRow={getAnimationStep()} />
          </div>
        )}
      </div>

      <div style={styles.trainModelBotContainer}>
        <div className="ailab-image-hover" style={styles.trainBot}>
          <img
            src={imageUrl('ai-bot/ai-bot-head.png')}
            style={{
              ...styles.trainBotHead,
              ...(headOpen && styles.trainBotOpen),
            }}
            alt={I18n.t('aiBotHeadAltText')}
          />
          <img
            src={imageUrl('ai-bot/ai-bot-body.png')}
            style={styles.trainBotBody}
            alt={I18n.t('aiBotBodyAltText')}
          />
        </div>
      </div>
      <TrainingAnimationDescription />
    </div>
  );
};

export default connect((state: RootState) => ({
  data: getTableData(state, false),
  instructionsOverlayActive: state.instructionsOverlayActive,
}))(TrainModel);
