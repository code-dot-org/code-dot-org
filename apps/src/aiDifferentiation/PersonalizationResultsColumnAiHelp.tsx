import {Heading5} from '@code-dot-org/component-library/typography';
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
    <div className={style.header}>
      <Heading5 className={style.headerWhite}>
        {i18n.teachingStyleHowAiHelps}
      </Heading5>
      <PersonalizationInformationBox information="Information Box 1" />
      <PersonalizationInformationBox information="Information Box 2" />
      <PersonalizationInformationBox information="Information Box 3" />
    </div>
  );
};

export default PersonalizationResultsColumnAiHelp;
