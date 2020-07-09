import React from 'react';
import {UnconnectedRosterDialog as RosterDialog} from './RosterDialog';
import {OAuthSectionTypes} from './shapes';

export default storybook => {
  storybook = storybook
    .storiesOf('Dialogs/RosterDialog', module)
    .addDecorator(dialogIsOpen);

  // Add stories for every provider type
  [OAuthSectionTypes.google_classroom, OAuthSectionTypes.clever].forEach(
    provider => {
      storybook = storybook
        .add(`${provider}: Select a section`, () => (
          <RosterDialog
            rosterProvider={provider}
            classrooms={[
              {
                id: '123',
                name: 'New Test Classroom',
                section: 'Section 1',
                enrollment_code: '19uag24'
              },
              {
                id: '456',
                name: 'Other Test Classroom',
                section: 'Section 3A',
                enrollment_code: 't108sh5'
              },
              {
                id: '101',
                name: 'Intro to CS',
                section: 'Section A',
                enrollment_code: 'rt508yg'
              },
              {
                id: '102',
                name: 'Intro to CS',
                section: 'Section B',
                enrollment_code: '12gjl42'
              }
            ]}
          />
        ))
        .add(`${provider}: Loading...`, () => (
          <RosterDialog rosterProvider={provider} />
        ))
        .add(`${provider}: No sections found`, () => (
          <RosterDialog rosterProvider={provider} classrooms={[]} />
        ))
        .add(`${provider}: Load error`, () => (
          <RosterDialog
            rosterProvider={provider}
            loadError={{status: 403, message: 'Sample error message.'}}
          />
        ));
    }
  );
  return storybook;
};

// Sets the isOpen prop to true for each story, so that the dialog is
// open by default when the story is viewed.
function dialogIsOpen(story) {
  return React.cloneElement(story(), {isOpen: true});
}
