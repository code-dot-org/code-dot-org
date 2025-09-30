import React from 'react';

import {TeachingStyle} from './personalization_types';
import PersonalizationResultsColumnAiHelp from './PersonalizationResultsColumnAiSupport';
import PersonalizationResultsColumnArrows from './PersonalizationResultsColumnArrows';
import PersonalizationResultsColumnSuperpowers from './PersonalizationResultsColumnSuperpowers';
import PersonalizationResultsHeader from './PersonalizationResultsHeader';
import PersonalizationResultsInfoBox from './PersonalizationResultsInfoBox';

import style from './personalization-information.module.scss';
interface PersonalizationResultsProps {
  teachingStyle: TeachingStyle;
}

const PersonalizationResults: React.FC<PersonalizationResultsProps> = ({
  teachingStyle,
}) => {
  return (
    <div className={style.revealContainer}>
      <PersonalizationResultsHeader teachingStyle={teachingStyle} />
      <div className={style.revealDetailsContainer}>
        <PersonalizationResultsColumnSuperpowers
          superpowers={teachingStyle.teachingSuperpowers}
        />
        <PersonalizationResultsColumnArrows />
        <PersonalizationResultsColumnAiHelp
          aiHelpSuggestions={
            teachingStyle.howAiHelps ? teachingStyle.howAiHelps : []
          }
        />
      </div>
      <PersonalizationResultsInfoBox />
    </div>
  );
};

export default PersonalizationResults;
