import React, {useState} from 'react';

import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';

import Checkbox from '../componentLibrary/checkbox/Checkbox';

import style from './finish-teacher-account.module.scss';

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
}> = ({usIp}) => {
  const [name, setName] = useState('');
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
  };

  const onEmailOptInChange = (): void => {
    setEmailOptInChecked(!emailOptInChecked);
  };

  return (
    <div className={style.finishTeacherAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_teacher_account_title()}</Heading2>
        <BodyTwoText>{locale.finish_teacher_account_subtitle()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText
          className={style.labelText}
          visualAppearance={'heading-xs'}
        >
          {locale.account_name_input()}
        </BodyTwoText>
        <input
          type="text"
          name="[user][name]"
          onChange={onNameChange}
          value={name}
        />
        <BodyThreeText>
          {locale.finish_teacher_account_name_input_desc()}
        </BodyThreeText>
        <SchoolDataInputs usIp={usIp} includeHeaders={false} />
        <div className={style.emailOptInContainer}>
          <BodyTwoText
            className={style.labelText}
            visualAppearance={'heading-xs'}
          >
            {locale.stay_updated_email_opt_in()}
          </BodyTwoText>
          <span className={style.emailOptInCheckboxContainer}>
            <div className={style.emailOptInCheckbox}>
              <Checkbox
                label=""
                checked={emailOptInChecked}
                onChange={onEmailOptInChange}
                name="[user][emailOptIn]"
              />
            </div>
            <BodyTwoText
              className={style.emailOptInLabel}
              visualAppearance={'body-two'}
            >
              {locale.stay_updated_email_opt_in_desc()}
            </BodyTwoText>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinishTeacherAccount;
