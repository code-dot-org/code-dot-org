import React from 'react';
import DeleteAccountDialog from './DeleteAccountDialog';
import {action} from '@storybook/addon-actions';

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
        name: 'Delete Teacher Account',
        description: 'Warning message for teacher account deletion',
        story: () => (
          <DeleteAccountDialog
            {...DEFAULT_PROPS}
            isTeacher={true}
            warnAboutDeletingStudents={true}
          />
        )
      },
    ]);
};

