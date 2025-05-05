// Creates a definition for the FAQ Accordion component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const FAQAccordionContentfulComponentDefinition: ComponentDefinition = {
  id: 'faqAccordion',
  name: 'FAQ Accordion',
  category: '04: Advanced',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2T9oZuMVAKZ0HHTJB80ftF/e81cf4131a6580d1edd86c98e0539bfe/component_faq_thumbnail.png',
  tooltip: {
    description:
      'A collapsible list for organizing frequently asked questions.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/4ukyPBibtqgkevBelS8CzJ/c4691dd48e5cff1242591c459ee32560/component_faq_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    faqs: {
      displayName: 'FAQs',
      type: 'Array',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
  },
};
