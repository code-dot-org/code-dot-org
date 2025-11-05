import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import style from './../../personalization-information.module.scss';

const PersonalizationResultsInfoBox: React.FC = () => {
  return (
    <div className={style.revealInfoBox}>
      <BodyThreeText noMargin>
        <strong>{i18n.teachingStyleDataBoxHeadline()}</strong>
      </BodyThreeText>
      <BodyThreeText className={style.lightText}>
        {i18n.teachingStyleDataBoxBody()}
      </BodyThreeText>
    </div>
  );
};

export default PersonalizationResultsInfoBox;
