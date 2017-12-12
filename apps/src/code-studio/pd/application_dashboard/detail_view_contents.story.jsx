import React from 'react';
import { DetailViewContents } from './detail_view_contents';
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
            applicationId="1"
            applicationData={{
              regionalPartner: 'partner',
              notes: 'notes',
              status: 'unreviewed',
              school_name: 'School Name',
              district_name: 'District Name',
              email: 'email',
              application_type: 'Facilitator',
              meets_criteria: 'Yes',
              bonus_points: 15,
              form_data: {
                firstName: 'First Name',
                lastName: 'Last Name',
                title: 'Title',
                phone: 'Phone',
                preferredFirstName: 'Preferred First Name',
                accountEmail: 'accountEmail',
                alternateEmail: 'alternateEmail',
                program: 'program',
                planOnTeaching: ['Yes'],
                abilityToMeetRequirements: '10'
              }
            }}
            viewType="facilitator"
            reload={() => {}}
          />
        )
      }
    ]);
};
