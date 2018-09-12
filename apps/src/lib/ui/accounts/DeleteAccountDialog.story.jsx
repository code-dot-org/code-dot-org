import React from 'react';
import DeleteAccountDialog from './DeleteAccountDialog';

const PASSWORD = 'MY_PASSWORD';
const DELETE_VERIFICATION = 'DELETE MY ACCOUNT';

export default storybook => {
  storybook
    .storiesOf('Dialogs/DeleteAccountDialog', module)
    .addStoryTable([
      {
        name: 'Delete Student Account',
        description: 'Warning message for student account deletion',
        story: () => (
          <DeleteAccountDialog
            isOpen={true}
            isTeacher={false}
            isPasswordRequired={true}
            warnAboutDeletingStudents={false}
            checkboxes={({})}
            password={PASSWORD}
            deleteVerification={DELETE_VERIFICATION}
            onCheckboxChange={() => {}}
            onPasswordChange={() => {}}
            onDeleteVerificationChange={() => {}}
            onCancel={() => {}}
            disableConfirm={false}
            deleteUser={() => console.log("Delete my Account")}
          />
        )
      },
      {
        name: 'Delete Teacher Account',
        description: 'Warning message for teacher account deletion',
        story: () => (
          <DeleteAccountDialog
            isOpen={true}
            isTeacher={true}
            isPasswordRequired={true}
            warnAboutDeletingStudents={true}
            checkboxes={({})}
            password={PASSWORD}
            deleteVerification={DELETE_VERIFICATION}
            onCheckboxChange={() => {}}
            onPasswordChange={() => {}}
            onDeleteVerificationChange={() => {}}
            onCancel={() => {}}
            disableConfirm={false}
            deleteUser={() => console.log("Delete my Account")}
          />
        )
      },
    ]);
};

