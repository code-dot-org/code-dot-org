import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import style from './../../personalization-information.module.scss';

const PersonalizationResultsInfoBox: React.FC = () => {
  return (
    <div className={style.revealInfoBox}>
      <Typography variant="body3">
        <strong>{i18n.teachingStyleDataBoxHeadline()}</strong>
      </Typography>
      <Typography className={style.lightText} variant="body3" gutterBottom>
        {i18n.teachingStyleDataBoxBody()}
      </Typography>
    </div>
  );
};

export default PersonalizationResultsInfoBox;
