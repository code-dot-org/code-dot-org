import React, {useState} from 'react';

import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
// import getScriptData from '@cdo/apps/util/getScriptData';
// import i18n from '@cdo/locale';

import style from './finish-teacher-account.module.scss';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
// interface SignupScriptData {
//   usIp: boolean;
// }
// const scriptData = getScriptData('signup') as SignupScriptData;
// const {usIp} = scriptData;




const FinishTeacherAccount: React.FunctionComponent = () => {
  const [name, setName] = useState('');

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
    console.log(`New name: ${newName}`);
  };

  return (
    <div className={style.finishTeacherAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{"Finish creating your teacher account"}</Heading2>
        <BodyTwoText>{"Tailor your Code.org experience with a few details."}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText
          className={style.labelText}
          visualAppearance={'heading-xs'}
        >
          {"What do you want to be called on Code.org?*"}
        </BodyTwoText>
        <input
          type="text"
          name={'[user][name]'}
          onChange={onNameChange}
          value={name}
        />
        <BodyThreeText>{"This is what your students will see."}</BodyThreeText>
        <SchoolDataInputs
          usIp={true}
          includeHeaders={false}
          overrideStyles={style}
        />
      </div>
    </div>
  );
};

export default FinishTeacherAccount;
