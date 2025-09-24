import {
  OverlineTwoText,
  BodyTwoText,
  Heading1,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {TeachingStyle} from './PersonalizationResults';

import style from './personalization-information.module.scss';

interface PersonalizationRevealHeaderProps {
  teachingStyle: TeachingStyle;
}

const PersonalizationRevealHeader: React.FC<
  PersonalizationRevealHeaderProps
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

export default PersonalizationRevealHeader;
