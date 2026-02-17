import {Typography} from '@mui/material';
import React from 'react';

import arrowRight from './../images/arrow-right.svg';

import style from '../personalization-information.module.scss';
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
                <Typography variant="body3">
                  <strong>{parts[0].trim()}</strong>
                </Typography>
                <Typography className={style.lightText} variant="body3">
                  {parts[1].trim()}
                </Typography>
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
        return (
          <Typography className={style.lightText} variant="body3">
            {information}
          </Typography>
        );
    }
  };

  return (
    <div className={type === 'arrow' ? style.arrowBox : style.informationBox}>
      {renderContent()}
    </div>
  );
};

export default PersonalizationInformationBox;
