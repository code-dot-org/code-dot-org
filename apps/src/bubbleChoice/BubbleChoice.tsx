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

import {
  navigateToLevelId,
  setCurrentLevelId,
} from '@cdo/apps/code-studio/progressRedux';
import {levelById} from '@cdo/apps/code-studio/progressReduxSelectors';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  LabProps,
  BubbleChoiceLevelData,
  BubbleChoiceSublevel,
} from '@cdo/apps/lab2/types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import notifyLevelChange from '../lab2/utils/notifyLevelChange';
import {commonI18n} from '../types/locale';

import styles from './BubbleChoice.module.scss';

const BubbleChoice: React.FC<LabProps> = ({levelProperties}) => {
  // The image has a 4:3 aspect ratio.
  const imageAspectRatio = 4 / 3;

  // The aspect ratio of each sublevel button.  It has an image above a text area,
  // each with the same aspect ratio.
  const aspectRatio = imageAspectRatio / 2;

  // The gap (in pixels) between each sublevel button.
  const gap = 15;

  const dispatch = useAppDispatch();
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
  const [numRows, numColumns, imageWidth] = useMemo(() => {
    let bestSize = -1;
    let bestNumRows = -1;
    for (const [
      candidateLayoutRows,
      candidateLayoutColumns,
    ] of candidateLayouts.entries()) {
      const size = Math.min(
        (containerWidth - (candidateLayoutColumns - 1) * gap) /
          candidateLayoutColumns,
        ((containerHeight - (candidateLayoutRows - 1) * gap) * aspectRatio) /
          candidateLayoutRows
      );
      if (size > bestSize) {
        bestSize = size;
        bestNumRows = candidateLayoutRows;
      }
    }
    const numRows = bestNumRows;
    const numColumns = candidateLayouts.get(bestNumRows);
    return [numRows, numColumns, bestSize];
  }, [aspectRatio, candidateLayouts, containerHeight, containerWidth]);

  const imageHeight = imageWidth / imageAspectRatio;

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
    } else if (levelProperties.isProjectLevel) {
      // For BubbleChoice project levels, set the level ID in redux, and let the
      // MultiProjectContainer handle switching projects. The standard progress redux
      // system does not work for project levels since there is no progress, lesson, etc.
      dispatch(setCurrentLevelId(sublevel.level_id));
      // TODO: This is a dupe of code in navigateToLevelId(). Can we consolidate?
      notifyLevelChange(String(levelProperties.id), sublevel.level_id);
      // TODO: Handle browser navigation.
    } else {
      window.location.href = sublevel.url;
    }
  };

  return (
    <div id="bubble-choice" className={styles.bubbleChoiceContainer}>
      <div>
        {levelBubbleChoice.displayName && (
          <Heading4 className={styles.heading}>
            {levelBubbleChoice.displayName}
          </Heading4>
        )}
        {levelBubbleChoice.description && (
          <div className={styles.text}>
            <EnhancedSafeMarkdown markdown={levelBubbleChoice.description} />
          </div>
        )}
      </div>
      <div className={styles.subLevelsOuterContainer} ref={containerRef}>
        <div
          className={styles.sublevelsContainer}
          style={{
            gridTemplateColumns: `repeat(${numColumns}, minmax(0,1fr))`,
            gridTemplateRows: `repeat(${numRows}, minmax(0,1fr))`,
            gap: `${gap}px`,
          }}
        >
          {levelBubbleChoice.sublevels.map((sublevel, index) => (
            <button
              type="button"
              key={index}
              className={classNames(
                'uitest-bubble-choice',
                styles.sublevelButton
              )}
              style={{
                width: imageWidth,
                height: imageWidth / aspectRatio,
              }}
              onClick={() => navigateToSublevel(sublevel)}
            >
              <div
                className={styles.sublevelImageContainer}
                style={{width: imageWidth, height: imageHeight}}
              >
                <img
                  alt=""
                  src={sublevel.thumbnail_url}
                  className={styles.sublevelImage}
                />
                <div className={styles.sublevelProgressBubbleContainer}>
                  <ProgressBubble
                    level={sublevelToProgressBubbleLevel(index)}
                    disabled={true}
                    hideToolTips={true}
                    smallBubble={true}
                  />
                </div>
              </div>
              <div className={styles.sublevelTextContainer}>
                <Heading4
                  className={classNames(
                    styles.heading,
                    styles.sublevelTextHeading
                  )}
                >
                  {sublevel.display_name}
                </Heading4>

                {sublevel.description && (
                  <EnhancedSafeMarkdown
                    markdown={sublevel.description}
                    className={styles.sublevelDescriptionMarkdown}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
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
