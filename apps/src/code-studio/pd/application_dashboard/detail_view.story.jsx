import React from 'react';
import {DetailViewContents} from './detail_view';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('DetailViewContents', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Detail view for applications',
        story: () => (
          <DetailViewContents
            applicationData={{
              regionalPartner: 'partner',
              notes: 'notes',
              status: 'unreviewed',
              school_name: 'School Name',
              district_name: 'District Name',
              email: 'email',
              formData: {
                firstName: 'First Name',
                lastName: 'Last Name',
                title: 'Title',
                phone: 'Phone',
                preferredFirstName: 'Preferred First Name',
                accountEmail: 'accountEmail',
                alternateEmail: 'alternateEmail',
                program: 'program',
                planOnTeachering: ['Yes'],
                abilityToMeetRequirements: '10'
              }
            }}
          />
        )
      }
    ]);
};
