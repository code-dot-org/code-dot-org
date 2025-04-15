// Creates a definition for the Lab Snapshot component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LabSnapshotContentfulComponentDefinition: ComponentDefinition = {
  id: 'labSnapshot',
  name: 'Lab Snapshot',
  category: '04: Advanced',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/19yZ1MYtW4OTGM8Stz3XIz/01ca4f9c1be7ce150bf42275b07182bd/component_lab_snapshot_thumbnail.png',
  tooltip: {
    description:
      'Shows essential lab information, such as ages, what you can make, and compatibility, pulled directly from a lab entry.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/4fjwt72cQecN3RakUuZPBu/ed24d0f2ea15329268900e102f57c80f/component_lab_snapshot_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    label: {
      displayName: 'Aria Label',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    ages: {
      displayName: 'Ages',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    level: {
      displayName: 'Level',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    creation: {
      displayName: 'What you can make',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    devices: {
      displayName: 'Devices',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    browsers: {
      displayName: 'Browsers',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    accessibility: {
      displayName: 'Accessibility',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    languages: {
      displayName: 'Languages supported',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
  },
};
