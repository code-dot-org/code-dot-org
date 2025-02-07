// Creates a definition for the Section component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const SectionContentfulComponentDefinition: ComponentDefinition = {
  id: 'section',
  name: 'Section',
  category: 'Page Structure',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/1DVXtxBlLLunOb1PrjRTqz/6bfd2cae987a5cf2dd0c211e677b5023/component_section_thumbnail.png',
  tooltip: {
    description:
      'A flexible content block for grouping text, media, and other components into a structured layout.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2u0fxxgU5ACOFA9Co8yHmG/a110e0c14e2ac0c065ffafeaebb32d58/component_section_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: true,
  variables: {
    backgroundColor: {
      displayName: 'Background color',
      type: 'Text',
      group: 'style',
      description: 'The background color of the section.',
      defaultValue: 'primary',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary (white)'},
          {value: 'secondary', displayName: 'Secondary (light gray)'},
          {value: 'dark', displayName: 'Dark (dark gray)'},
          {
            value: 'brandLightPrimary',
            displayName: 'Brand Light Primary (light teal)',
          },
          {
            value: 'brandLightSecondary',
            displayName: 'Brand Light Secondary (light purple)',
          },
        ],
      },
    },
    padding: {
      displayName: 'Padding',
      type: 'Text',
      group: 'style',
      description: 'Adds medium or large padding to the section.',
      defaultValue: 'l',
      validations: {
        in: [
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
  },
};
