import {Heading5} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
import React from 'react';

import PersonalizationInformationBox from './PersonalizationInformationBox';

import style from './personalization-information.module.scss';

const PersonalizationResultsColumnArrows: React.FC = () => {
  return (
    <div className={classnames(style.personaColumn, style.arrowColumn)}>
      <Heading5
        className={classnames(
          style.headerWhite,
          style.header,
          style.arrowHeader
        )}
      >
        {' '}
      </Heading5>
      <PersonalizationInformationBox type={'arrow'} />
      <PersonalizationInformationBox type={'arrow'} />
      <PersonalizationInformationBox type={'arrow'} />
    </div>
  );
};

export default PersonalizationResultsColumnArrows;
