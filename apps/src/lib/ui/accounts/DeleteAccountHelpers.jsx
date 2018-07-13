import React from 'react';
import i18n from '@cdo/locale';
import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';

export const TeacherWarning = () => {
  return (
    <div>
      <p>
        {i18n.deleteAccount_teacherWarning1()}
        <strong>{i18n.deleteAccount_teacherWarning2()}</strong>
        {i18n.deleteAccount_teacherWarning3()}
      </p>
      <p>
        {i18n.deleteAccount_teacherWarning4()}
        <a
          href={ADD_A_PERSONAL_LOGIN_HELP_URL}
          target="_blank"
        >
          {i18n.deleteAccount_teacherWarning5()}
        </a>
        {i18n.deleteAccount_teacherWarning6()}
      </p>
    </div>
  );
};

export const StudentWarning = () => {
  return (
    <div>{i18n.deleteAccount_studentWarning()}</div>
  );
};

export const getLabelForCheckbox = (id) => {
  switch (id) {
    case 1:
      return (
        <span>
          <strong>{i18n.deleteAccountDialog_checkbox1_1()}</strong>
          {i18n.deleteAccountDialog_checkbox1_2()}
        </span>
      );
    case 2:
      return (
        <span>
          {i18n.deleteAccountDialog_checkbox2_1()}
          <a href={ADD_A_PERSONAL_LOGIN_HELP_URL} target="_blank">
            {i18n.deleteAccountDialog_checkbox2_2()}
          </a>
          {i18n.deleteAccountDialog_checkbox2_3()}
        </span>
      );
    case 3:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox3()}</strong>
        </span>
      );
    case 4:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox4()}</strong>
        </span>
      );
    case 5:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox5()}</strong>
        </span>
      );
  }
};
