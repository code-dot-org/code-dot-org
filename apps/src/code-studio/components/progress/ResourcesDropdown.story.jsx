import React from 'react';
import ResourcesDropdown from './ResourcesDropdown';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';

const legacySampleResources = [
  {
    type: ResourceType.curriculum,
    link: 'https://example.com/a'
  },
  {
    type: ResourceType.vocabulary,
    link: 'https://example.com/b'
  }
];

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

export default storybook =>
  storybook.storiesOf('ResourcesDropdown', module).addStoryTable([
    {
      name: 'unmigrated teacher resources',
      story: () => (
        <div>
          <ResourcesDropdown
            resources={legacySampleResources}
            useMigratedResources={false}
          />
        </div>
      )
    },
    {
      name: 'migrated teacher resources',
      story: () => (
        <div>
          <ResourcesDropdown
            migratedResources={migratedSampleResources}
            useMigratedResources={true}
          />
        </div>
      )
    },
    {
      name: 'migrated student resources',
      story: () => (
        <div>
          <ResourcesDropdown
            migratedResources={migratedSampleResources}
            useMigratedResources={true}
            studentFacing={true}
          />
        </div>
      )
    }
  ]);
