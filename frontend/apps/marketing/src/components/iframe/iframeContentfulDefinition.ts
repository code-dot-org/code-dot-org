// Creates a definition for the Iframe component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const IframeContentfulComponentDefinition: ComponentDefinition = {
  id: 'iframe',
  name: 'iFrame Block',
  category: '04: Advanced',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/1qy9FC9Bqb4ADrpyszIa5M/eb4c9dde9c1c90ab40036e8fa4412697/component_iframe_thumbnail.png',
  tooltip: {
    description:
      'Embed external content using an iframe. Ideal for embedding forms, interactive tools, or third-party widgets within a page.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/75ulYKJrhP83vfIre5Rm88/4a64acf16b04ac82f94dc0e6cb6c8b77/component_iframe_tooltip.png',
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
        bindingSourceType: ['entry', 'manual'],
      },
    },
    title: {
      displayName: 'Embedded content title (for accessibility and SEO)',
      type: 'Text',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    height: {
      displayName: 'Embed container height',
      type: 'Text',
      defaultValue: '500px',
      group: 'style',
    },
  },
};
