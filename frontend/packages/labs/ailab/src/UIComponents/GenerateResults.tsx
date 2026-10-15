/* React component to handle training. */
import classNames from 'classnames';
import {useState, useEffect, useRef, useCallback} from 'react';

import {imageUrl} from '../assetPath';
import {ANIMATION_TABLE_ROW_LIMIT, getFadeOpacity} from '../constants';
import {deepEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {useProject} from '../ProjectContext';
import {getTableData} from '../redux';

import {TestingAnimationDescription} from './AnimationDescriptions';
import DataTable from './DataTable';

import shared from '../shared.module.scss';
import styles from './generateResults.module.scss';

const framesPerCycle = 80;
const maxNumItems = 7;

interface GenerateResultsProps {
  onFinished: () => void;
}

const GenerateResults = ({onFinished}: GenerateResultsProps) => {
  const {project} = useProject();
  const data = useAppSelector(
    state => getTableData(state, project, true),
    deepEqual,
  );
  const instructionsOverlayActive = useAppSelector(
    state => state.instructionsOverlayActive,
  );
  const [frame, setFrame] = useState(0);
  const [, setFinished] = useState(false);
  const frameRef = useRef(0);
  const finishedRef = useRef(false);
  const instructionsOverlayActiveRef = useRef(instructionsOverlayActive);
  const dataRef = useRef(data);
  const onFinishedRef = useRef(onFinished);

  // Keep refs in sync with props
  useEffect(() => {
    instructionsOverlayActiveRef.current = instructionsOverlayActive;
  }, [instructionsOverlayActive]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const getNumItems = useCallback(() => {
    return Math.min(maxNumItems, data.length);
  }, [data]);

  useEffect(() => {
    const animationTimer = setInterval(() => {
      const currentData = dataRef.current;
      if (!currentData) {
        return;
      }

      const currentFrame = frameRef.current;
      const numItems = Math.min(maxNumItems, currentData.length);
      const animationStep = Math.floor(currentFrame / framesPerCycle);

      if (animationStep >= numItems && !finishedRef.current) {
        finishedRef.current = true;
        setFinished(true);
        onFinishedRef.current();
      }

      if (!instructionsOverlayActiveRef.current) {
        frameRef.current = currentFrame + 1;
        setFrame(frameRef.current);
      }
    }, 1000 / 30);

    return () => {
      clearInterval(animationTimer);
    };
  }, []);

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
  const startFadingAtItem = numItems - (getShowItemsFadingOut() ? 1.5 : 0);
  const maxFrames = framesPerCycle * startFadingAtItem;
  const tableOpacity =
    frame < framesPerCycle
      ? frame / framesPerCycle
      : frame >= maxFrames && frame < maxFrames + framesPerCycle
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
  const startingRow = frame === 0 ? undefined : getAnimationStep();

  return (
    <div
      id="train-model"
      className={classNames(shared.panel, shared.scene)}
      style={{
        backgroundImage:
          'url(' + imageUrl('results-background-light.jpg') + ')',
      }}
    >
      <div className={styles.animationArea}>
        <div className={shared.sceneTable} style={{opacity: tableOpacity}}>
          <DataTable
            useResultsData={true}
            reducedColumns={true}
            startingRow={startingRow}
            noLabel={true}
            maxRows={ANIMATION_TABLE_ROW_LIMIT}
          />
        </div>

        {showAnimation && (
          <div
            style={{
              position: 'absolute',
              transformOrigin: 'center center',
              bottom: translateY + '%',
              left: translateX + '%',
              transform: transform,
              opacity: opacity * tableOpacity,
              zIndex: 1,
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
        className={shared.sceneBot}
        style={{transform: botContainerTransform}}
      >
        <div className={classNames(shared.hoverGrow, shared.bot)}>
          <img
            src={imageUrl('ai-bot/ai-bot-head.png')}
            className={shared.botHead}
            alt={I18n.t('aiBotHeadAltText')}
          />
          <img
            src={imageUrl('ai-bot/ai-bot-body.png')}
            className={shared.botBody}
            alt={I18n.t('aiBotBodyAltText')}
          />
          <div style={{width: 150, position: 'absolute', top: 140, zIndex: -1}}>
            <img
              src={imageUrl('ai-bot/blue-scanner.png')}
              style={{width: '100%', opacity: tableOpacity}}
              alt={I18n.t('aiBotBeamAltText')}
            />
          </div>
        </div>
      </div>
      <TestingAnimationDescription />
    </div>
  );
};

export default GenerateResults;
