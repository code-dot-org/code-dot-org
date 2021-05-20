import React from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {
  ADD_A_PERSONAL_LOGIN_HELP_URL,
  RELEASE_OR_DELETE_RECORDS_EXPLANATION
} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const TeacherWarning = () => {
  return (
    <div>
      <SafeMarkdown markdown={i18n.deleteAccount_teacherWarning()} />

      <SafeMarkdown
        markdown={i18n.deleteAccount_personalLoginInstructions({
          explanationUrl: ADD_A_PERSONAL_LOGIN_HELP_URL
        })}
      />
    </div>
  );
};

export const StudentWarning = () => {
  return <div>{i18n.deleteAccount_studentWarning()}</div>;
};

export const getCheckboxes = (dependedUponForLogin, hasStudents) => {
  let ids = [];
  if (dependedUponForLogin) {
    ids = TEACHER_DEPENDED_UPON_FOR_LOGIN_CHECKBOXES;
  } else if (hasStudents) {
    ids = TEACHER_WITH_STUDENTS_CHECKBOXES;
  }

  return _.pick(CHECKBOX_MAP, ids);
};

// Teacher that has students who depend on them to log in is required to see/check all 5 checkboxes to delete their account.
const TEACHER_DEPENDED_UPON_FOR_LOGIN_CHECKBOXES = [1, 2, 3, 4, 5];
// Teacher with students is only required to see/check the first checkbox to delete their account.
const TEACHER_WITH_STUDENTS_CHECKBOXES = [1];

const CHECKBOX_MAP = {
  1: {
    checked: false,
    label: (
      <span>
        <strong>{i18n.deleteAccountDialog_checkbox1_1()}</strong>
        {i18n.deleteAccountDialog_checkbox1_2()}
        <a
          href={RELEASE_OR_DELETE_RECORDS_EXPLANATION}
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.learnMore()}
        </a>
      </span>
    )
  },
  2: {
    checked: false,
    label: (
      <span>
        {i18n.deleteAccountDialog_checkbox2_1()}
        <a
          href={ADD_A_PERSONAL_LOGIN_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.deleteAccountDialog_checkbox2_2()}
        </a>
        {i18n.deleteAccountDialog_checkbox2_3()}
      </span>
    )
  },
  3: {
    checked: false,
    label: (
      <span>
        <SafeMarkdown markdown={i18n.deleteAccountDialog_checkbox3()} />
      </span>
    )
  },
  4: {
    checked: false,
    label: (
      <span>
        <SafeMarkdown markdown={i18n.deleteAccountDialog_checkbox4()} />
      </span>
    )
  },
  5: {
    checked: false,
    label: (
      <span>
        <SafeMarkdown markdown={i18n.deleteAccountDialog_checkbox5()} />
      </span>
    )
  }
};
