import React from 'react';

import {BodyThreeText, Heading1} from '@cdo/apps/componentLibrary/typography';
import {
  LevelPredictSettings,
  PredictQuestionType,
} from '@cdo/apps/lab2/levelEditors/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import moduleStyles from './predict.module.scss';

// Component that displays the solution to a predict question.
// The backend will only send the solution if the user has permission to see it.
const PredictSolution: React.FunctionComponent = () => {
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );

  return <UnconnectedPredictSolution predictSettings={predictSettings} />;
};

interface UnconnectedPredictSolutionProps {
  predictSettings: LevelPredictSettings | undefined;
}

export const UnconnectedPredictSolution: React.FunctionComponent<
  UnconnectedPredictSolutionProps
> = ({predictSettings}) => {
  if (!predictSettings?.solution) {
    return null;
  }

  const getFormattedSolution = () => {
    if (!predictSettings?.solution) {
      return null;
    }
    let solutionToDisplay: JSX.Element = (
      <span>{predictSettings.solution}</span>
    );
    if (predictSettings.questionType === PredictQuestionType.MultipleChoice) {
      const solutions = predictSettings.solution.split(',');
      const formattedSolutions: JSX.Element[] = [];
      for (const solution of solutions) {
        const index = predictSettings.multipleChoiceOptions?.indexOf(solution);
        if (index !== undefined && index !== -1) {
          // Insert at index so the solutions show up in the same order as the options.
          formattedSolutions[index] = (
            <span key={index}>
              <span className={moduleStyles.multipleChoiceLetter}>
                {String.fromCharCode(65 + index)}.
              </span>
              <span className={moduleStyles.multipleChoiceLabel}>
                {solution}
              </span>
              <br />
            </span>
          );
        }
      }
      solutionToDisplay = <>{formattedSolutions}</>;
    }
    return solutionToDisplay;
  };

  return (
    <div className={moduleStyles.predictSolutionContainer}>
      <Heading1 visualAppearance="heading-sm">{commonI18n.answer()}</Heading1>
      <BodyThreeText>{getFormattedSolution()}</BodyThreeText>
    </div>
  );
};

export default PredictSolution;
