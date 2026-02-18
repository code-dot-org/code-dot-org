import {Typography} from '@mui/material';
import classnames from 'classnames';
import React from 'react';

import PersonalizationInformationBox from './../PersonalizationInformationBox';

import style from './../../personalization-information.module.scss';

const PersonalizationResultsColumnArrows: React.FC = () => {
  return (
    <div className={classnames(style.personaColumn, style.arrowColumn)}>
      <Typography
        className={classnames(
          style.headerWhite,
          style.header,
          style.arrowHeader
        )}
        variant="h5"
        gutterBottom
      >
        {' '}
      </Typography>
      <PersonalizationInformationBox type={'arrow'} />
      <PersonalizationInformationBox type={'arrow'} />
      <PersonalizationInformationBox type={'arrow'} />
    </div>
  );
};

export default PersonalizationResultsColumnArrows;
