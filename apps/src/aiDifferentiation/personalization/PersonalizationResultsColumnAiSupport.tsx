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
      <div className={classnames(style.header, style.aiCanHelpHeader)}>
        <Heading5 noMargin className={style.aiCanHelpText}>
          {i18n.teachingStyleHowAiHelps()}
        </Heading5>
      </div>
      {aiHelpSuggestions.map((suggestion, index) => (
        <PersonalizationInformationBox key={index} information={suggestion} />
      ))}
    </div>
  );
};

export default PersonalizationResultsColumnAiHelp;
