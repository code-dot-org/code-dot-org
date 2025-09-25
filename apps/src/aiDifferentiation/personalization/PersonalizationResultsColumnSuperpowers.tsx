import {Heading5} from '@code-dot-org/component-library/typography';
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
      <Heading5 className={classNames(style.headerBlack, style.header)}>
        {i18n.teachingStyleSuperpowers()}
      </Heading5>
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
