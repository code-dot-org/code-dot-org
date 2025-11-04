import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationInformationBox from './PersonalizationInformationBox';

import style from './personalization-information.module.scss';

interface PersonalizationResultsColumnSuperpowersProps {
  superpowers: string[];
}

const PersonalizationResultsColumnSuperpowers: React.FC<
  PersonalizationResultsColumnSuperpowersProps
> = ({superpowers}) => {
  return (
    <div className={classNames(style.personaColumn, style.personaColumnYellow)}>
      <Typography
        className={classNames(style.headerBlack, style.header)}
        variant="h5"
        gutterBottom
      >
        {i18n.teachingStyleSuperpowers()}
      </Typography>
      {superpowers.map((superpower, index) => (
        <PersonalizationInformationBox
          key={index}
          information={superpower}
          type={'formatted'}
        />
      ))}
    </div>
  );
};

export default PersonalizationResultsColumnSuperpowers;
