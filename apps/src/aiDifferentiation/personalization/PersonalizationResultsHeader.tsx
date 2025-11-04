import {Typography} from '@mui/material';
import React from 'react';

import {TeachingStyle} from './personalization_types';

import style from './personalization-information.module.scss';

interface PersonalizationResultsHeaderProps {
  teachingStyle: TeachingStyle;
}

const PersonalizationResultsHeader: React.FC<
  PersonalizationResultsHeaderProps
> = ({teachingStyle}) => {
  return (
    <div className={style.revealHeader}>
      <Typography variant="overline2" gutterBottom>
        Your teaching style is
      </Typography>
      <Typography className="persona-text" variant="h1" gutterBottom>
        {teachingStyle.name}
      </Typography>
      <Typography className="potential-text" variant="body2" gutterBottom>
        <span className="icon">{teachingStyle.emoji}</span>{' '}
        {teachingStyle.tagline}
      </Typography>
    </div>
  );
};

export default PersonalizationResultsHeader;
