import {Heading5} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationInformationBox from './PersonalizationInformationBox';

import style from './personalization-information.module.scss';

interface PersonalizationResultsColumnAiHelpProps {
  aiHelpSuggestions: string[];
}

const PersonalizationResultsColumnAiHelp: React.FC<
  PersonalizationResultsColumnAiHelpProps
> = ({aiHelpSuggestions}) => {
  return (
    <div className={classnames(style.personaColumn, style.personaColumnBlack)}>
      <Heading5 className={classnames(style.headerWhite, style.header)}>
        {i18n.teachingStyleHowAiHelps()}
      </Heading5>
      {aiHelpSuggestions.map((suggestion, index) => (
        <PersonalizationInformationBox key={index} information={suggestion} />
      ))}
    </div>
  );
};

export default PersonalizationResultsColumnAiHelp;
