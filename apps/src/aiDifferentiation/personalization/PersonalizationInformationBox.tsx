import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import arrowRight from './images/arrow-right.svg';

import style from './personalization-information.module.scss';
interface PersonalizationInformationBoxProps {
  information?: string;
  type?: 'regular' | 'formatted' | 'arrow';
}

const PersonalizationInformationBox: React.FC<
  PersonalizationInformationBoxProps
> = ({information, type = 'regular'}) => {
  const renderContent = () => {
    switch (type) {
      case 'formatted': {
        // Split on colon and make the part before bold
        if (information) {
          const parts = information.split(':');
          if (parts.length === 2) {
            return (
              <div className={style.boldedInformationBox}>
                <BodyThreeText>
                  <strong>{parts[0].trim()}</strong>
                </BodyThreeText>
                <BodyThreeText>{parts[1].trim()}</BodyThreeText>
              </div>
            );
          }
        }
        return <>{information}</>;
      }
      case 'arrow': {
        return <img src={arrowRight} alt={'arrow right'} />;
      }
      case 'regular':
      default:
        return <BodyThreeText>{information}</BodyThreeText>;
    }
  };

  return (
    <div className={type === 'arrow' ? style.arrowBox : style.informationBox}>
      {renderContent()}
    </div>
  );
};

export default PersonalizationInformationBox;
