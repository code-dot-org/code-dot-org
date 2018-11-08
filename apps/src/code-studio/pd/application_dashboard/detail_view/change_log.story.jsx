import React from 'react';
import ChangeLog from './change_log';
import reactBootstrapStoryDecorator from '../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('ChangeLog', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Change log',
        story: () => (
          <ChangeLog
            changeLog={[
              {time: '2018-06-01 12:00 PDT', title: 'Unreviewed', changing_user: ''},
              {time: '2018-06-02 12:00 PDT', title: 'Pending', changing_user: 'Some User'},
              {time: '2018-012-01 12:00 PST', title: 'Accepted', changing_user: 'Some User'}
            ]}
          />
        )
      }
    ]);
};
