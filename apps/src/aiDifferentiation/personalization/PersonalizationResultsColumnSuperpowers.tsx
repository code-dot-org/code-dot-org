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
      <div
        className={classNames(
          style.headerBlack,
          style.header,
          style.superpowersHeader
        )}
      >
        <Heading5 noMargin className={style.superpowersHeaderText}>
          {i18n.teachingStyleSuperpowers()}
        </Heading5>
      </div>
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
