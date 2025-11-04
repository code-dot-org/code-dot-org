import {Typography} from '@mui/material';
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
      <Typography
        className={classnames(style.headerWhite, style.header)}
        variant="h5"
        gutterBottom
      >
        {i18n.teachingStyleHowAiHelps()}
      </Typography>
      {aiHelpSuggestions.map((suggestion, index) => (
        <PersonalizationInformationBox key={index} information={suggestion} />
      ))}
    </div>
  );
};

export default PersonalizationResultsColumnAiHelp;
