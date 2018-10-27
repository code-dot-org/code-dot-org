import React from 'react';
import DeleteAccountDialog from './DeleteAccountDialog';
import {action} from '@storybook/addon-actions';
import {getCheckboxes} from './DeleteAccountHelpers';

const PASSWORD = 'MY_PASSWORD';
const DELETE_VERIFICATION = 'DELETE MY ACCOUNT';

const DEFAULT_PROPS = {
  isOpen: true,
  isPasswordRequired: true,
  checkboxes: ({}),
  password: PASSWORD,
  deleteVerification: DELETE_VERIFICATION,
  onCheckboxChange: action('Checkbox'),
  onPasswordChange: action('Change password'),
  onDeleteVerificationChange: action('Verify'),
  onCancel: action('Cancel'),
  disableConfirm: false,
  deleteUser: action('Delete my Account')
};

export default storybook => {
  storybook
    .storiesOf('Dialogs/DeleteAccountDialog', module)
    .addStoryTable([
      {
        name: 'Delete Student Account',
        description: 'Warning message for student account deletion',
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={false}
            warnAboutDeletingStudents={false}
          />
        )
      },
      {
        name: 'Delete Teacher Account - without students',
        description: 'Warning message for teacher account deletion.',
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={true}
            warnAboutDeletingStudents={false}
          />
        )
      },
      {
        name: 'Delete Teacher Account - with students',
        description: 'Warning message for teacher account deletion.',
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={true}
            warnAboutDeletingStudents={true}
          />
        )
      },
      {
        name: 'Delete Teacher Account with students - 1 checkbox visible',
        description: `
        A teacher with students is only required to see/check
        the first checkbox to delete their account.
        `,
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={true}
            warnAboutDeletingStudents={true}
            checkboxes={getCheckboxes(false,true)}
          />
        )
      },
      {
        name: 'Delete Teacher Account with students - 5 checkboxes visible',
        description: `
        For a teacher that has students who depend on them to log in
        and is required to see/check all 5 checkboxes to delete their
        account.
        `,
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={true}
            warnAboutDeletingStudents={true}
            checkboxes={getCheckboxes(true)}
          />
        )
      },
    ]);
};
