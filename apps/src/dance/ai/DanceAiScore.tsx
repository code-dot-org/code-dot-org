import classNames from 'classnames';
import React from 'react';

import {GeneratedEffectScores, MinMax} from './types';

import moduleStyles from './dance-ai-score.module.scss';

export enum ScoreColors {
  // A grey bar with no symbol in the symbol container yet.
  GREY = 'grey',
  // A green bar with a green check symbol.
  YES = 'yes',
  // A red bar with a red cross symbol.
  NO = 'no',
  // A tri-colored bar with a green check symbol.
  NORMAL_YES = 'normal_yes',
  // A tri-colored bar with no symbol container or symbol.
  NORMAL_NO = 'normal_no',
}

// Scale max bar size to be 90% of the total height of visualization.
const SCORE_VISUALIZATION_HEIGHT = 140 * 0.9;
const NOTCH_OFFSET = 140 * 0.1;

interface DanceAiScoreProps {
  scores: GeneratedEffectScores;
  minMax: MinMax;
  colors: ScoreColors;
  slotCount: number;
}

const DanceAiScore: React.FunctionComponent<DanceAiScoreProps> = ({
  scores,
  minMax,
  colors,
  slotCount,
}) => {
  // For each score we wish to visualize, we subtract the minimum score
  // in the observed data in order to generate a "net score"
  // and better differentiate between observed scores.
  const getSummedNetScore = (scores: GeneratedEffectScores) => {
    return scores.reduce(
      (scaledSum: number, score: number) =>
        (scaledSum += score - minMax.minIndividualScore),
      0
    );
  };

  const getHeight = (scores: GeneratedEffectScores): number => {
    const summedNetScore = getSummedNetScore(scores);
    const maxSummedNetScore =
      minMax.maxTotalScore - minMax.minIndividualScore * slotCount;

    return Math.round(
      (summedNetScore / maxSummedNetScore) * SCORE_VISUALIZATION_HEIGHT
    );
  };

  const getLayerClassName = (layerColor: string) => {
    return colors === ScoreColors.NORMAL_YES || colors === ScoreColors.NORMAL_NO
      ? layerColor
      : colors === ScoreColors.GREY
      ? moduleStyles.barFillGrey
      : colors === ScoreColors.YES
      ? moduleStyles.barFillYes
      : moduleStyles.barFillNo;
  };

  const layers = [
    {
      height: getHeight(scores),
      className: getLayerClassName(moduleStyles.barFillFirst),
    },
    {
      height: getHeight([scores[0], scores[1]]),
      className: getLayerClassName(moduleStyles.barFillSecond),
    },
    {
      height: getHeight([scores[0]]),
      className: getLayerClassName(moduleStyles.barFillThird),
    },
  ];

  return (
    <div className={moduleStyles.scoreContainer}>
      {layers.map((layer, index) => {
        return (
          <div
            key={index}
            className={moduleStyles.barContainer}
            style={{
              height: layer.height,
            }}
          >
            <div
              className={classNames(moduleStyles.barFill, layer.className)}
            />
          </div>
        );
      })}
      <div className={moduleStyles.notchContainer} style={{top: NOTCH_OFFSET}}>
        {colors !== ScoreColors.NORMAL_NO && (
          <div className={moduleStyles.resultContainer}>
            {(colors === ScoreColors.NORMAL_YES ||
              colors === ScoreColors.YES) && (
              <div
                className={classNames(
                  moduleStyles.resultContent,
                  moduleStyles.resultContentYes
                )}
              >
                <i className="fa fa-check-circle" />
              </div>
            )}
            {colors === ScoreColors.NO && (
              <div
                className={classNames(
                  moduleStyles.resultContent,
                  moduleStyles.resultContentNo
                )}
              >
                <i className="fa fa-times-circle" />
              </div>
            )}
          </div>
        )}
        <div
          className={classNames(
            moduleStyles.notch,
            colors === ScoreColors.NORMAL_NO && moduleStyles.notchNormalNo
          )}
        />
      </div>
    </div>
  );
};

export default DanceAiScore;
