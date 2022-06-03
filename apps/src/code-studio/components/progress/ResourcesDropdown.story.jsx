import React from 'react';
import ResourcesDropdown from './ResourcesDropdown';
import {allowConsoleWarnings} from '../../../../test/util/testUtils';

const migratedSampleResources = [
  {
    key: 'key1',
    name: 'Curriculum',
    url: 'https://example.com/a'
  },
  {
    key: 'key2',
    name: 'Vocabulary',
    url: 'https://example.com/b'
  }
];

export default storybook => {
  if (IN_UNIT_TEST) {
    allowConsoleWarnings();
  }

  storybook.storiesOf('ResourcesDropdown', module).addStoryTable([
    {
      name: 'migrated teacher resources',
      story: () => (
        <div>
          <ResourcesDropdown migratedResources={migratedSampleResources} />
        </div>
      )
    },
    {
      name: 'migrated student resources',
      story: () => (
        <div>
          <ResourcesDropdown
            migratedResources={migratedSampleResources}
            studentFacing={true}
          />
        </div>
      )
    }
  ]);
};
