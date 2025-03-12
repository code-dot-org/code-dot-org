// Creates a definition for the Iframe component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const IframeContentfulComponentDefinition: ComponentDefinition = {
  id: 'iframe',
  name: 'iFrame',
  category: 'Advanced',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/1qy9FC9Bqb4ADrpyszIa5M/5e791afb110fc5bc8caa95710c1dea16/component_code_thumbnail.png',
  tooltip: {
    description:
      'Embed external content using an iframe. Ideal for embedding videos, interactive tools, or third-party widgets within a page.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/75ulYKJrhP83vfIre5Rm88/8e94a8b30dc113217b6399f19ebaf3c1/component_code_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    src: {
      displayName: 'Embedded content URL',
      type: 'Text',
      group: 'content',
      validations: {
        required: true,
      },
    },
    title: {
      displayName: 'Embedded content title (for accessibility and SEO)',
      type: 'Text',
      group: 'content',
      validations: {
        required: true,
      },
    },
    height: {
      displayName: 'Embed container height',
      type: 'Text',
      defaultValue: '100%',
      group: 'style',
    },
    width: {
      displayName: 'Embed container width',
      type: 'Text',
      defaultValue: '100%',
      group: 'style',
    },
  },
};
