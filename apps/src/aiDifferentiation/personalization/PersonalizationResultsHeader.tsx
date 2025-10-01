import {
  OverlineTwoText,
  BodyTwoText,
  Heading1,
} from '@code-dot-org/component-library/typography';
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
      <OverlineTwoText>Your teaching style is</OverlineTwoText>
      <Heading1 className="persona-text">{teachingStyle.name}</Heading1>
      <BodyTwoText className="potential-text">
        <span className="icon">{teachingStyle.emoji}</span>{' '}
        {teachingStyle.tagline}
      </BodyTwoText>
    </div>
  );
};

export default PersonalizationResultsHeader;
