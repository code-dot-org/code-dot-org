import React from 'react';
import {action} from '@storybook/addon-actions';
import WorkshopAssignmentSelect from './workshop_assignment_select';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('WorkshopAssignmentSelect', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'SummerWorkshopAssignment for single workshops',
        story: () => (
          <WorkshopAssignmentSelect
            workshops={
              [
                {
                  value: 1,
                  label: 'Dec 10, Seattle, WA'
                },
                {
                  value: 2,
                  label: 'Dec 15, Buffalo NY'
                },
                {
                  value: 3,
                  label: 'Dec 20, Philadelphia PA'
                }
              ]
            }
            assignedWorkshopId={1}
            onChange={action('selection changed')}
            editing={true}
            canYouAttendQuestion={"Can you attend your assigned workshop of Dec 10, Seattle WA?"}
            canYouAttendAnswer={"Yes"}
          />
        )
      }
    ]);
};
