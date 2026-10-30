import classNames from 'classnames';
import React, {useMemo} from 'react';

import AiBlockPreview from './AiBlockPreview';
import AiVisualizationPreview from './AiVisualizationPreview';
import {
  DanceAiModalMode,
  DanceAiPreviewButtonToggleState,
  GeneratedEffect,
} from './types';
import {getPreviewCode} from './utils';

import moduleStyles from './dance-ai-modal.module.scss';

type DanceAiModalFlipCardProps = {
  mode: DanceAiModalMode;
  generatingProgressStep: number;
  badGeneratedResultsCount: number;
  currentToggle: DanceAiPreviewButtonToggleState;
  previewAppearDuration: number;
  currentGeneratedEffect: GeneratedEffect | undefined;
  getGeneratedEffect: (step: number) => GeneratedEffect | undefined;
};

/**
 * This component renders the flip card on the Dance AI Modal. It's a good
 * candidate for further refactoring and could possibly be made more generic.
 *
 * @param props
 * @param props.mode
 * @param props.generatingProgressStep
 * @param props.badGeneratedResultsCount
 * @param props.currentToggle
 * @param props.previewAppearDuration
 * @param props.previewAppearDuration
 * @param props.currentGeneratedEffect
 * @param props.getGeneratedEffect
 * @returns A react element that renders the flip card
 */

const DanceAiModalFlipCard: React.FunctionComponent<
  DanceAiModalFlipCardProps
> = ({
  mode,
  generatingProgressStep,
  badGeneratedResultsCount,
  currentToggle,
  previewAppearDuration,
  currentGeneratedEffect,
  getGeneratedEffect,
}) => {
  // Visualization preview size, in pixels.
  const previewSize = 280;

  // While generating, we render two previews at a time, so that as a new
  // one appears, it will smoothly fade in over the top of the previous one.
  const indexesToPreview = useMemo(() => {
    const indexesToPreview = [];
    if (
      mode === DanceAiModalMode.GENERATING ||
      mode === DanceAiModalMode.GENERATED
    ) {
      if (generatingProgressStep > 0) {
        indexesToPreview.push(generatingProgressStep - 1);
      }
      indexesToPreview.push(generatingProgressStep);
    } else if (mode === DanceAiModalMode.RESULTS) {
      indexesToPreview.push(badGeneratedResultsCount);
    }

    return indexesToPreview;
  }, [mode, generatingProgressStep, badGeneratedResultsCount]);

  let previewAreaClass = undefined;
  if (
    mode === DanceAiModalMode.GENERATED ||
    (mode === DanceAiModalMode.GENERATING &&
      generatingProgressStep >= badGeneratedResultsCount)
  ) {
    previewAreaClass = moduleStyles.previewAreaYes;
  }

  return (
    <div
      id="preview-area"
      className={classNames(moduleStyles.previewArea, previewAreaClass)}
    >
      <div id="flip-card" className={moduleStyles.flipCard}>
        <div
          id="flip-card-inner"
          className={classNames(
            moduleStyles.flipCardInner,
            mode === DanceAiModalMode.RESULTS &&
              currentToggle === DanceAiPreviewButtonToggleState.CODE &&
              moduleStyles.flipCardInnerFlipped
          )}
        >
          <div id="flip-card-front" className={moduleStyles.flipCardFront}>
            {indexesToPreview.map(index => {
              return (
                <div
                  id={'preview-container-' + index}
                  key={'preview-container-' + index}
                  className={moduleStyles.previewContainer}
                  style={{
                    animationDuration: previewAppearDuration + 'ms',
                  }}
                >
                  <AiVisualizationPreview
                    id={'ai-preview-' + index}
                    code={getPreviewCode(getGeneratedEffect(index))}
                    size={previewSize}
                  />
                </div>
              );
            })}
          </div>
          <div id="flip-card-back" className={moduleStyles.flipCardBack}>
            {mode === DanceAiModalMode.RESULTS && (
              <div id="block-preview" className={moduleStyles.blockPreview}>
                {currentGeneratedEffect && (
                  <AiBlockPreview results={currentGeneratedEffect} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DanceAiModalFlipCard);
