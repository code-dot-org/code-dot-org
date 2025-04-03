// Creates a definition for the Curriculum Snapshot component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const CurriculumSnapshotContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'curriculumSnapshot',
    name: 'Curriculum Snapshot',
    category: '04: Advanced',
    thumbnailUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2EWViyGBTdt0mXADkbonFA/f77fc4788be65bc013d40c6965d782a4/component_curriculum_snapshot_thumbnail.png',
    tooltip: {
      description:
        'Displays key curriculum details at a glance, automatically pulled from a curriculum entry (e.g., grade level, devices).',
      imageUrl:
        'https://images.ctfassets.net/90t6bu6vlf76/79R7NhZ9XYliVAuQG7FPIt/8a96345c99647bb35e3a03195cec34db/component_curriculum_snapshot_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    variables: {
      grades: {
        displayName: 'Grades',
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
      duration: {
        displayName: 'Duration',
        type: 'Array',
        group: 'content',
        validations: {
          bindingSourceType: ['entry'],
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
      topics: {
        displayName: 'Topics',
        type: 'Array',
        group: 'content',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
      programmingTools: {
        displayName: 'Programming Tools',
        type: 'Array',
        group: 'content',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
      professionalLearning: {
        displayName: 'Professional Learning',
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
      languagesSupported: {
        displayName: 'Languages supported',
        type: 'Array',
        group: 'content',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
    },
  };
