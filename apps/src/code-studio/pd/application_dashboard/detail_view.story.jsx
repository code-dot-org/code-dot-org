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
              name: 'Rubeus Hagrid',
              totalScore: 42,
              acceptance: 'accepted',
              locked: 'locked',
              title: 'Groundskeeper',
              accountEmail: 'hagrid@hogwarts.edu',
              phone: '867-5309',
              district: 'Ministry of Magic Department of Education',
              school: 'Hogwarts',
              course: 'CS Principles',
              regionalPartner: 'Order of the Phoenix'
            }}
          />
        )
      }
    ]);
};
