import React, {useMemo} from 'react';

import moduleStyles from './dance-ai-modal.module.scss';
import classNames from 'classnames';
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';

import {Mode, Toggle} from './types';

type DanceAiModalFlipCardProps = {
  mode: Mode;
  generatingProgressStep: number;
  badGeneratedResultsCount: number;
  currentToggle: Toggle;
  previewAppearDuration: number;
  currentGeneratedEffect: any;
  getPreviewCode: any;
  getGeneratedEffect: any;
};

const DanceAiModalFlipCard: React.FunctionComponent<
  DanceAiModalFlipCardProps
> = ({
  mode,
  generatingProgressStep,
  badGeneratedResultsCount,
  currentToggle,
  previewAppearDuration,
  currentGeneratedEffect,
  getPreviewCode,
  getGeneratedEffect,
}) => {
  // Visualization preview size, in pixels.
  const previewSize = 280;

  // While generating, we render two previews at a time, so that as a new
  // one appears, it will smoothly fade in over the top of the previous one.
  const indexesToPreview = useMemo(() => {
    const indexesToPreview = [];
    if (mode === Mode.GENERATING || mode === Mode.GENERATED) {
      if (generatingProgressStep > 0) {
        indexesToPreview.push(generatingProgressStep - 1);
      }
      indexesToPreview.push(generatingProgressStep);
    } else if (mode === Mode.RESULTS) {
      indexesToPreview.push(badGeneratedResultsCount);
    }

    return indexesToPreview;
  }, [mode, generatingProgressStep, badGeneratedResultsCount]);

  let previewAreaClass = undefined;
  if (
    mode === Mode.GENERATED ||
    (mode === Mode.GENERATING &&
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
            mode === Mode.RESULTS &&
              currentToggle === Toggle.CODE &&
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
            {mode === Mode.RESULTS && (
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
