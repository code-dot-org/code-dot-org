import React from 'react';

import style from './personalization-information.module.scss';

interface PersonalizationInformationBoxProps {
  information: string;
}

const PersonalizationInformationBox: React.FC<
  PersonalizationInformationBoxProps
> = ({information}) => {
  return <div className={style.informationBox}>{information}</div>;
};

export default PersonalizationInformationBox;
