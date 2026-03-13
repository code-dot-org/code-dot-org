import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import {TeachingStyle} from './../../personalization_types';

import style from './../../personalization-information.module.scss';

interface PersonalizationResultsHeaderProps {
  teachingStyle: TeachingStyle;
}

const PersonalizationResultsHeader: React.FC<
  PersonalizationResultsHeaderProps
> = ({teachingStyle}) => {
  return (
    <div className={style.revealHeader}>
      <Typography className={style.lightText} variant="overline2">
        {i18n.teachingStyleIs()}
      </Typography>
      <Typography variant="h1">{teachingStyle.name}</Typography>
      <Typography className={style.lightText} variant="body2">
        <span>{teachingStyle.emoji}</span> {teachingStyle.tagline}
      </Typography>
    </div>
  );
};

export default PersonalizationResultsHeader;
