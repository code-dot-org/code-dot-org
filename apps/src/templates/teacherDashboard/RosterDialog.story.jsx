import React from 'react';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';

import {stubRailsAuthenticityToken} from '../../../test/util/stubRailsAuthenticityToken';

import {UnconnectedRosterDialog as RosterDialog} from './RosterDialog';

export default {
  name: 'RosterDialog',
  component: RosterDialog,
  decorators: [dialogIsOpen, railsAuthenticityTokenIsStubbed],
};

const SelectSectionTemplate = args => (
  <RosterDialog
    rosterProvider={args.provider}
    classrooms={[
      {
        id: '123',
        name: 'New Test Classroom',
        section: 'Section 1',
        enrollment_code: '19uag24',
      },
      {
        id: '456',
        name: 'Other Test Classroom',
        section: 'Section 3A',
        enrollment_code: 't108sh5',
      },
      {
        id: '101',
        name: 'Intro to CS',
        section: 'Section A',
        enrollment_code: 'rt508yg',
      },
      {
        id: '102',
        name: 'Intro to CS',
        section: 'Section B',
        enrollment_code: '12gjl42',
      },
    ]}
  />
);

export const GoogleClassroomSelectSection = SelectSectionTemplate.bind({});
GoogleClassroomSelectSection.args = {
  provider: OAuthSectionTypes.google_classroom,
};

export const CleverClassroomSelectSection = SelectSectionTemplate.bind({});
CleverClassroomSelectSection.args = {provider: OAuthSectionTypes.clever};

const LoadingTemplate = args => <RosterDialog rosterProvider={args.provider} />;

export const GoogleClassroomLoading = LoadingTemplate.bind({});
GoogleClassroomLoading.args = {
  provider: OAuthSectionTypes.google_classroom,
};

export const CleverClassroomLoading = LoadingTemplate.bind({});
CleverClassroomLoading.args = {provider: OAuthSectionTypes.clever};

const NoSectionsFoundTemplate = args => (
  <RosterDialog rosterProvider={args.provider} classrooms={[]} />
);

export const GoogleClassroomNoSectionsFound = NoSectionsFoundTemplate.bind({});
GoogleClassroomNoSectionsFound.args = {
  provider: OAuthSectionTypes.google_classroom,
};

export const CleverClassroomNoSectionsFound = NoSectionsFoundTemplate.bind({});
CleverClassroomNoSectionsFound.args = {provider: OAuthSectionTypes.clever};

const LoadErrorTemplate = args => (
  <RosterDialog
    rosterProvider={args.provider}
    loadError={{status: 403, message: 'Sample error message.'}}
  />
);

export const GoogleClassroomLoadError = LoadErrorTemplate.bind({});
GoogleClassroomLoadError.args = {
  provider: OAuthSectionTypes.google_classroom,
};

export const CleverClassroomLoadError = LoadErrorTemplate.bind({});
CleverClassroomLoadError.args = {provider: OAuthSectionTypes.clever};

// Sets the isOpen prop to true for each story, so that the dialog is
// open by default when the story is viewed.
function dialogIsOpen(story) {
  return React.cloneElement(story(), {isOpen: true});
}

// Stubs the DOM-dependent behavior of the RailsAuthenticityToken component
function railsAuthenticityTokenIsStubbed(story) {
  stubRailsAuthenticityToken();
  return story();
}
