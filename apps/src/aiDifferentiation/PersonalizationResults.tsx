import React from 'react';

import PersonalizationResultsColumnAiHelp from './PersonalizationResultsColumnAiHelp';
import PersonalizationResultsColumnSuperpowers from './PersonalizationResultsColumnSuperpowers';
import PersonalizationRevealHeader from './PersonalizationRevealHeader';
import PersonalizationRevealInfoBox from './PersonalizationRevealInfoBox';

import style from './personalization-information.module.scss';

// should this be somewhere else?
export interface TeachingStyle {
  name: string;
  emoji: string;
  tagline: string;
  teachingSuperpowers: string[];
}
interface PersonalizationResultsProps {
  teachingStyle: TeachingStyle;
}

const PersonalizationResults: React.FC<PersonalizationResultsProps> = ({
  teachingStyle,
}) => {
  return (
    <div className={style.revealContainer}>
      <PersonalizationRevealHeader teachingStyle={teachingStyle} />
      <div className={style.revealDetailsContainer}>
        <PersonalizationResultsColumnSuperpowers
          superpowers={teachingStyle.teachingSuperpowers}
        />
        <PersonalizationResultsColumnAiHelp aiHelpSuggestions={[]} />
      </div>
      <PersonalizationRevealInfoBox />
    </div>
  );
};

export default PersonalizationResults;
