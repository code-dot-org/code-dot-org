import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Typography from '@cdo/apps/componentLibrary/typography';
import {PredictQuestionType} from '@cdo/apps/lab2/levelEditors/types';
import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/for-teachers-only.module.scss';

const ForTeachersOnly: React.FunctionComponent = () => {
  const teacherMarkdown = useAppSelector(
    state => state.lab.levelProperties?.teacherMarkdown
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );

  const showPredictSolution = () => {
    // We will only have a solution if the user has permission to see it.
    // TODO: show letter in front of multiple choice answer
    // better styling
    if (predictSettings?.solution) {
      let solutionToDisplay = predictSettings.solution;
      if (predictSettings.questionType === PredictQuestionType.MultipleChoice) {
        solutionToDisplay = '';
        const solutions = predictSettings.solution.split(',');
        for (const solution of solutions) {
          const index =
            predictSettings.multipleChoiceOptions?.indexOf(solution);
          if (index !== undefined && index !== -1) {
            solutionToDisplay += `${String.fromCharCode(
              65 + index
            )}. ${solution}\n`;
          }
        }
      }
      return (
        <div className={moduleStyles.predictSolutionContainer}>
          <Typography semanticTag="h1" visualAppearance="heading-sm">
            {codebridgeI18n.answer()}
          </Typography>
          <Typography semanticTag="p" visualAppearance="body-three">
            {solutionToDisplay}
          </Typography>
        </div>
      );
    }
  };

  return (
    <div>
      {showPredictSolution()}
      <TeacherOnlyMarkdown content={teacherMarkdown} hideContainer={true} />
    </div>
  );
};

export default ForTeachersOnly;
