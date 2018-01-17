import React from 'react';
import SummerWorkshopAssignment from './summer_workshop_assignment';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('SummerWorkshopAssignment', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'SummerWorkshopAssignment for single workshops',
        story: () => (
          <SummerWorkshopAssignment
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
            assignedWorkshop={{
              value: 1,
              label: 'Dec 10, Seattle, WA'
            }}
            onChange={() => {}}
            editing={true}
            canYouAttendQuestion={"Can you attend your assigned workshop of Dec 10, Seattle WA?"}
            canYouAttendAnswer={"Yes"}
          />
        )
      }, {
        name: 'SummerWorkshopAssignment for multiple workshops',
        story: () => (
          <SummerWorkshopAssignment
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
            assignedWorkshop={{
              value: 1,
              label: 'Dec 10, Seattle, WA'
            }}
            onChange={() => {}}
            editing={true}
            canYouAttendQuestion={"Which of these workshops can you attend?"}
            canYouAttendAnswer={['Dec 10, Seattle WA', 'Dec 15, Buffalo NY']}
          />
        )
      }
    ]);
};
