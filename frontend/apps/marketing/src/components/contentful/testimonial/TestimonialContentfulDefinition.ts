// Creates a definition for the Testimonial component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {TESTIMONIAL_CONTENTFUL_BACKGROUNDS} from './Testimonial';

export const TestimonialContentfulComponentDefinition: ComponentDefinition = {
  id: 'testimonial',
  name: 'Testimonial',
  category: '01: Page Sections',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/9eiEP6drbPBTvowkDxVjw/5fafd6193287e86b7175df7139e3987e/component_testimonial_thumbnail.png',
  tooltip: {
    description:
      'A pre-styled section for quotes, making it easy to highlight endorsements or user feedback and add social proof to your page.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/0jaKzwmJeB8ZoxCpzpn2j/d656a4b0690a2fe2ac13d1dbbb7c667a/component_testimonial_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    background: {
      displayName: 'Background',
      type: 'Text',
      group: 'style',
      description: 'The background of the testimonial.',
      defaultValue: TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_DARK,
      validations: {
        required: true,
        in: Object.values(TESTIMONIAL_CONTENTFUL_BACKGROUNDS).map(
          background => ({
            value: background,
            displayName: background,
          }),
        ),
      },
    },
    quote: {
      displayName: 'Quote',
      type: 'Text',
      group: 'content',
      description: 'The testimonial quote',
      defaultValue: 'Testimonial quote',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    source: {
      displayName: 'Author',
      type: 'Text',
      group: 'content',
      description: 'The testimonial author or source',
      defaultValue: 'Testimonial author',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    context: {
      displayName: 'Title/position',
      type: 'Text',
      group: 'content',
      description: "The testimonial author's title or context",
      validations: {
        required: false,
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
