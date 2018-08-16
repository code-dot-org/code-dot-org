import React from 'react';
import ConfirmRemoveStudentDialog, {MINIMUM_TEST_PROPS} from './ConfirmRemoveStudentDialog';

const STORY_PROPS = {
  ...MINIMUM_TEST_PROPS,
  hideBackdrop: true,
};

export default storybook => storybook
  .storiesOf('ConfirmRemoveStudentDialog', module)
  .addStoryTable([
    {
      name:'For a student who has never signed in',
      description: `
        Removing a student who has never signed in incurs no risk
        of losing access to data for the student or the school, so the
        warning dialog can be minimal.
        `,
      story: () => (
        <ConfirmRemoveStudentDialog
          {...STORY_PROPS}
          hasEverSignedIn={false}
        />
      )
    }, {
      name:'For a student who has signed in',
      description: `
        Removing a student who has signed in may give the student the ability
        to delete their account, which would result in destruction of school
        records. Therefore, we show a scary warning.
        `,
      story: () => (
        <ConfirmRemoveStudentDialog
          {...STORY_PROPS}
          hasEverSignedIn={true}
        />
      )
    }, {
      name:'For a student who depends on this section to sign in',
      description: `
        If the student is in a word / picture section and doesn’t have a
        personal login and isn’t in another teacher’s section, display
        help for creating a personal login.
        `,
      story: () => (
        <ConfirmRemoveStudentDialog
          {...STORY_PROPS}
          hasEverSignedIn={true}
          dependsOnThisSectionForLogin={true}
        />
      )
    }
  ]);
