// BubbleChoice
//
// This is a React client for a bubble_choice level.  Note that this is
// only used for levels that use Lab2.  For levels that don't use Lab2,
// they will get an older-style level.
import {Button} from '@code-dot-org/component-library/button';
import {Heading4} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import _ from 'lodash';
import React, {useEffect, useMemo, useRef} from 'react';

import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {levelById} from '@cdo/apps/code-studio/progressReduxSelectors';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  LabProps,
  BubbleChoiceLevelData,
  BubbleChoiceSublevel,
} from '@cdo/apps/lab2/types';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {capitalizeFirstLetter} from '@cdo/apps/util/capitalizeFirstLetter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {getCurrentLesson} from '../code-studio/progressReduxSelectors';
import {commonI18n} from '../types/locale';

import styles from './BubbleChoice.module.scss';

const BubbleChoice: React.FC<LabProps> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const background = useAppSelector(
    state => getCurrentLesson(state)?.background || null
  );
  const backgroundSuffix = capitalizeFirstLetter(background || 'light');
  const levelBubbleChoice = levelProperties.levelData as BubbleChoiceLevelData;
  const sublevelsStatus = useAppSelector(state =>
    levelBubbleChoice.sublevels.map(
      sublevel =>
        levelById(
          state.progress,
          state.progress.currentLessonId,
          sublevel.level_id
        )?.status || LevelStatus.not_tried
    )
  );
  const currentLessonId = useAppSelector(
    state => state.progress.currentLessonId
  );

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const numSubLevels = levelBubbleChoice.sublevels.length;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(containerRef.current?.offsetWidth || 0);
      setContainerHeight(containerRef.current?.offsetHeight || 0);
    });
    resizeObserver.observe(containerRef?.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Generate a map of candidate layouts, with each key the number of rows, and each value
  // the corresponding number of columns.  We only store one candidate for each number of
  // rows, and each is the one with the least number of columns that still fit all the sublevels.
  const candidateLayouts = useMemo(() => {
    const candidateLayouts = new Map();
    for (let numCols = numSubLevels; numCols >= 1; numCols--) {
      const numRows = Math.ceil(numSubLevels / numCols);
      candidateLayouts.set(numRows, Math.ceil(numSubLevels / numRows));
    }
    return candidateLayouts;
  }, [numSubLevels]);

  // Go through the candidates and find which will deliver the largest sublevel buttons, given
  // the current size of the container.
  const [numRows, numColumns] = useMemo(() => {
    let bestSize = -1;
    let bestNumRows = -1;
    for (const [
      candidateLayoutRows,
      candidateLayoutColumns,
    ] of candidateLayouts.entries()) {
      const size = Math.min(
        containerWidth / candidateLayoutColumns,
        containerHeight / candidateLayoutRows
      );
      if (size > bestSize) {
        bestSize = size;
        bestNumRows = candidateLayoutRows;
      }
    }
    const numRows = bestNumRows;
    const numColumns = candidateLayouts.get(bestNumRows);
    return [numRows, numColumns];
  }, [candidateLayouts, containerHeight, containerWidth]);

  const sublevelToProgressBubbleLevel = (index: number) => {
    const sublevel = levelBubbleChoice.sublevels[index];
    const status = sublevelsStatus[index];
    // ProgressBubble expects level keys to be camelCase instead of snake_case.
    const level = _.mapKeys(sublevel, (value, key) => _.camelCase(key));
    // Add status to the level object.
    level.status = status;
    return level;
  };

  const navigateToSublevel = (sublevel: BubbleChoiceSublevel) => {
    if (currentLessonId) {
      dispatch(navigateToLevelId(sublevel.level_id));
    } else {
      window.location.href = sublevel.url;
    }
  };

  return (
    <div id="bubble-choice" className={styles.bubbleChoiceContainer}>
      <div>
        {levelBubbleChoice.displayName && (
          <Heading4 className={styles[`heading${backgroundSuffix}`]}>
            {levelBubbleChoice.displayName}
          </Heading4>
        )}
        {levelBubbleChoice.description && (
          <div className={styles[`text${backgroundSuffix}`]}>
            {levelBubbleChoice.description}
          </div>
        )}
      </div>
      <div
        className={styles.sublevelsContainer}
        style={{
          gridTemplateColumns: `repeat(${numColumns}, minmax(0,1fr))`,
          gridTemplateRows: `repeat(${numRows}, minmax(0,1fr))`,
        }}
        ref={containerRef}
      >
        {levelBubbleChoice.sublevels.map((sublevel, index) => (
          <button
            type="button"
            key={index}
            className={classNames(
              styles.sublevelButton,
              styles[`sublevelButton${backgroundSuffix}`]
            )}
            onClick={() => navigateToSublevel(sublevel)}
          >
            <div className={styles.sublevelImageContainer}>
              <img
                alt=""
                src={sublevel.thumbnail_url}
                className={styles.sublevelImage}
              />
            </div>
            <div className={styles.sublevelText}>
              <ProgressBubble
                level={sublevelToProgressBubbleLevel(index)}
                disabled={true}
                hideToolTips={true}
                smallBubble={true}
              />
              {sublevel.display_name}
            </div>
          </button>
        ))}
      </div>
      <div className={styles.buttonRow}>
        <Button
          ariaLabel={commonI18n.continue()}
          text={commonI18n.continue()}
          onClick={() => dispatch(continueOrFinishLesson())}
          className={styles.continueButton}
        />
      </div>
    </div>
  );
};

export default BubbleChoice;
