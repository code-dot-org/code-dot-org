// Creates a definition for the Section component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ActionBlockContentfulComponentDefinition: ComponentDefinition = {
  id: 'actionBlock',
  name: 'Action Block',
  category: '03: Basic',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/AHRiLWYa6NruVlsM61hbn/8dc5d6ba056e81df347445738fb8cd5c/component_actionblock_thumbnail.png',
  tooltip: {
    description:
      'A flexible card for highlighting curriculum, resources, or other key content. Supports text, media, CTAs, and multiple layouts.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/5cjcKrwgMCHaJxEK48xN2B/75599dc0fab6fb3a0cae8c2fb963827b/component_actionblock_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    overline: {
      displayName: 'Overline',
      type: 'Text',
      group: 'content',
      description: 'The overline of the action block.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      description: 'The title of the action block.',
      defaultValue: 'Action Block Title',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    description: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      description: 'The description of the action block.',
      defaultValue: 'Action block description goes here.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    image: {
      displayName: 'Image',
      type: 'Media',
      group: 'content',
      description: 'The image to display in the action block.',
      validations: {
        bindingSourceType: ['entry', 'asset'],
      },
    },
    detailLabel: {
      displayName: 'Detail label',
      type: 'Text',
      group: 'content',
      description: 'The detail label, like "Duration".',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    detailDescription: {
      displayName: 'Detail description',
      type: 'Text',
      group: 'content',
      description: 'The detail description, like "1 hour".',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    primaryButtonText: {
      displayName: 'Primary button text',
      type: 'Text',
      group: 'content',
      description: 'The primary button of the action block.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    primaryButtonHref: {
      displayName: 'Primary button url',
      type: 'Text',
      group: 'content',
      description: 'The primary button url.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    primaryButtonAriaLabel: {
      displayName: 'Primary button aria label',
      type: 'Text',
      group: 'content',
      description: 'The primary button aria label.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    secondaryButtonText: {
      displayName: 'Secondary button text',
      type: 'Text',
      group: 'content',
      description: 'The secondary button of the action block.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    secondaryButtonHref: {
      displayName: 'Secondary button url',
      type: 'Text',
      group: 'content',
      description: 'The secondary button url.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    secondaryButtonAriaLabel: {
      displayName: 'Secondary button aria label',
      type: 'Text',
      group: 'content',
      description: 'The secondary button aria label.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    background: {
      displayName: 'Background',
      type: 'Text',
      group: 'style',
      description: 'The background color of the action block.',
      defaultValue: 'primary',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary (light gray)'},
          {value: 'secondary', displayName: 'Secondary (white)'},
        ],
      },
    },
  },
};
