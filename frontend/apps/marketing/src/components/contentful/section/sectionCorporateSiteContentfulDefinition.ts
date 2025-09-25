// Creates a definition for the Section component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  sectionIdDefinition,
  sectionPaddingDefinition,
} from '@/components/common/definitions';

export const SectionCorporateSiteContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'section',
    name: 'Section (Use Me!)',
    category: '01: Page Sections',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/1DVXtxBlLLunOb1PrjRTqz/6bfd2cae987a5cf2dd0c211e677b5023/component_section_thumbnail.png',
    tooltip: {
      description:
        '** Use this component instead of the Section component in the "Structure" group at the top ** A flexible content block for grouping text, media, and other components into a structured layout.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/2u0fxxgU5ACOFA9Co8yHmG/a110e0c14e2ac0c065ffafeaebb32d58/component_section_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: true,
    variables: {
      background: {
        displayName: 'Background',
        type: 'Text',
        group: 'style',
        description: 'The background color of the section.',
        defaultValue: 'primary',
        validations: {
          in: [
            {value: 'primary', displayName: 'Primary (white)'},
            {value: 'secondary', displayName: 'Secondary (light gray)'},
            {value: 'dark', displayName: 'Dark gray'},
            {
              value: 'brandLightPrimary',
              displayName: 'Light teal',
            },
            {
              value: 'brandLightSecondary',
              displayName: 'Light purple',
            },
            {
              value: 'patternDark',
              displayName: 'Pattern dark',
            },
            {
              value: 'patternPrimary',
              displayName: 'Pattern teal',
            },
            {
              value: 'transparent',
              displayName: 'Transparent',
            },
          ],
        },
      },
      ...sectionPaddingDefinition,
      divider: {
        displayName: 'Bottom divider',
        type: 'Text',
        group: 'style',
        description: 'Adds a bottom divider to the section.',
        defaultValue: 'none',
        validations: {
          in: [
            {value: 'none', displayName: 'None'},
            {value: 'primary', displayName: 'Primary'},
            {value: 'strong', displayName: 'Strong'},
          ],
        },
      },
      ...sectionIdDefinition,
    },
  };
