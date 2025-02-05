// Creates a definition for the Video component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const SectionContentfulComponentDefinition: ComponentDefinition = {
  id: 'section',
  name: 'Section',
  category: 'Custom Components',
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
            value: 'brand-light-primary',
            displayName: 'Brand Light Primary (light teal)',
          },
          {
            value: 'brand-light-secondary',
            displayName: 'Brand Light Secondary (light purple)',
          },
        ],
      },
    },
    backgroundImage: {
      displayName: 'Background image',
      type: 'Text',
      group: 'style',
      description: 'The background image of the section.',
    },
    backgroundImageRepeat: {
      displayName: 'Repeat background image (if image is a pattern).',
      type: 'Boolean',
      group: 'style',
      description: 'Sets whether the background image repeats.',
      defaultValue: true,
    },
    backgroundSize: {
      displayName: 'Background image size',
      type: 'Text',
      group: 'style',
      description:
        'Sets whether the background image is contained or covers the section.',
      defaultValue: 'contain',
      validations: {
        in: [
          {value: 'contain', displayName: 'Contain'},
          {value: 'cover', displayName: 'Cover'},
        ],
      },
    },
    padding: {
      displayName: 'Padding',
      type: 'Text',
      group: 'style',
      description:
        'Sets whether the background image is contained or covers the section.',
      defaultValue: 'l',
      validations: {
        in: [
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
    alignment: {
      displayName: 'Content alignment',
      type: 'Text',
      group: 'style',
      description: 'Aligns content to the left or center',
      defaultValue: 'left',
      validations: {
        in: [
          {value: 'left', displayName: 'Left'},
          {value: 'center', displayName: 'Center'},
        ],
      },
    },
    children: {
      displayName: 'Children',
      type: 'Object',
      group: 'content',
      description: 'Nests other components inside the section.',
    },
  },
};
