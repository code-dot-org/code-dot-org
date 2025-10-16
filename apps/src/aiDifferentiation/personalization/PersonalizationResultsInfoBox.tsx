import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import style from './personalization-information.module.scss';

const PersonalizationResultsInfoBox: React.FC = () => {
  return (
    <div className={style.revealInfoBox}>
      <BodyThreeText>
        <strong>{i18n.teachingStyleDataBoxHeadline()}</strong>
      </BodyThreeText>
      <BodyThreeText>{i18n.teachingStyleDataBoxBody()}</BodyThreeText>
    </div>
  );
};

export default PersonalizationResultsInfoBox;
